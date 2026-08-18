import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import firebaseConfig from './firebase-applet-config.json';

const app = express();
const PORT = process.env.PORT || 3004;

// Simple custom in-memory rate limiter
const ipCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LIMIT = 100; // max 100 requests per 15 mins per IP

function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = ipCache.get(ip);

  if (!clientData || now > clientData.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (clientData.count >= MAX_LIMIT) {
    return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
  }

  clientData.count++;
  next();
}

// Simple custom security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy allowing local assets & firebase connection
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com;");
  next();
});

app.use(express.json({ limit: '10mb' }));

// In-memory data store for fallback/local resilience
let surveysFallback: any[] = [];
const FALLBACK_FILE = path.join(process.cwd(), 'surveys_backup.json');

// Try to load any previously saved surveys with recovery safeguard
if (fs.existsSync(FALLBACK_FILE)) {
  try {
    const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
    surveysFallback = JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error loading fallback surveys file (file may be corrupted):', err);
    surveysFallback = [];
  }
}

// Lazy safe initialization of Firebase Client SDK on Server
let db: any = null;
const isFirebasePlaceholder = !firebaseConfig.projectId || firebaseConfig.projectId.includes('placeholder-project-id');

if (!isFirebasePlaceholder) {
  try {
    const firebaseApp = !getApps().length 
      ? initializeApp(firebaseConfig)
      : getApps()[0];

    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('Firebase Client SDK initialized successfully on Server for project:', firebaseConfig.projectId, 'Database:', firebaseConfig.firestoreDatabaseId);

    // Authenticate the backend node instance to allow Firestore reads
    const auth = getAuth(firebaseApp);
    signInWithEmailAndPassword(auth, 'doctor@shf.org', 'doctor123')
      .then(() => {
        console.log('Firebase Server: Authentication successful. Reading surveys permitted.');
      })
      .catch((err) => {
        console.warn('Firebase Server: Authentication failed. Reads might be restricted:', err.message);
      });
  } catch (error) {
    console.error('Error initializing Firebase Client SDK on Server:', error);
  }
} else {
  console.log('Firebase: Running in fallback mode. Save and retrieve surveys locally.');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    firebaseConnected: db !== null,
    databaseMode: db ? 'firebase' : 'local_fallback',
  });
});

// Calculate next sequential UHID formatted as SN01, SN02...
app.get('/api/surveys/next-uhid', async (req, res) => {
  try {
    let surveys: any[] = [];
    if (db) {
      const snapshot = await getDocs(collection(db, 'surveys'));
      snapshot.forEach((doc: any) => {
        surveys.push(doc.data());
      });
    } else {
      surveys = surveysFallback;
    }

    let maxId = 0;
    surveys.forEach((s: any) => {
      if (s.uhid && typeof s.uhid === 'string' && /^sn\d+$/i.test(s.uhid)) {
        const idStr = s.uhid.replace(/^sn/i, '');
        const num = parseInt(idStr, 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });

    const nextNum = maxId + 1;
    const formattedId = `SN${nextNum.toString().padStart(2, '0')}`;
    return res.json({ nextUhid: formattedId });
  } catch (error) {
    console.error('Error calculating next UHID:', error);
    let maxId = 0;
    surveysFallback.forEach((s: any) => {
      if (s.uhid && typeof s.uhid === 'string' && /^sn\d+$/i.test(s.uhid)) {
        const idStr = s.uhid.replace(/^sn/i, '');
        const num = parseInt(idStr, 10);
        if (!isNaN(num) && num > maxId) {
          maxId = num;
        }
      }
    });
    const nextNum = maxId + 1;
    const formattedId = `SN${nextNum.toString().padStart(2, '0')}`;
    return res.json({ nextUhid: formattedId });
  }
});

// List all submitted surveys
app.get('/api/surveys', async (req, res) => {
  try {
    if (db) {
      const q = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const dbSurveys: any[] = [];
      snapshot.forEach((doc: any) => {
        dbSurveys.push({ id: doc.id, ...doc.data() });
      });
      return res.json(dbSurveys);
    } else {
      // Local fallback
      return res.json(surveysFallback);
    }
  } catch (error: any) {
    console.error('Error fetching surveys:', error);
    // Graceful fallback to local cache
    return res.json(surveysFallback);
  }
});

// Submit a new survey response with rate limiting
app.post('/api/surveys/submit', rateLimiter, async (req, res) => {
  try {
    const surveyData = {
      ...req.body,
      createdAt: new Date().toISOString(),
    };

    console.log('Submitting health survey:', surveyData.uhid, surveyData.personalDetails?.name);

    // Always append to local fallback data for immediate robust offline download/retrieval
    surveysFallback.unshift(surveyData);
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(surveysFallback, null, 2));

    let savedToFirestore = false;
    let finalDocId = '';

    if (db) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        // Generate Server-side Idempotency Key matching frontend
        if (surveyData.uhid && surveyData.surveyDate) {
          const dateKey = surveyData.surveyDate.replace(/[^a-zA-Z0-9]/g, '_');
          finalDocId = `survey_${surveyData.uhid}_${dateKey}`;
        }

        if (finalDocId) {
          const surveyDocRef = doc(db, 'surveys', finalDocId);
          await setDoc(surveyDocRef, surveyData, { merge: true });
          savedToFirestore = true;
          console.log('Survey successfully written to Firebase Firestore with Idempotency ID:', finalDocId);
        } else {
          const docRef = await addDoc(collection(db, 'surveys'), surveyData);
          finalDocId = docRef.id;
          savedToFirestore = true;
          console.log('Survey successfully written to Firebase Firestore with ID:', docRef.id);
        }
      } catch (fbError) {
        console.error('Failed to write survey to Firestore, falling back to local storage:', fbError);
      }
    }

    res.json({
      success: true,
      uhid: surveyData.uhid,
      savedToFirestore,
      docId: finalDocId,
      localCount: surveysFallback.length,
    });
  } catch (error: any) {
    console.error('Submission controller failed:', error);
    res.status(500).json({ error: 'Failed to process survey submission' });
  }
});

// Vite Middleware for development vs built client static assets
async function serveApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

serveApp();

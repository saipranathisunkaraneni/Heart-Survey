/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to convert array buffer to base64 string safely
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Fetch Noto Sans Telugu TTF Font safely at runtime
export async function fetchNotoSansTelugu(): Promise<string | null> {
  try {
    // Official Google Fonts direct link for Noto Sans Telugu Regular (standard unicode)
    const fontUrl = 'https://fonts.gstatic.com/s/notosanstelugu/v23/6xKtd09_O9uS7RkeN_H6U4X9jS0x6_j-.ttf';
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return arrayBufferToBase64(arrayBuffer);
  } catch (error) {
    console.error('Error loading Telugu font. Fallback will be used.', error);
    return null;
  }
}

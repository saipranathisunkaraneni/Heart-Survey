def ss(a,i,s,r):

  if(i==len(a)):
    r.append(s)
    return

  ss(a,i+1,s+a[i],r)
  ss(a,i+1,s,r)

a=input()
s="make"
r=[]
ss(a,0,"",r)
print(r)

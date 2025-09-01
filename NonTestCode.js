const fs = require('fs');
const s = fs.readFileSync(0,'utf8');
const js = JSON.parse(s);

function gcd(a,b){
  a = a<0n?-a:a; b = b<0n?-b:b;
  while(b){ const t=a%b; a=b; b=t; }
  return a;
}
class Fr{
  constructor(n=0n,d=1n){ if(d<0n){ n=-n; d=-d;} const g=gcd(n<0n?-n:n,d); this.n=n/g; this.d=d/g; }
  add(b){ return new Fr(this.n*b.d + b.n*this.d, this.d*b.d); }
  sub(b){ return new Fr(this.n*b.d - b.n*this.d, this.d*b.d); }
  mul(b){ return new Fr(this.n*b.n, this.d*b.d); }
  div(b){ return new Fr(this.n*b.d, this.d*b.n); }
  toString(){ if(this.d===1n) return this.n.toString(); return this.n+'/'+this.d; }
  isInt(){ return this.d===1n; }
}

function parseBig(baseStr, valStr){
  const b = BigInt(parseInt(baseStr,10));
  let r = 0n;
  for(let ch of valStr){
    let v;
    if(ch>='0' && ch<='9') v = BigInt(ch.charCodeAt(0)-48);
    else v = BigInt(ch.toLowerCase().charCodeAt(0)-87); // a->10
    r = r*b + v;
  }
  return r;
}

const keysInfo = js.keys || {};
const k = Number(keysInfo.k);
const m = k-1;
let pts = [];
for(const key of Object.keys(js)){
  if(key==='keys') continue;
  const x = BigInt(key);
  const {base,value} = js[key];
  const y = parseBig(base,value);
  pts.push([x,y]);
}
if(pts.length < k) { console.error('need at least k points'); process.exit(1); }
pts.sort((a,b)=> (a[0]<b[0]?-1: a[0]>b[0]?1:0));
pts = pts.slice(0,k);

let coeffs = Array(m+1).fill(0).map(_=> new Fr(0n,1n));
for(let i=0;i<pts.length;i++){
  const [xi, yi] = pts[i];
  let numer = [ new Fr(1n,1n) ];
  let denom = new Fr(1n,1n);
  for(let j=0;j<pts.length;j++){
    if(i===j) continue;
    const xj = pts[j][0];
    const term = [ new Fr(-xj,1n), new Fr(1n,1n) ];
    const nlen = numer.length + term.length -1;
    const tmp = Array(nlen).fill(0).map(_=> new Fr(0n,1n));
    for(let p=0;p<numer.length;p++){
      for(let q=0;q<term.length;q++){
        tmp[p+q] = tmp[p+q].add(numer[p].mul(term[q]));
      }
    }
    numer = tmp;
    denom = denom.mul(new Fr(xi - xj,1n));
  }
  const factor = new Fr(yi,1n).div(denom);
  for(let t=0;t< numer.length && t < coeffs.length; t++){
    coeffs[t] = coeffs[t].add(numer[t].mul(factor));
  }
}

const out = coeffs.map(c=>{
  if(!c.isInt()){ console.error('non-integer coefficient:', c.toString()); process.exit(1); }
  return c.n.toString();
}).reverse();

console.log(JSON.stringify(out));
console.log(coeffs[0].n.toString());
// this is C at the end 


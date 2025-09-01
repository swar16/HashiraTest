
const js = {
  "keys": { "n": 4, "k": 3 },
  "1": { "base": "10", "value": "4" },
  "2": { "base": "2",  "value": "111" },
  "3": { "base": "10", "value": "12" },
  "6": { "base": "4",  "value": "213" }
};

function gcd(a,b){ a=a<0n?-a:a; b=b<0n?-b:b; while(b){ const t=a%b; a=b; b=t;} return a; }
class Fr{
  constructor(n=0n,d=1n){ if(d<0n){ n=-n; d=-d } const g=gcd(n<0n?-n:n,d); this.n=n/g; this.d=d/g; }
  add(b){ return new Fr(this.n*b.d + b.n*this.d, this.d*b.d); }
  mul(b){ return new Fr(this.n*b.n, this.d*b.d); }
  div(b){ return new Fr(this.n*b.d, this.d*b.n); }
  isInt(){ return this.d===1n; }
  toString(){ return this.isInt()? this.n.toString() : `${this.n}/${this.d}`; }
}

function parseBig(baseStr, val){
  const b = BigInt(parseInt(baseStr,10));
  let r = 0n;
  for(let ch of val){
    let v;
    if(ch>='0' && ch<='9') v = BigInt(ch.charCodeAt(0)-48);
    else v = BigInt(ch.toLowerCase().charCodeAt(0)-87);
    r = r*b + v;
  }
  return r;
}

const k = Number(js.keys.k);
const m = k-1;
let pts = [];
for(const key of Object.keys(js)){
  if(key==='keys') continue;
  const x = BigInt(key);
  const {base,value} = js[key];
  pts.push([x, parseBig(base, value)]);
}
if(pts.length < k) throw new Error('not enough points');
pts.sort((a,b)=> a[0]<b[0]?-1: a[0]>b[0]?1:0);
pts = pts.slice(0,k);

const coeff = Array(m+1).fill(0).map(_=> new Fr(0n,1n));
for(let i=0;i<pts.length;i++){
  const [xi, yi] = pts[i];
  let numer = [ new Fr(1n,1n) ];
  let denom = new Fr(1n,1n);
  for(let j=0;j<pts.length;j++){
    if(i===j) continue;
    const xj = pts[j][0];
    const term = [ new Fr(-xj,1n), new Fr(1n,1n) ];
    const tmp = Array(numer.length+term.length-1).fill(0).map(_=> new Fr(0n,1n));
    for(let p=0;p<numer.length;p++) for(let q=0;q<term.length;q++) tmp[p+q] = tmp[p+q].add(numer[p].mul(term[q]));
    numer = tmp;
    denom = denom.mul(new Fr(xi - xj,1n));
  }
  const factor = new Fr(yi,1n).div(denom);
  for(let t=0;t<numer.length && t<coeff.length; t++) coeff[t] = coeff[t].add(numer[t].mul(factor));
}

const ints = coeff.map(c=>{ if(!c.isInt()) throw new Error('non-integer coeff '+c.toString()); return c.n.toString(); }).reverse();
console.log('coeffs [highest -> constant]:', ints);

function polyStr(arr){
  const deg = arr.length-1;
  let s = '';
  for(let i=0;i<arr.length;i++){
    const a = BigInt(arr[i]);
    const p = deg - i;
    if(a===0n) continue;
    const sign = a<0n ? '-' : (s? '+' : '');
    const aa = (a<0n? -a : a).toString();
    s += `${sign}${aa}${p>0? '*x' + (p>1? '^'+p:'') : ''}`;
  }
  return s || '0';
}
console.log('P(x) =', polyStr(ints));

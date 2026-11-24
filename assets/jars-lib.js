/* Bocaux — bocaux dessinés (même générateur que l'app). */

const P = (n) => n.toFixed(1);
const rng = (seed) => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; };
const smooth = (pts) => {
  let d = 'M' + P(pts[0][0]) + ' ' + P(pts[0][1]);
  const n = pts.length; const g = (i) => pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < n - 1; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ' C' + P(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + P(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + P(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + P(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + P(p2[0]) + ' ' + P(p2[1]);
  }
  return d;
};
const ell = (x, y, rx, ry) => 'M' + P(x - rx) + ' ' + P(y) + 'a' + P(rx) + ' ' + P(ry) + ' 0 1 0 ' + P(2 * rx) + ' 0a' + P(rx) + ' ' + P(ry) + ' 0 1 0 ' + P(-2 * rx) + ' 0Z';
const fmt = (v) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const fmt0 = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
const GEO = { tall: { bw: 29, nw: 20, L: 26, S: 42 }, squat: { bw: 39, nw: 29, L: 46, S: 58 }, round: { bw: 36, nw: 19, L: 32, S: 50 }, wide: { bw: 43, nw: 31, L: 24, S: 38 } };
const tilts = ['tilt-a', 'tilt-b', 'tilt-c'];
const mk = (o, idx) => {
  const r = rng(o.seed); const cx = 50, B = 124; const G = GEO[o.shape]; const bw = G.bw, nw = G.nw, L = G.L, S = G.S;
  const jit = (a) => (r() - 0.5) * a;
  const base = [[cx-nw,L],[cx-nw,L+5],[cx-bw+7,S-1],[cx-bw,S+9],[cx-bw-1,(S+B)/2],[cx-bw,B-11],[cx-bw+9,B],[cx,B+1.2],[cx+bw-9,B],[cx+bw,B-11],[cx+bw+1,(S+B)/2],[cx+bw,S+9],[cx+bw-7,S-1],[cx+nw,L+5],[cx+nw,L]];
  const outline = smooth(base.map((p) => [p[0] + jit(1.6), p[1] + jit(1.6)])) + 'Z';
  const outline2 = smooth(base.map((p) => [p[0] + jit(2.4), p[1] + jit(2.4)]));
  const hw = (y) => { if (y <= L + 5) return nw; if (y < S + 9) { const t = (y - (L + 5)) / ((S + 9) - (L + 5)); return nw + (bw - nw) * Math.sin(t * Math.PI / 2); } if (y > B - 11) { const t = (y - (B - 11)) / 11; return bw - 9 * t * t; } return bw; };
  const ratio = o.ratio !== undefined ? o.ratio : Math.max(0, Math.min(1, o.left / o.target));
  const top = (B - 4) - ((B - 4) - (S + 6)) * ratio;
  const f = { cu: '', au: '', ag: '' }; let edge = '', hl = '';
  if (ratio > 0) {
    for (let y = B - 5; y >= top; y -= 4.6) {
      const w = hw(y) - 6; const n = Math.max(1, Math.floor(2 * w / 10.5));
      const isTop = y - 4.6 < top;
      for (let k = 0; k < n; k++) {
        const x = cx - w + (k + 0.5) * (2 * w / n) + jit(3.5);
        if (isTop && n > 1 && r() < Math.abs(x - cx) / w * 0.8) continue;
        const rx = 5.4 + r() * 1.8, ry = rx * (0.28 + r() * 0.6), yy = y + jit(2);
        const m = r(); const key = m < o.mix[0] ? 'cu' : (m < o.mix[0] + o.mix[1] ? 'au' : 'ag');
        f[key] += ell(x, yy, rx, ry); edge += ell(x, yy + 1.8, rx, ry);
        hl += 'M' + P(x - rx * 0.55) + ' ' + P(yy - ry * 0.15) + 'q' + P(rx * 0.35) + ' ' + P(-ry * 0.55) + ' ' + P(rx * 0.9) + ' ' + P(-ry * 0.35);
      }
    }
  }
  let billBody = '', billBand = '';
  (o.bills || []).forEach((b) => {
    const x = cx + b[0], y = top + b[1], s = b[2];
    billBody += 'M' + P(x) + ' ' + P(y) + 'l24 ' + P(s) + 'a2.4 4.2 0 0 1 0 8.4l-24 ' + P(-s) + 'a2.4 4.2 0 0 1 0 -8.4Z';
    billBand += 'M' + P(x + 10) + ' ' + P(y + s * 0.42 - 0.6) + 'l4.5 ' + P(s * 0.19) + 'l0 9.6l-4.5 ' + P(-s * 0.19) + 'Z';
  });
  const low = !o.calm && ratio > 0 && ratio < 0.15;
  let crack = '';
  if (low || o.cracked) { const x0 = cx + bw - 3, y0 = S + 16; crack = 'M' + P(x0) + ' ' + P(y0) + 'l-6 5l3 4l-8 6l4 4l-6 8M' + P(x0 - 6) + ' ' + P(y0 + 5) + 'l-7 -2l-3 3M' + P(x0 - 11) + ' ' + P(y0 + 15) + 'l-6 1'; }
  const refl = 'M' + P(cx - bw + 7) + ' ' + P(S + 14) + 'C' + P(cx - bw + 4.5) + ' ' + P(S + 34) + ' ' + P(cx - bw + 4.5) + ' ' + P(B - 34) + ' ' + P(cx - bw + 8) + ' ' + P(B - 16);
  const refl2 = 'M' + P(cx - bw + 13) + ' ' + P(S + 17) + 'l-0.6 9';
  let lid = '', lidDeco = '';
  if (o.lid.indexOf('g-') === 0) {
    const a = cx - nw - 9, b = cx + nw + 9, lt = L + 3;
    lid = 'M' + P(a) + ' ' + P(lt) + 'C' + P(a + 2) + ' ' + P(L - 9) + ' ' + P(cx - 10) + ' ' + P(L - 13) + ' ' + P(cx) + ' ' + P(L - 13) + 'C' + P(cx + 10) + ' ' + P(L - 13) + ' ' + P(b - 2) + ' ' + P(L - 9) + ' ' + P(b) + ' ' + P(lt) + 'L' + P(b + 1.5) + ' ' + P(lt + 8);
    const steps = 6, w = (b + 1.5 - (a - 1.5)) / steps;
    for (let i = 0; i < steps; i++) { const x1 = b + 1.5 - i * w; lid += 'Q' + P(x1 - w / 2) + ' ' + P(lt + 13 + jit(2)) + ' ' + P(x1 - w) + ' ' + P(lt + 8 + jit(1.5)); }
    lid += 'Z';
    lidDeco = 'M' + P(cx - nw - 5) + ' ' + P(L + 4) + 'Q' + P(cx) + ' ' + P(L + 7) + ' ' + P(cx + nw + 5) + ' ' + P(L + 4) + 'M' + P(cx + nw - 3) + ' ' + P(L + 5) + 'q5 6 1 11M' + P(cx + nw - 3) + ' ' + P(L + 5) + 'q7 3 10 0';
  } else {
    const a = cx - nw - 4, b = cx + nw + 4;
    lid = 'M' + P(a) + ' ' + P(L + 3) + 'L' + P(a) + ' ' + P(L - 8) + 'Q' + P(a) + ' ' + P(L - 11) + ' ' + P(a + 3) + ' ' + P(L - 11) + 'L' + P(b - 3) + ' ' + P(L - 11) + 'Q' + P(b) + ' ' + P(L - 11) + ' ' + P(b) + ' ' + P(L - 8) + 'L' + P(b) + ' ' + P(L + 3) + 'Z';
    for (let x = a + 4; x < b - 2; x += 4) lidDeco += 'M' + P(x) + ' ' + P(L - 6) + 'l0 7';
  }
  const left = o.left || 0, target = o.target || 1;
  return Object.assign({}, o, {
    name: o.name, lname: (o.name || '').toLowerCase(),
    aria: o.aria || (o.name + ' : ' + (o.paid ? 'payé, ' + fmt0(target) : fmt(left) + ' restants sur ' + fmt0(target)) + (low ? ', presque vide' : '')),
    outline, outline2, edge, cu: f.cu, au: f.au, ag: f.ag, hl, billBody, billBand, crack, refl, refl2, lid, lidDeco, lidPat: o.lid,
    coinCls: low ? 'coins shiver' : 'coins', tilt: tilts[(idx || 0) % 3],
    amt: fmt(left), of: 'sur ' + fmt0(target), isLow: low, isPaid: !!o.paid, isNormal: !low && !o.paid, paidAmt: fmt0(target)
  });
};


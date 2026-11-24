/* Bocaux — site vitrine. */
(() => {
  // Lien vers la fiche App Store : remplace par l'adresse de l'app une fois publiée
  // (App Store Connect › App Information › Apple ID → https://apps.apple.com/app/id<Apple ID>).
  const APP_STORE_URL = 'https://apps.apple.com/app/id0000000000';

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const euros = (v) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const euros0 = (v) => v.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';

  $$('.store').forEach((a) => { a.href = APP_STORE_URL; a.rel = 'noopener'; });

  // ——— Sons (ceux de l'app), seulement après un geste ———
  const sound = (name, vol = 0.45) => { const a = new Audio('assets/sons/' + name + '.wav'); a.volume = vol; return () => { try { const c = a.cloneNode(); c.volume = vol; c.play().catch(() => {}); } catch (e) {} }; };
  const sClink = sound('clink', 0.35), sKey = sound('key', 0.5), sCascade = sound('cascade', 0.4);

  // ——— Bocal dessiné (même gabarit que dans l'app) ———
  const jarSVG = (j) => `<svg class="jarsvg" viewBox="0 0 100 130" aria-hidden="true">
<path class="glass" d="${j.outline}"/><g class="${j.coinCls}"><path class="edge" d="${j.edge}"/><path class="cu" d="${j.cu}"/><path class="ag" d="${j.ag}"/><path class="au" d="${j.au}"/><path class="hl" d="${j.hl}"/><path class="bill" d="${j.billBody}"/><path class="billband" d="${j.billBand}"/></g>
<path class="refl" d="${j.refl}"/><path class="refl2" d="${j.refl2}"/><path class="crack" d="${j.crack}"/><path class="ink2" d="${j.outline2}"/><path class="ink" d="${j.outline}"/>
<path d="${j.lid}" fill="url(#${j.lidPat})"/><path class="ink" d="${j.lid}"/><path class="ink" d="${j.lidDeco}"/></svg>`;

  // ——— Lampe : le cordon passe le site en mode nuit ———
  const cord = $('#cord');
  const setNight = (on, save = true) => {
    root.classList.toggle('nuit', on);
    cord.setAttribute('aria-pressed', String(on));
    cord.setAttribute('aria-label', on ? 'Éteindre la lampe (mode jour)' : 'Allumer la lampe (mode nuit)');
    $('#cordTip').textContent = on ? 'tire pour le jour' : 'tire-moi';
    $$('img[data-screen]').forEach((img) => { img.src = img.src.replace(on ? '-jour.webp' : '-nuit.webp', on ? '-nuit.webp' : '-jour.webp'); });
    if (save) { try { localStorage.setItem('bocaux-theme', on ? 'nuit' : 'jour'); } catch (e) {} }
  };
  setNight(root.classList.contains('nuit'), false);
  let pull = null, swallowClick = false;
  const rest = () => parseFloat(getComputedStyle(cord).getPropertyValue('--rest')) || 96;
  const toggleLamp = () => {
    sKey();
    const go = () => setNight(!root.classList.contains('nuit'));
    if (reduce || !document.startViewTransition) return go();
    const b = cord.querySelector('.bead').getBoundingClientRect();
    root.style.setProperty('--cx', b.left + b.width / 2 + 'px');
    root.style.setProperty('--cy', b.top + b.height / 2 + 'px');
    document.startViewTransition(go);
  };
  cord.addEventListener('pointerdown', (e) => { pull = { y: e.clientY, dy: 0 }; cord.setPointerCapture(e.pointerId); cord.classList.add('pulling'); });
  cord.addEventListener('pointermove', (e) => {
    if (!pull) return;
    pull.dy = Math.max(0, Math.min(70, e.clientY - pull.y));
    cord.style.setProperty('--len', rest() + pull.dy + 'px');
  });
  const endPull = () => {
    if (!pull) return;
    cord.classList.remove('pulling');
    if (pull.dy > 4) { swallowClick = true; if (pull.dy > 26) toggleLamp(); }
    cord.style.removeProperty('--len');
    pull = null;
  };
  cord.addEventListener('pointerup', endPull);
  cord.addEventListener('pointercancel', endPull);
  cord.addEventListener('click', () => {
    if (swallowClick) { swallowClick = false; return; }
    cord.style.setProperty('--len', rest() + 32 + 'px');
    setTimeout(() => cord.style.removeProperty('--len'), 140);
    toggleLamp();
  });

  // ——— En-tête ———
  const top = $('#top');
  const progress = $('#progress');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    top.classList.toggle('scrolled', y > 8);
    top.classList.toggle('hide', y > 420 && y > lastY + 2);
    if (y < lastY - 2 || y < 420) top.classList.remove('hide');
    lastY = y;
    progress.style.setProperty('--p', Math.min(1, y / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ——— Démo : range ta paie ———
  const PAY = 2150;
  const SPECS = [
    { id: 'loyer', name: 'Loyer', target: 780, shape: 'tall', lid: 'm-tin', seed: 23, mix: [0.3, 0.4], r: '-3deg' },
    { id: 'courses', name: 'Courses', target: 450, shape: 'round', lid: 'g-terra', seed: 11, mix: [0.45, 0.3], r: '2deg' },
    { id: 'sorties', name: 'Sorties', target: 120, shape: 'squat', lid: 'g-sage', seed: 37, mix: [0.6, 0.2], r: '-1deg' },
    { id: 'imprevus', name: 'Imprévus', target: 150, shape: 'squat', lid: 'g-honey', seed: 67, mix: [0.35, 0.35], r: '2deg' },
    { id: 'epargne', name: 'Épargne', target: 650, shape: 'wide', lid: 'g-blue', seed: 97, mix: [0.3, 0.45], bills: [[-22, -2, -3]], r: '-2deg' },
  ];
  const state = { filled: Object.fromEntries(SPECS.map((s) => [s.id, 0])) };
  const remaining = () => PAY - Object.values(state.filled).reduce((a, b) => a + b, 0);
  const jarsEl = $('#jars'), pot = $('#pot'), potArt = $('#potArt');

  jarsEl.innerHTML = SPECS.map((s) => `
    <button class="jar" type="button" data-id="${s.id}">
      <span class="art"><span class="svg"></span><span class="tag" style="--r:${s.r}">${s.name}</span></span>
      <span class="holder"><b></b><span></span></span>
    </button>`).join('');

  const renderJar = (s) => {
    const el = jarsEl.querySelector(`[data-id="${s.id}"]`);
    const f = state.filled[s.id];
    el.querySelector('.svg').innerHTML = jarSVG(mk({ ...s, bills: f / s.target > 0.3 ? s.bills : [], left: f, ratio: Math.min(1, f / s.target), calm: true }, 0));
    const h = el.querySelector('.holder');
    const full = f >= s.target;
    h.classList.toggle('full', full);
    const bEl = h.querySelector('b');
    if (bEl.textContent && bEl.textContent !== euros0(f) && !reduce) { bEl.classList.remove('bump'); void bEl.offsetWidth; bEl.classList.add('bump'); }
    bEl.textContent = euros0(f);
    h.querySelector('span').textContent = full ? 'complet' : 'sur ' + euros0(s.target);
    el.setAttribute('aria-label', `${s.name} : ${euros0(f)} rangés sur ${euros0(s.target)}${full ? ', complet' : ''}. Ranger 50 €.`);
  };
  let shown = PAY, raf = 0;
  const tween = (el, to) => {
    cancelAnimationFrame(raf);
    if (reduce) { shown = to; el.textContent = euros(to); return; }
    const from = shown, t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 420), e = 1 - Math.pow(1 - k, 3); shown = from + (to - from) * e; el.textContent = euros(Math.round(shown)); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
  };
  const renderPot = () => {
    const r = remaining();
    potArt.innerHTML = jarSVG(mk({ name: 'À répartir', shape: 'wide', lid: 'g-honey', seed: 101, mix: [0.3, 0.45], bills: r > 400 ? [[-16, -4, -2]] : [], calm: true, ratio: r / PAY }, 0));
    tween($('#potAmt'), r);
    $('#potSub').textContent = r > 0 ? 'ta paie du mois, encore à répartir' : 'tout est rangé';
    pot.classList.toggle('empty', r <= 0);
    pot.setAttribute('aria-label', `Jarre À répartir : ${euros(r)}`);
  };
  const renderAll = () => { SPECS.forEach(renderJar); renderPot(); };
  renderAll();

  const centerOf = (el) => { const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height * 0.3 }; };
  const flyCoins = (from, toEl, amount) => new Promise((done) => {
    const to = centerOf(toEl.querySelector('.art'));
    if (reduce) return done();
    const n = Math.max(3, Math.min(14, Math.round(amount / 25)));
    const kinds = ['', 'cu', 'ag', '', 'cu'];
    let left = n;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.className = 'flycoin ' + kinds[i % kinds.length];
      document.body.appendChild(c);
      const sx = from.x + (Math.random() - 0.5) * 30, sy = from.y + (Math.random() - 0.5) * 20;
      const mx = (sx + to.x) / 2 + (Math.random() - 0.5) * 60, my = Math.min(sy, to.y) - 90 - Math.random() * 60;
      const ex = to.x + (Math.random() - 0.5) * 24, ey = to.y + 20;
      c.animate([
        { transform: `translate(${sx}px,${sy}px) scale(1)` },
        { transform: `translate(${mx}px,${my}px) scale(1.15)`, offset: 0.45 },
        { transform: `translate(${ex}px,${ey}px) scale(.7)`, opacity: 1, offset: 0.92 },
        { transform: `translate(${ex}px,${ey + 14}px) scale(.6)`, opacity: 0 },
      ], { duration: 520 + Math.random() * 160, delay: i * 38, easing: 'cubic-bezier(.3,.1,.4,1)', fill: 'forwards' })
        .finished.then(() => { c.remove(); if (--left === 0) done(); });
    }
  });

  let busy = 0;
  const deposit = async (id, want, from) => {
    const s = SPECS.find((x) => x.id === id);
    const amount = Math.min(want, s.target - state.filled[s.id], remaining());
    const el = jarsEl.querySelector(`[data-id="${id}"]`);
    if (amount <= 0) {
      if (!reduce) el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 });
      $('#doneMsg').textContent = remaining() <= 0 ? '' : `${s.name} est déjà complet. Essaie un autre bocal.`;
      return;
    }
    state.filled[s.id] += amount; renderPot();
    busy++;
    await flyCoins(from, el, amount);
    busy--;
    sClink(); renderJar(s);
    if (!reduce) el.querySelector('.art').animate([{ transform: 'translateY(0)' }, { transform: 'translateY(3px) scaleY(.97)' }, { transform: 'translateY(0)' }], { duration: 220 });
    $('#doneMsg').textContent = '';
    checkDone();
  };
  const checkDone = () => {
    if (remaining() > 0 || busy) return;
    $('#stamp').classList.add('on');
    sCascade();
    $('#doneMsg').textContent = `2 150 € rangés dans 5 bocaux. Dans l'app, c'est le même geste, avec ta vraie paie.`;
  };

  // Poignée : appuyer sur la jarre, garder le doigt, glisser vers un bocal.
  const hand = $('#handful');
  let grab = null;
  const hotJar = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest('.jar'); };
  let touched = false;
  pot.addEventListener('pointerdown', (e) => {
    touched = true;
    if (remaining() <= 0) return;
    e.preventDefault();
    pot.setPointerCapture(e.pointerId);
    grab = { amount: Math.min(10, remaining()), x: e.clientX, y: e.clientY, hot: null, moved: false };
    const show = () => { hand.textContent = '+' + euros0(grab.amount); };
    show(); hand.classList.add('on');
    hand.style.left = e.clientX + 'px'; hand.style.top = e.clientY + 'px';
    grab.timer = setInterval(() => {
      const cap = remaining();
      const step = grab.amount < 100 ? 10 : 50;
      if (grab.amount < cap) { grab.amount = Math.min(cap, grab.amount + step); show(); }
    }, 120);
  });
  pot.addEventListener('pointermove', (e) => {
    if (!grab) return;
    grab.x = e.clientX; grab.y = e.clientY; grab.moved = true;
    hand.style.left = e.clientX + 'px'; hand.style.top = e.clientY + 'px';
    const j = hotJar(e.clientX, e.clientY);
    if (j !== grab.hot) { grab.hot && grab.hot.classList.remove('hot'); j && j.classList.add('hot'); grab.hot = j; }
  });
  const release = () => {
    if (!grab) return;
    clearInterval(grab.timer); hand.classList.remove('on');
    const j = grab.hot;
    if (j) { j.classList.remove('hot'); deposit(j.dataset.id, grab.amount, { x: grab.x, y: grab.y }); }
    else $('#doneMsg').textContent = 'Garde le doigt sur la jarre et glisse jusqu’à un bocal.';
    grab = null;
  };
  pot.addEventListener('pointerup', release);
  pot.addEventListener('pointercancel', () => { if (grab) { clearInterval(grab.timer); hand.classList.remove('on'); grab.hot && grab.hot.classList.remove('hot'); grab = null; } });
  pot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#doneMsg').textContent = 'Au clavier, choisis un bocal et appuie sur Entrée pour y ranger 50 €.'; } });

  const demoSec = $('#demo');
  let demoVisible = false;
  new IntersectionObserver(([en]) => { demoVisible = en.isIntersecting; }, { threshold: 0.4 }).observe(demoSec);
  if (!reduce) setInterval(() => {
    if (touched || !demoVisible || remaining() <= 0) return;
    pot.classList.remove('hint-wiggle'); void pot.offsetWidth; pot.classList.add('hint-wiggle');
  }, 4200);

  jarsEl.addEventListener('click', (e) => {
    touched = true;
    const j = e.target.closest('.jar');
    if (j) deposit(j.dataset.id, 50, centerOf(pot));
  });
  $('#fill').addEventListener('click', async () => {
    touched = true;
    for (const s of SPECS) {
      const need = s.target - state.filled[s.id];
      if (need > 0) { deposit(s.id, need, centerOf(pot)); await new Promise((r) => setTimeout(r, reduce ? 0 : 230)); }
    }
  });
  $('#reset').addEventListener('click', () => {
    SPECS.forEach((s) => { state.filled[s.id] = 0; });
    $('#stamp').classList.remove('on'); $('#doneMsg').textContent = '';
    renderAll();
  });

  // ——— Le reste du mois : onglets, défilement automatique, glisser sur mobile ———
  const tabs = $$('.tab'), sImgs = $$('#storyScr img'), storySec = $('#mois'), mDesc = $('#mDesc');
  let cur = 0, timer = 0, auto = !reduce, storyVisible = false;
  const DUR = 6500;
  storySec.style.setProperty('--dur', DUR + 'ms');
  mDesc.textContent = tabs[0].querySelector('.d').textContent;
  const restart = () => {
    clearTimeout(timer);
    storySec.classList.remove('playing');
    if (!auto || !storyVisible) return;
    void storySec.offsetWidth;
    storySec.classList.add('playing');
    timer = setTimeout(() => show((cur + 1) % tabs.length, 1), DUR);
  };
  const show = (i, dir = 1) => {
    if (i === cur) return restart();
    const prev = sImgs[cur], next = sImgs[i];
    tabs.forEach((t, k) => { const on = k === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    $('#panel').setAttribute('aria-labelledby', tabs[i].id);
    next.alt = tabs[i].dataset.alt; prev.alt = '';
    mDesc.textContent = tabs[i].querySelector('.d').textContent;
    next.style.zIndex = 2; prev.style.zIndex = 1;
    next.classList.remove('out');
    if (!reduce) {
      const ease = 'cubic-bezier(.2,.9,.25,1)';
      next.animate([{ transform: `translateX(${dir * 105}%) rotate(${dir * 8}deg)` }, { transform: 'none' }], { duration: 620, easing: ease });
      prev.animate([{ transform: 'none', opacity: 1, filter: 'brightness(1)' }, { transform: `translateX(${-dir * 30}%) scale(.9)`, opacity: 0.2, filter: 'brightness(.7)' }], { duration: 620, easing: ease })
        .finished.then(() => { if (sImgs[cur] !== prev) prev.classList.add('out'); });
      $('#storyPhone').animate([{ transform: 'rotateY(0) rotateZ(0)' }, { transform: `rotateY(${-dir * 10}deg) rotateZ(${dir * 1.5}deg)` }, { transform: 'rotateY(0) rotateZ(0)' }], { duration: 700, easing: 'ease-out' });
    } else prev.classList.add('out');
    if (matchMedia('(max-width: 900px)').matches) tabs[i].parentElement.scrollTo({ left: tabs[i].offsetLeft - tabs[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    cur = i;
    restart();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => { auto = false; show(i, i > cur ? 1 : -1); }));
  $('.tabs').addEventListener('keydown', (e) => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!k) return;
    e.preventDefault(); auto = false;
    const i = (cur + k + tabs.length) % tabs.length;
    show(i, k); tabs[i].focus();
  });
  new IntersectionObserver(([en]) => { storyVisible = en.isIntersecting; restart(); }, { threshold: 0.35 }).observe(storySec);
  let sw = null;
  const sp = $('.story-phone');
  sp.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY }; });
  sp.addEventListener('pointerup', (e) => {
    if (!sw) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    auto = false;
    const d = dx < 0 ? 1 : -1;
    show((cur + d + tabs.length) % tabs.length, d);
  });

  // ——— Étagère finale ———
  const FINAL = [
    { name: 'Voyage', left: 340, target: 400, shape: 'tall', lid: 'g-blue', seed: 41, mix: [0.3, 0.4], bills: [[-12, -3, -3]] },
    { name: 'Courses', left: 212.4, target: 450, shape: 'round', lid: 'g-terra', seed: 11, mix: [0.45, 0.3] },
    { name: 'Imprévus', left: 150, target: 150, shape: 'squat', lid: 'g-honey', seed: 67, mix: [0.35, 0.35] },
    { name: 'Épargne', left: 82, target: 100, shape: 'wide', lid: 'g-terra', seed: 97, mix: [0.3, 0.45], bills: [[-22, -2, -3], [0, -5, 2.5]] },
    { name: 'Cadeaux', left: 65, target: 80, shape: 'round', lid: 'm-brass', seed: 53, mix: [0.4, 0.35] },
    { name: 'Sorties', left: 14.5, target: 120, shape: 'squat', lid: 'g-sage', seed: 37, mix: [0.6, 0.2] },
  ];
  const finalShelf = $('#finalShelf');
  const drawFinal = (k) => { finalShelf.innerHTML = FINAL.map((o, i) => `<span class="art" style="position:relative">${jarSVG(mk({ ...o, ratio: (o.left / o.target) * k, bills: k > 0.6 ? o.bills : [] }, i))}</span>`).join(''); };
  drawFinal(reduce ? 1 : 0);
  const fillFinal = () => {
    if (reduce) return;
    const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 1400); drawFinal(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  // ——— Apparitions au défilement (une seule fois) ———
  $$('.never li').forEach((li, i) => li.style.setProperty('--i', i));
  $$('.ledger .row').forEach((r, i) => r.style.setProperty('--i', i));
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      $$(':scope > [data-reveal]', en.target).forEach((h) => h.classList.add('in'));
      if (en.target === finalShelf) fillFinal();
      if (en.target.classList.contains('duo')) setTimeout(() => en.target.classList.add('settled'), 1300);
      revealIO.unobserve(en.target);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
  [...new Set($$('[data-reveal]').map((h) => h.parentElement)), $('.never'), $('#ledger'), $('.duo'), finalShelf].forEach((el) => revealIO.observe(el));

  // ——— Widgets : léger décalage au défilement ———
  const duo = $('.duo'), duoA = $('.duo .a'), duoB = $('.duo .b');
  if (!reduce) addEventListener('scroll', () => {
    const r = duo.getBoundingClientRect();
    const p = (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight;
    duoA.style.setProperty('--py', (p * -50).toFixed(1) + 'px');
    duoB.style.setProperty('--py', (p * 50).toFixed(1) + 'px');
  }, { passive: true });

  // ——— Hero : mots du titre, téléphone qui tombe sur l'étagère, quelques pièces ———
  const h1 = $('#h1');
  let wi = 0;
  const split = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--i', wi++); w.textContent = part; frag.appendChild(w); }
        });
        n.replaceWith(frag);
      } else split(n);
    });
  };
  h1.setAttribute('aria-label', h1.textContent); split(h1);
  [...h1.children].forEach((c) => c.setAttribute('aria-hidden', 'true'));

  const heroPhone = $('#heroPhone'), heroPlank = $('.hero .plank');
  const dropCoins = () => {
    if (reduce) return;
    const pr = heroPlank.getBoundingClientRect(), ph = heroPhone.getBoundingClientRect();
    const spots = [-70, -44, -58, ph.width + 26, ph.width + 52];
    spots.forEach((dx, i) => {
      const c = document.createElement('span');
      c.className = 'droppedcoin ' + ['', 'cu', 'ag', 'cu', ''][i];
      c.style.left = ((ph.left - pr.left + dx) / pr.width * 100).toFixed(2) + '%';
      if (i === 2) c.style.bottom = 'calc(100% + 18px)';
      heroPlank.appendChild(c);
      c.animate([
        { transform: 'translateY(-70vh) rotate(0)', opacity: 1 },
        { transform: 'translateY(0) rotate(160deg)', offset: 0.62 },
        { transform: 'translateY(-26px) rotate(200deg)', offset: 0.78 },
        { transform: 'translateY(0) rotate(230deg)', offset: 0.9 },
        { transform: 'translateY(-6px) rotate(236deg)', offset: 0.95 },
        { transform: 'translateY(0) rotate(240deg)' },
      ], { duration: 1100, delay: 900 + i * 120, easing: 'cubic-bezier(.45,0,.75,.6)', fill: 'backwards' });
    });
  };
  if (matchMedia('(pointer: fine)').matches && !reduce) {
    const ph = heroPhone.querySelector('.phone');
    $('.hero').addEventListener('pointermove', (e) => {
      const r = heroPhone.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / innerWidth, y = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      ph.style.transform = `perspective(1000px) rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 10).toFixed(2)}deg)`;
    });
    $('.hero').addEventListener('pointerleave', () => { ph.style.transform = ''; });
  }

  // ——— Entrée ———
  requestAnimationFrame(() => requestAnimationFrame(() => { root.classList.remove('intro'); root.classList.add('ready'); dropCoins(); }));
})();

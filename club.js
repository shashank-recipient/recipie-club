(function () {
  const P = window.PRACTICE, $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rupee = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const REL = [['partner', 'Partner'], ['follow', 'Follow'], ['neutral', 'Neutral'], ['rival', 'Rival']];
  const CAMPS = [
    ['none', 'No campaign', 'Keep it simple this month.'],
    ['bundle', 'Partner pairing weeks', 'In weeks 3 and 4, you and your partners recommend each other harder.'],
    ['founding', 'Founding member week', 'Launch buzz in week 2 brings a one-time bump of new faces.'],
    ['walk', 'Neighbourhood walk with a rival', 'Team up with a rival to grow demand for both of you. Needs a rival.'],
  ];
  const SERIES = [['search', 'From Recipie Search', 'var(--s1)'], ['partners', 'From your network', 'var(--s2)'], ['back', 'Came back', 'var(--s3)']];
  const st = { biz: null, giveBack: 15, network: {}, campaign: 'none' };
  let runs = [];
  try { runs = JSON.parse(localStorage.getItem('club-runs') || '[]'); } catch { runs = []; }
  const saveRuns = () => { try { localStorage.setItem('club-runs', JSON.stringify(runs.slice(-8))); } catch { /* private mode */ } };

  // step 1: business
  $('#bizgrid').innerHTML = P.businesses.map(b => `<button class="biz" type="button" data-b="${b.id}" aria-pressed="false"><span class="ic">${b.icon}</span><b>${esc(b.name)}</b><small>${b.seg} · ~${b.weekly} customers a week</small></button>`).join('');
  $('#bizgrid').onclick = e => {
    const b = e.target.closest('[data-b]'); if (!b) return;
    st.biz = b.dataset.b; st.network = {}; st.campaign = 'none';
    document.querySelectorAll('.biz').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    ['#s2', '#s3', '#s4'].forEach(s => $(s).removeAttribute('data-locked'));
    renderNet(); renderCamps(); ready();
  };
  // step 2: give-back
  $('#gb').innerHTML = [15, 18, 20].map(v => `<button type="button" role="radio" data-v="${v}" aria-checked="${v === st.giveBack}">${v}%</button>`).join('');
  $('#gb').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; st.giveBack = +b.dataset.v; $('#gb').querySelectorAll('button').forEach(x => x.setAttribute('aria-checked', String(x === b))); };
  // step 3: network
  function renderNet() {
    const me = P.byId(st.biz), others = P.businesses.filter(o => o.id !== st.biz).sort((a, b) => P.aff(st.biz, b.id) - P.aff(st.biz, a.id));
    const max = Math.max(...others.map(o => P.aff(st.biz, o.id)));
    const partners = Object.values(st.network).filter(r => r === 'partner').length;
    $('#net').innerHTML = others.map(o => {
      const rel = st.network[o.id] || 'neutral', a = P.aff(st.biz, o.id), natural = (P.rivals[st.biz] || []).includes(o.id);
      return `<li><div class="who"><span class="ic">${o.icon}</span><div><b>${esc(o.name)}</b>
        <span class="meter" title="How often their customers visit a ${me.seg.toLowerCase()} the same day"><i style="width:${Math.round((a / max) * 90)}px"></i>${a >= .15 ? 'often' : a >= .07 ? 'sometimes' : 'rarely'} visit you too</span>${natural ? '<span class="natural">sells some of what you sell</span>' : ''}</div></div>
        <div class="rel-pick" role="group" aria-label="Relationship with ${esc(o.name)}">${REL.map(([r, l]) => `<button type="button" data-o="${o.id}" data-r="${r}" aria-pressed="${rel === r}" ${r === 'partner' && rel !== 'partner' && partners >= 3 ? 'disabled title="3 partners max"' : ''}>${l}</button>`).join('')}</div></li>`;
    }).join('');
  }
  $('#net').onclick = e => { const b = e.target.closest('[data-r]'); if (!b || b.disabled) return; st.network[b.dataset.o] = b.dataset.r; renderNet(); };
  // step 4: campaign
  function renderCamps() { $('#camps').innerHTML = CAMPS.map(([k, t, d]) => `<button class="camp" type="button" data-c="${k}" aria-pressed="${st.campaign === k}"><b>${t}</b><small>${d}</small></button>`).join(''); }
  $('#camps').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; st.campaign = b.dataset.c; renderCamps(); };
  renderCamps();
  function ready() { $('#play-btn').disabled = !st.biz; $('#play-hint').textContent = st.biz ? 'You can change anything and play again.' : 'Pick a business to start.'; }

  // play
  const seedOf = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 2147483647, 7) || 7;
  let last = null;
  $('#play-btn').onclick = () => {
    const cfg = { biz: st.biz, giveBack: st.giveBack, network: { ...st.network }, campaign: st.campaign === 'none' ? '' : st.campaign };
    cfg.seed = seedOf(JSON.stringify(cfg));
    const r = P.simulate(cfg);
    last = { cfg, r };
    const partners = P.businesses.filter(o => cfg.network[o.id] === 'partner').map(o => o.name);
    runs.push({ biz: cfg.biz, gb: cfg.giveBack, partners, campaign: st.campaign, extra: r.extra, net: r.net, points: r.pointsCost, strength: r.strength, at: Date.now() });
    saveRuns(); render(cfg, r);
    $('#results').hidden = false; $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $('#again').onclick = () => $('#s2').scrollIntoView({ behavior: 'smooth', block: 'start' });

  function render(cfg, r) {
    const me = P.byId(cfg.biz);
    $('#r-title').textContent = `${me.icon} ${me.name}: your month`;
    $('#r-badge').textContent = (r.strength >= 80 ? 'Connector' : r.strength >= 50 ? 'Good neighbour' : r.strength >= 20 ? 'Getting connected' : 'Going solo') + ` · network ${r.strength}/100`;
    $('#kpis').innerHTML = [
      ['New and returning customers', r.extra, 'on top of your regulars'],
      ['Extra sales', rupee(r.extraRevenue), `~${rupee(me.spend)} a visit`],
      ['Points you gave back', rupee(r.pointsCost), `${cfg.giveBack}% to new customers and regulars on Recipie`],
      ['Your gain', rupee(r.net), 'extra sales minus points'],
    ].map(([l, v, s]) => `<div class="kpi"><span>${l}</span><b>${v}</b><small>${s}</small></div>`).join('');
    chart(r.weeks);
    $('#tbl').innerHTML = '<tr><th>Week</th><th>Regulars</th>' + SERIES.map(([, l]) => `<th>${l}</th>`).join('') + '</tr>' + r.weeks.map(w => `<tr><td>Week ${w.w}</td><td>${w.regulars}</td>${SERIES.map(([k]) => `<td>${w[k]}</td>`).join('')}</tr>`).join('');
    $('#tips').innerHTML = r.tips.map(t => `<li>${esc(t)}</li>`).join('');
    const mine = runs.filter(x => x.biz === cfg.biz).slice(-6);
    $('#compare').hidden = mine.length < 2;
    if (mine.length >= 2) {
      const best = Math.max(...mine.map(x => x.net));
      const campName = k => (CAMPS.find(c => c[0] === k) || [, 'None'])[1];
      $('#cmp').innerHTML = '<tr><th>Strategy</th><th>Customers</th><th>Points</th><th>Gain</th></tr>' + mine.map((x, i) => `<tr class="${x.net === best ? 'best' : ''}"><td>#${i + 1} · ${x.gb}% · ${x.partners.length ? esc(x.partners.map(n => (P.businesses.find(b => b.name === n) || { short: n }).short).join(', ')) : 'no partners'} · ${esc(campName(x.campaign))}${x.net === best ? ' ★' : ''}</td><td>${x.extra}</td><td>${rupee(x.points)}</td><td>${rupee(x.net)}</td></tr>`).join('');
    }
  }

  function chart(weeks) {
    const W = 560, H = 220, pad = { l: 30, r: 6, t: 10, b: 26 }, n = weeks.length;
    const tot = w => w.search + w.partners + w.back, max = Math.max(1, ...weeks.map(tot));
    const nice = Math.ceil(max / 10) * 10, y = v => H - pad.b - (v / nice) * (H - pad.t - pad.b), bw = (W - pad.l - pad.r) / n, barW = Math.min(64, bw * 0.55);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="New and returning customers per week">`;
    for (const v of [0, nice / 2, nice]) s += `<line class="gl" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${pad.l - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    weeks.forEach((w, i) => {
      const x = pad.l + i * bw + (bw - barW) / 2; let acc = 0;
      const parts = SERIES.filter(([k]) => w[k] > 0);
      parts.forEach(([k, , c], j) => {
        const y1 = y(acc + w[k]), y0 = y(acc), gap = acc ? 2 : 0, h = Math.max(1, y0 - y1 - gap), top = j === parts.length - 1, rr = Math.min(4, h);
        s += top ? `<path d="M${x},${y1 + h} v${-(h - rr)} q0,-${rr} ${rr},-${rr} h${barW - 2 * rr} q${rr},0 ${rr},${rr} v${h - rr} z" fill="${c}"/>` : `<rect x="${x}" y="${y1}" width="${barW}" height="${h}" fill="${c}"/>`;
        acc += w[k];
      });
      s += `<text x="${x + barW / 2}" y="${H - 8}" text-anchor="middle">Week ${w.w}</text><text x="${x + barW / 2}" y="${y(tot(w)) - 6}" text-anchor="middle" style="fill:var(--ink);font-weight:700">${tot(w)}</text>`;
      s += `<rect class="hit" data-w="${i}" x="${pad.l + i * bw}" y="${pad.t}" width="${bw}" height="${H - pad.t - pad.b}"/>`;
    });
    $('#chart').innerHTML = s + '</svg>';
    $('#legend').innerHTML = SERIES.map(([k, l, c]) => `<span><i style="background:${c}"></i>${l} <b>${weeks.reduce((a, w) => a + w[k], 0)}</b></span>`).join('');
    const tip = $('#tip');
    $('#chart').onmousemove = e => { const h = e.target.closest('[data-w]'); if (!h) { tip.hidden = true; return; } const w = weeks[+h.dataset.w]; tip.innerHTML = `<b>Week ${w.w}</b><br>${SERIES.map(([k, l]) => `${l}: ${w[k]}`).join('<br>')}<br>Regulars: ${w.regulars}`; tip.hidden = false; tip.style.left = Math.min(innerWidth - 250, e.clientX + 12) + 'px'; tip.style.top = e.clientY + 12 + 'px'; };
    $('#chart').onmouseleave = () => { tip.hidden = true; };
  }

  // save → Recipie dashboard
  $('#save').onsubmit = async e => {
    e.preventDefault();
    const f = e.target, msg = $('#save-msg'); msg.className = 'form-msg';
    const data = Object.fromEntries(new FormData(f));
    const phone = String(data.phone || '').replace(/\D/g, '').slice(-10);
    if (!data.name || !data.business || !data.area || !/^[6-9]\d{9}$/.test(phone)) { msg.textContent = 'Please fill in every field with a 10-digit mobile number.'; msg.classList.add('err'); return; }
    if (!f.consent.checked) { msg.textContent = 'Please tick the box so we can contact you.'; msg.classList.add('err'); return; }
    const best = runs.filter(x => last && x.biz === last.cfg.biz).sort((a, b) => b.net - a.net)[0];
    const body = { ...data, phone, consent: true, source: 'club-sim', strategy: last && { practiceBusiness: P.byId(last.cfg.biz).name, giveBack: best ? best.gb : last.cfg.giveBack, partners: best ? best.partners : [], campaign: (CAMPS.find(c => c[0] === (best ? best.campaign : st.campaign)) || [, ''])[1], networkStrength: best ? best.strength : last.r.strength, gain: best ? best.net : last.r.net, runs: runs.length } };
    const api = location.hostname === 'localhost' ? 'http://localhost:8890/api/club' : 'https://recipiesearch.com/api/club';
    f.querySelector('[type=submit]').disabled = true; msg.textContent = 'Saving…';
    try {
      const r = await fetch(api, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(r.status);
      msg.textContent = `Saved. Thanks, ${data.name.split(' ')[0]}! We’ll WhatsApp you from +91 74166 60336.`; msg.classList.add('ok'); f.reset();
    } catch { msg.textContent = 'That didn’t go through. Please try again, or WhatsApp us.'; msg.classList.add('err'); }
    f.querySelector('[type=submit]').disabled = false;
  };
})();

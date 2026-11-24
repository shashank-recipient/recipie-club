// Recipie product switcher. The same file ships on recipiesearch.com, recipiepoints.com and recipieapp.club.
// Usage: <div class="rc-apps" data-current="search|points|club" data-src="rs"></div> then <script src="apps.js" defer></script>
(function () {
  const T = {
    en: { title: 'Recipie apps', search: ['Recipie Search', 'Find what to do nearby'], points: ['Recipie Points', 'Earn 10–20% back, spend it locally'], club: ['Recipie Club', 'For businesses · practice mode'], next: ['Where we open next', 'Ask for your area'], here: 'You’re here' },
    hi: { title: 'Recipie ऐप्स', search: ['Recipie Search', 'आस-पास क्या करें, खोजें'], points: ['Recipie Points', '10–20% वापस कमाएँ, लोकल खर्च करें'], club: ['Recipie Club', 'व्यवसायों के लिए · अभ्यास मोड'], next: ['आगे कहाँ खुलेगा', 'अपने इलाके के लिए कहें'], here: 'आप यहाँ हैं' },
    te: { title: 'Recipie యాప్‌లు', search: ['Recipie Search', 'దగ్గర్లో ఏం చేయాలో కనుగొనండి'], points: ['Recipie Points', '10–20% తిరిగి సంపాదించి, స్థానికంగా ఖర్చు చేయండి'], club: ['Recipie Club', 'వ్యాపారాల కోసం · ప్రాక్టీస్ మోడ్'], next: ['తర్వాత ఎక్కడ తెరుస్తాం', 'మీ ప్రాంతం కోసం అడగండి'], here: 'మీరు ఇక్కడ ఉన్నారు' },
  };
  const ICON = {
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    points: '<circle cx="12" cy="12" r="8.5"/><path d="M9 9h4.2a2.2 2.2 0 010 4.4H9V9zm0 4.4V16"/>',
    club: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5M11 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5"/>',
    next: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0113 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  };
  const css = `.rc-apps{position:relative;display:inline-flex}
.rc-apps>button{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;border:1px solid currentColor;border-color:color-mix(in srgb,currentColor 25%,transparent);background:transparent;color:inherit;cursor:pointer;padding:0}
.rc-apps>button:hover,.rc-apps>button[aria-expanded="true"]{background:color-mix(in srgb,currentColor 10%,transparent)}
.rc-apps>button svg{width:20px;height:20px}
.rc-pop{position:absolute;right:0;top:calc(100% + 8px);z-index:90;width:min(320px,calc(100vw - 24px));background:#fff;color:#22150F;border:1px solid #E1D8CF;border-radius:16px;box-shadow:0 18px 50px rgba(30,20,10,.22);padding:10px;font:15px/1.35 system-ui,-apple-system,'Segoe UI',sans-serif;text-align:left}
.rc-pop[hidden]{display:none}
.rc-pop h2{font:600 12px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#7a6a60;margin:6px 8px 10px}
.rc-pop a{display:grid;grid-template-columns:40px 1fr;gap:2px 12px;align-items:center;padding:10px 8px;border-radius:12px;color:inherit;text-decoration:none}
.rc-pop a:hover,.rc-pop a:focus-visible{background:#F6F1EB;outline:none}
.rc-pop a.on{background:#FBE3D9}
.rc-pop .ic{grid-row:1/3;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:#22150F;color:#F5A524}
.rc-pop .ic svg{width:22px;height:22px}
.rc-pop b{font-weight:700}.rc-pop small{color:#6f5f55;font-size:13px}
.rc-pop .here{font-size:11px;font-weight:700;color:#B8321C;margin-left:6px}
@media (prefers-color-scheme:dark){.rc-pop{background:#2A1B13;color:#F3EFEA;border-color:#4A362B}.rc-pop h2,.rc-pop small{color:#CDBFB5}.rc-pop a:hover{background:#3A2A20}.rc-pop a.on{background:#4A1D14}.rc-pop .here{color:#FF8A6E}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const lang = () => (T[(document.documentElement.lang || 'en').slice(0, 2)] ? document.documentElement.lang.slice(0, 2) : 'en');
  document.querySelectorAll('.rc-apps').forEach(box => {
    const cur = box.dataset.current, src = box.dataset.src || 'apps';
    const links = { search: `https://recipiesearch.com/?src=${src}`, points: `https://recipiepoints.com/?src=${src}`, club: `https://recipieapp.club/?src=${src}`, next: `https://recipiesearch.com/next/?src=${src}` };
    box.innerHTML = `<button type="button" aria-haspopup="true" aria-expanded="false"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg></button><div class="rc-pop" role="menu" hidden></div>`;
    const btn = box.querySelector('button'), pop = box.querySelector('.rc-pop');
    const render = () => {
      const t = T[lang()];
      btn.setAttribute('aria-label', t.title);
      pop.innerHTML = `<h2>${t.title}</h2>` + ['search', 'points', 'club', 'next'].map(k => `<a role="menuitem" href="${links[k]}" class="${k === cur ? 'on' : ''}"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg></span><b>${t[k][0]}${k === cur ? `<span class="here">${t.here}</span>` : ''}</b><small>${t[k][1]}</small></a>`).join('');
    };
    const close = () => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', e => { e.stopPropagation(); if (pop.hidden) { render(); pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); } else close(); });
    document.addEventListener('click', e => { if (!box.contains(e.target)) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { close(); btn.focus(); } });
  });
})();

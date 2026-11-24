// Practice Nagar: a made-up precinct with made-up businesses, used by the practice games.
// Every number here is illustrative. Nothing describes a real business.
window.PRACTICE = (function () {
  // service-led businesses only for now (no resellers of physical goods, where margins can't fund a give-back)
  const B = [
    { id: 'cafe', name: 'Morning Mug Café', short: 'Morning Mug', seg: 'Café', icon: '☕', weekly: 260, spend: 220, repeat: 0.34 },
    { id: 'salon', name: 'Sharp & Shine Salon', short: 'Sharp & Shine', seg: 'Salon', icon: '✂️', weekly: 90, spend: 650, repeat: 0.42 },
    { id: 'gym', name: 'Iron Den Gym', short: 'Iron Den', seg: 'Gym', icon: '🏋️', weekly: 150, spend: 300, repeat: 0.6 },
    { id: 'tuition', name: 'Bright Minds Tuition', short: 'Bright Minds', seg: 'Tuition', icon: '📚', weekly: 70, spend: 600, repeat: 0.7 },
    { id: 'florist', name: 'Petal & Stem Florist', short: 'Petal & Stem', seg: 'Florist', icon: '💐', weekly: 60, spend: 550, repeat: 0.22 },
    { id: 'bakery', name: 'Oven Fresh Bakery', short: 'Oven Fresh', seg: 'Bakery', icon: '🥐', weekly: 300, spend: 260, repeat: 0.38 },
    { id: 'pet', name: 'Paws & Bubbles Pet Spa', short: 'Paws & Bubbles', seg: 'Pet grooming', icon: '🐶', weekly: 45, spend: 900, repeat: 0.5 },
    { id: 'auto', name: 'Gleam Auto Care', short: 'Gleam Auto', seg: 'Auto care', icon: '🚗', weekly: 80, spend: 800, repeat: 0.4 },
    { id: 'game', name: 'Level Up Game Zone', short: 'Level Up', seg: 'Game zone', icon: '🎮', weekly: 220, spend: 400, repeat: 0.35 },
    { id: 'activity', name: 'Clay & Climb Activity Centre', short: 'Clay & Climb', seg: 'Activity centre', icon: '🧗', weekly: 120, spend: 700, repeat: 0.45 },
  ];
  // how often customers of one place go to another just before or after (0–1)
  const AFF = {
    'cafe|gym': .34, 'cafe|salon': .22, 'cafe|bakery': .16, 'cafe|tuition': .12, 'cafe|florist': .1, 'cafe|pet': .18, 'cafe|auto': .26, 'cafe|game': .2, 'cafe|activity': .22,
    'salon|florist': .2, 'salon|bakery': .08, 'salon|gym': .1, 'salon|tuition': .04, 'salon|pet': .08, 'salon|auto': .1, 'salon|game': .04, 'salon|activity': .05,
    'gym|bakery': .08, 'gym|tuition': .03, 'gym|florist': .02, 'gym|pet': .05, 'gym|auto': .08, 'gym|game': .05, 'gym|activity': .08,
    'tuition|bakery': .3, 'tuition|florist': .03, 'tuition|pet': .02, 'tuition|auto': .03, 'tuition|game': .1, 'tuition|activity': .14,
    'florist|bakery': .22, 'florist|pet': .04, 'florist|auto': .03, 'florist|game': .03, 'florist|activity': .06,
    'bakery|pet': .1, 'bakery|auto': .08, 'bakery|game': .18, 'bakery|activity': .2,
    'pet|auto': .06, 'pet|game': .03, 'pet|activity': .05,
    'auto|game': .12, 'auto|activity': .06,
    'game|activity': .2,
  };
  const aff = (a, b) => AFF[`${a}|${b}`] ?? AFF[`${b}|${a}`] ?? 0.03;
  // businesses that sell overlapping things: natural rivals
  const RIVAL = { cafe: ['bakery'], bakery: ['cafe'], game: ['activity'], activity: ['game'], salon: [], gym: [], tuition: [], florist: [], pet: [], auto: [] };
  const routes = [ // ready-made partnerships residents see in Practice Nagar
    ['gym', 'cafe', 'Gym, then breakfast'], ['tuition', 'bakery', 'Tuition pickup, then a snack'], ['salon', 'florist', 'Get ready, pick up flowers'],
    ['cafe', 'salon', 'Coffee while you wait'], ['florist', 'bakery', 'Flowers and a cake'], ['auto', 'cafe', 'Coffee while your car is cleaned'],
    ['pet', 'cafe', 'Coffee while your pet is groomed'], ['game', 'bakery', 'Game zone, then a snack'], ['activity', 'cafe', 'Pottery class, then coffee'],
  ];
  const byId = id => B.find(b => b.id === id);

  // ------- the "run your corner for a month" model -------
  // give-back: points returned to customers as a share of their bill (10–20% in practice mode)
  const GB = { 10: { search: .045, repeat: .085 }, 12: { search: .055, repeat: .1 }, 15: { search: .07, repeat: .12 }, 18: { search: .085, repeat: .14 }, 20: { search: .095, repeat: .15 } };
  const LINK = { partner: .2, follow: .05, neutral: 0, rival: 0 };
  function simulate(cfg) {
    const me = byId(cfg.biz), gb = GB[cfg.giveBack], rng = seeded(cfg.seed || 7);
    const weeks = [];
    let prevNew = 0;
    const flows = {};
    for (let w = 0; w < 4; w++) {
      const regulars = Math.round(me.weekly * (0.96 + rng() * 0.08));
      let search = Math.round(me.weekly * gb.search * (0.9 + rng() * 0.2) * (w === 0 ? 0.6 : 1));
      let partners = 0;
      for (const o of B) {
        if (o.id === me.id) continue;
        const rel = cfg.network[o.id] || 'neutral';
        let f = Math.sqrt(o.weekly * me.weekly) * aff(me.id, o.id) * LINK[rel] * (w === 0 ? 0.5 : 1); // both sizes matter: a small shop can't absorb a big neighbour's crowd
        if (cfg.campaign === 'bundle' && rel === 'partner' && w >= 2) f *= 1.6;
        f = Math.round(f * (0.9 + rng() * 0.2));
        if (f > 0) { flows[o.id] = (flows[o.id] || 0) + f; partners += f; }
      }
      let campaign = 0;
      if (cfg.campaign === 'founding' && w === 1) campaign = Math.round(me.weekly * 0.1);
      if (cfg.campaign === 'walk' && w >= 1) {
        const rivals = B.filter(o => cfg.network[o.id] === 'rival');
        if (rivals.length) campaign = Math.round(me.weekly * 0.04 * Math.min(2, rivals.length) * (0.9 + rng() * 0.2));
      }
      search += campaign;
      const back = Math.round(prevNew * (me.repeat * 0.6 + gb.repeat));
      const newcomers = search + partners;
      prevNew = newcomers + Math.round(prevNew * 0.3);
      weeks.push({ w: w + 1, regulars, search, partners, back });
    }
    const extra = weeks.reduce((s, x) => s + x.search + x.partners + x.back, 0);
    const extraRevenue = extra * me.spend;
    // points go to every Recipie customer: the new ones, and the regulars who'd have come anyway (assume 30% of regulars use Recipie)
    const regularsOnRecipie = Math.round(weeks.reduce((s, x) => s + x.regulars, 0) * 0.3);
    const pointsCost = Math.round((extraRevenue + regularsOnRecipie * me.spend) * (cfg.giveBack / 100));
    const net = extraRevenue - pointsCost;
    // network strength: good partners, not just many
    const parts = B.filter(o => cfg.network[o.id] === 'partner');
    const quality = parts.reduce((s, o) => s + aff(me.id, o.id), 0);
    const follows = B.filter(o => cfg.network[o.id] === 'follow').length;
    const rivals = B.filter(o => cfg.network[o.id] === 'rival');
    const coop = cfg.campaign === 'walk' && rivals.length ? 12 : 0;
    const strength = Math.min(100, Math.round(quality * 140 + follows * 3 + coop + (parts.length ? 8 : 0)));
    const best = Object.entries(flows).sort((a, b) => b[1] - a[1])[0];
    const tips = [];
    if (best) tips.push(`${byId(best[0]).name} sent you the most customers: ${best[1]} this month.`);
    const unused = B.filter(o => o.id !== me.id && !['partner', 'rival'].includes(cfg.network[o.id])).sort((a, b) => aff(me.id, b.id) - aff(me.id, a.id))[0];
    if (unused && aff(me.id, unused.id) >= .15) tips.push(parts.length >= 3 ? `Your 3 partner spots are full. ${unused.name} might be worth swapping in: many of their customers visit a ${me.seg.toLowerCase()} the same day.` : `Try partnering with ${unused.name}: many of their customers visit a ${me.seg.toLowerCase()} the same day.`);
    if (!parts.length) tips.push('No partners yet. Partners are where most new customers come from in Recipie Club.');
    if (!cfg.quiet) {
      const rupee = n => '₹' + Math.abs(n).toLocaleString('en-IN');
      if (cfg.giveBack === 20) { const alt = simulate({ ...cfg, giveBack: 18, quiet: true }); tips.push(alt.net >= net * 0.97 ? `At 20%, your regulars earn a lot of points too. 18% would gain about the same (${rupee(alt.net)}) for ${rupee(pointsCost - alt.pointsCost)} less in points.` : `20% pays off here: ${rupee(net - alt.net)} more than at 18%, though it gives ${rupee(pointsCost - alt.pointsCost)} more in points.`); }
      if (cfg.giveBack === 15) { const alt = simulate({ ...cfg, giveBack: 18, quiet: true }); if (alt.net > net * 1.03) tips.push(`18% would bring more people back: ${rupee(alt.net - net)} more gain this month.`); }
      if (cfg.giveBack <= 12) { const alt = simulate({ ...cfg, giveBack: 15, quiet: true }); tips.push(alt.net > net * 1.03 ? `At ${cfg.giveBack}%, fewer people find you or come back. 15% would gain ${rupee(alt.net - net)} more this month.` : `${cfg.giveBack}% works for you: about the same gain as 15%, and ${rupee(alt.pointsCost - pointsCost)} less in points.`); }
    }
    if (cfg.campaign === 'walk' && !rivals.length) tips.push('The neighbourhood walk needs a rival to run with. Mark a similar business as a rival.');
    if (cfg.campaign === 'walk' && rivals.length) tips.push(`Running a walk with ${rivals.map(r => r.name).join(' and ')} grew demand for both of you.`);
    return { weeks, extra, extraRevenue, pointsCost, net, strength, flows, regularsOnRecipie, tips };
  }
  function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  return { businesses: B, aff, rivals: RIVAL, routes, byId, simulate };
})();

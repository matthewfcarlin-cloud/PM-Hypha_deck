// Renders each slide of the Hypha deck in its final (all beats revealed) state, with a numbered source footer.
const { chromium } = require('playwright');
const path = require('path');

// Footer per slide, keyed by the slide's data-title. Slides not listed keep the footer written in index.html. Numbers point to the References page.
const FOOT = {
  'Problem space': 'Sources: Materials [5][6][7] · Cost [10] · Waste [9] · Customer [11] · Mold cost and lead time from team research. Full evidence in the speaker notes; references on the last pages.',
  'The problem': 'Sources: plastic waste and recycling [5][6][7] · EPR and polystyrene bans [1] · Full references on the last pages.',
  'Material waste': 'Sources: [5] US EPA, Plastics and Containers & Packaging data · [6] Our World in Data, "Packaging is the source of 40% of the planet\'s plastic waste" · [7] Beyond Plastics · [8] The Recycling Partnership',
  'Cost and tooling': 'Mold cost and lead time from team research.',
  'Customer': 'Sources: [13] 2025 study of 1,193 consumers · [14] Journal of Consumer Psychology unboxing experiments · [11] Adobe Express packaging survey · [12] Ryder e-commerce study via Packaging Technology Today',
  'Why now': 'Market size: [1] Future Market Insights, US & Canada Protective Packaging Market (2025, 2035 forecast, 5.1% CAGR as reported). Drivers: [4] Market Research Future, Void Fill Packaging System Market. Curve between the two endpoints is interpolated.',
  'Additive manufacturing': 'Illustration: the scrap share is measured from this drawing, not an industry figure.',
  'Customer interview': 'Source: [15] customer interview with the Holiday team, conducted by Ledger (Group 11). One interview; more needed to confirm the price ceiling.',
  'Value map': 'Scores are our team\'s estimates, to be checked in customer interviews.',
  'Use of funds': 'Source: [24] Hypha Pro Forma (Google Sheet, linked on the slide). Raise = peak cash need of $3.89M (month 33) plus a 15% buffer, rounded. Each bucket is its share of spending until the cash low point, scaled to $3.89M; the buffer sits in Operations + reserve. Full split on the sheet\'s Use of Funds tab. Costs and volumes are team assumptions.',
  'Market size': 'Circles not to scale. Year 3 revenue ($11.8M) from [24] Hypha Pro Forma. Sources: [1] Future Market Insights, US & Canada Protective Packaging Market · [2] Market Intelo, Void Fill Packaging Market (e-commerce share) · [3] Future Market Insights, Void Fill Packaging Systems Market Share Analysis. SOM share is our assumption.',
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 956 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
  const url = 'file://' + path.resolve(__dirname, 'deck.html');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '#bar,#notes{display:none!important}' });
  const n = await page.evaluate(() => document.querySelectorAll('#stage .slide').length);
  const links = {};
  await page.keyboard.press('Home'); await page.waitForTimeout(800);
  for (let i = 1; i <= n; i++) {
    if (i > 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900); }
    const [beats, title] = await page.evaluate(i => { const s = document.querySelectorAll('#stage .slide')[i - 1]; return [+(s.dataset.beats || 0), s.dataset.title]; }, i);
    for (let b = 0; b < beats; b++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1500); }
    await page.evaluate(([i, txt]) => {
      const s = document.querySelectorAll('#stage .slide')[i - 1];
      if (!txt) return;
      let f = s.querySelector('.src');
      if (!f) { f = document.createElement('div'); f.className = 'src'; s.appendChild(f); }
      f.textContent = txt;
    }, [i, FOOT[title] || null]);
    await page.waitForTimeout(5500);
    const active = await page.evaluate(() => [...document.querySelectorAll('#stage .slide')].findIndex(s => s.classList.contains('active')) + 1);
    const box = await page.locator('#stage').boundingBox();
    links[i] = await page.evaluate(i => [...document.querySelectorAll('#stage .slide')[i - 1].querySelectorAll('a[href]')].map(a => { const r = a.getBoundingClientRect(); return { href: a.href, x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(l => l.w > 0), i);
    await page.screenshot({ path: `slide-${String(i).padStart(2, '0')}.png`, clip: box });
    console.log('slide', i, title, 'active', active, 'beats', beats, 'links', links[i].length);
  }
  require('fs').writeFileSync('links.json', JSON.stringify(links));
  await browser.close();
})();

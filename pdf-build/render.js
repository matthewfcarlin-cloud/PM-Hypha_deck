// Renders each slide of the Hypha deck in its final (all beats revealed) state, with a numbered source footer.
const { chromium } = require('playwright');
const path = require('path');

// Footer per slide (1-indexed). null = no footer. Numbers point to the References page.
const FOOT = {
  3: 'Sources: Materials [5][6][7] · Cost [10] · Waste [9] · Customer [11] · Mold cost and lead time from team research. Full evidence in the speaker notes; references on the last pages.',
  4: 'Sources: plastic waste and recycling [5][6][7] · EPR and polystyrene bans [1] · Full references on the last pages.',
  5: 'Sources: [5] US EPA, Plastics and Containers & Packaging data · [6] Our World in Data, "Packaging is the source of 40% of the planet\'s plastic waste" · [7] Beyond Plastics · [8] The Recycling Partnership',
  6: 'Green premiums compare recycled with standard materials. Source: [10] Packaging Technology Today, "The Rise of Sustainable Packaging in the U.S."',
  7: 'Sources: [13] 2025 study of 1,193 consumers · [14] Journal of Consumer Psychology unboxing experiments · [11] Adobe Express packaging survey · [12] Ryder e-commerce study via Packaging Technology Today',
  8: 'Market size: [1] Future Market Insights, US & Canada Protective Packaging Market (2025, 2035 forecast, 5.1% CAGR as reported). Drivers: [4] Market Research Future, Void Fill Packaging System Market. Curve between the two endpoints is interpolated.',
  9: 'Illustration: the scrap share is measured from this drawing, not an industry figure.',
  13: 'Source: [15] customer interview with the Holiday team, conducted by Ledger (Group 11). One interview; more needed to confirm the price ceiling.',
  14: 'Scores are our team\'s estimates, to be checked in customer interviews.',
  15: 'Circles not to scale. Sources: [1] Future Market Insights, US & Canada Protective Packaging Market · [2] Market Intelo, Void Fill Packaging Market (e-commerce share) · [3] Future Market Insights, Void Fill Packaging Systems Market Share Analysis. SOM share is our assumption.',
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 956 }, deviceScaleFactor: 2, reducedMotion: 'no-preference' });
  const url = 'file://' + path.resolve(__dirname, 'deck.html');
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '#bar,#notes{display:none!important}' });
  const n = await page.evaluate(() => document.querySelectorAll('#stage .slide').length);
  await page.keyboard.press('Home'); await page.waitForTimeout(800);
  for (let i = 1; i <= n; i++) {
    if (i > 1) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(900); }
    const beats = await page.evaluate(i => +(document.querySelectorAll('#stage .slide')[i - 1].dataset.beats || 0), i);
    for (let b = 0; b < beats; b++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1500); }
    await page.evaluate(([i, txt]) => {
      const s = document.querySelectorAll('#stage .slide')[i - 1];
      if (!txt) return;
      let f = s.querySelector('.src');
      if (!f) { f = document.createElement('div'); f.className = 'src'; s.appendChild(f); }
      f.textContent = txt;
    }, [i, FOOT[i] || null]);
    await page.waitForTimeout(5500);
    const active = await page.evaluate(() => [...document.querySelectorAll('#stage .slide')].findIndex(s => s.classList.contains('active')) + 1);
    const box = await page.locator('#stage').boundingBox();
    await page.screenshot({ path: `slide-${String(i).padStart(2, '0')}.png`, clip: box });
    console.log('slide', i, 'active', active, 'beats', beats);
  }
  await browser.close();
})();

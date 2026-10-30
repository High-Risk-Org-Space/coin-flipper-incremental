const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  
  // Verify UI elements exist
  const helperShopText = await page.textContent('#helper-shop');
  console.log("Helper Shop rendered:", helperShopText.includes('Little Helpers'));
  
  const hatShopText = await page.textContent('#hat-shop');
  console.log("Hat Shop rendered:", hatShopText.includes('Hat Boutique'));
  
  const slotMachine = await page.$('#slot-machine-panel');
  console.log("Slot Machine rendered:", slotMachine !== null);
  
  const sacrificeSection = await page.$('#sacrifice-section');
  console.log("Sacrifice Section rendered:", sacrificeSection !== null);
  
  // Click open talents
  await page.click('#btn-open-talents');
  const modalVisible = await page.isVisible('#talent-tree-modal');
  console.log("Talent Modal can be opened:", modalVisible);
  
  // Take screenshot
  await page.screenshot({ path: 'frontend_test.png' });
  
  await browser.close();
})();

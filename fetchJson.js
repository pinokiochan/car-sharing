const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

// Enable stealth mode
puppeteer.use(StealthPlugin());

// Delay function for dynamic content loading
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Show browser to detect CAPTCHA if any
    args: ["--no-sandbox", "--disable-setuid-sandbox"], // For better stability
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
  );

  const allCarData = [];
  let currentPage = 1;

  while (allCarData.length < 1000) {
    console.log(`📄 Scraping page ${currentPage}...`);

    try {
      await page.goto(`https://auto.ru/cars/new/?page=${currentPage}`, {
        waitUntil: "networkidle2",
        timeout: 60000, // Increase timeout
      });

      await delay(5000); // Delay to load dynamic content

      const carsOnPage = await page.evaluate(() => {
        const carElements = document.querySelectorAll("[data-seo='listing-item']");
        const carData = [];

        carElements.forEach((car) => {
          const fullName = car.querySelector(".ListingItemTitle__link")?.innerText.trim() || "N/A";
          const [brand, ...modelParts] = fullName.split(" ");
          const model = modelParts.join(" ") || "N/A";

          const yearText = car.querySelector(".CardInfoGroupedRow_year .CardInfoGroupedRow__cellValue")?.innerText.trim() || "2024";
          const year = parseInt(yearText) || new Date().getFullYear();

          let priceText = car.querySelector(".ListingItemGroup__price")?.innerText.trim() || "0";
          let minPrice = priceText.split("–")[0]?.replace(/\D/g, "");
          minPrice = minPrice ? parseInt(minPrice) : 0;
          const pricePerDay = minPrice > 0 ? Math.round(minPrice * 6 / 730) : 0;

          const available = car.querySelector(".CardInfoGroupedRow_availability .CardInfoGroupedRow__cellValue")?.innerText.includes("В наличии") || false;
          const quantity = Math.floor(Math.random() * 5) + 1;

          const img = car.querySelector(".LazyImage__image")?.src || null;
          if (!img) return; // Skip if no image

          const engine = car.querySelectorAll(".ListingItemGroup__techSummaryValue")[0]?.innerText.trim() || "N/A";
          const transmission = car.querySelectorAll(".ListingItemGroup__techSummaryValue")[1]?.innerText.trim() || "N/A";
          const drive = car.querySelectorAll(".ListingItemGroup__techSummaryValue")[2]?.innerText.trim() || "N/A";
          const complectation = car.querySelector(".ListingItemGroup__techSummaryValue a")?.innerText.trim() || "N/A";

          carData.push({
            brand,
            model,
            year,
            pricePerDay,
            available,
            quantity,
            img,
            engine,
            transmission,
            drive,
            complectation,
            createdAt: new Date(),
          });
        });

        return carData;
      });

      console.log(`✅ Found ${carsOnPage.length} cars on page ${currentPage}`);

      if (carsOnPage.length === 0) break;

      allCarData.push(...carsOnPage);

      if (allCarData.length >= 1000) break;

      currentPage++;
    } catch (error) {
      console.error(`❌ Error scraping page ${currentPage}:`, error.message);
      break;
    }
  }

  await browser.close();

  fs.writeFileSync("cars.json", JSON.stringify(allCarData.slice(0, 1000), null, 2));
  console.log(`✅ Scraped ${allCarData.length} car listings. Data saved to cars.json`);
})();

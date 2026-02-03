import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';

declare const openai: any; 

export class MarketsMojoScraper {
    browser: Browser | null;
    page: Page | null;

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async initialize(): Promise<void> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                executablePath: "/snap/bin/chromium",
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            this.page = await this.browser.newPage();
        }
    }

    async login(): Promise<boolean> {
        if (!this.page) throw new Error('Page not initialized. Call initialize() first.');
        try {
            console.log('beacuse of this we open pop up');
            await this.page.goto('https://www.marketsmojo.com/mojofeed/login', { waitUntil: 'networkidle2' });
            console.log('Navigated to login page');

            const emailSelector = 'input[formcontrolname="email"]';
            const passwordSelector = 'input[type="password"]';
            const submitButton = 'button[type="submit"]';

            await this.page.waitForSelector(emailSelector, { timeout: 10000 });
            await this.page.waitForSelector(passwordSelector);

            await this.page.type(emailSelector, process.env.MARKETSMOJO_EMAIL || '', { delay: 100 });
            await this.page.type(passwordSelector, process.env.MARKETSMOJO_PASSWORD || '', { delay: 100 });

            await this.page.click(submitButton);
            await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

            console.log('✅ Successfully logged in');
            return true;
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }

    async captureScreenshot(url: string, filename: string): Promise<string> {
        if (!this.page) throw new Error('Page not initialized. Call initialize() first.');
        try {
            console.log(`Capturing screenshot from: ${url}`);
            await this.page.goto(url, { waitUntil: 'networkidle2' });

            // Auto-scroll to the bottom to ensure the table is fully loaded
            await this.page.evaluate(async () => {
                await new Promise<void>((resolve) => {
                    let totalHeight = 0;
                    const distance = 500; // Scroll by 500px at a time
                    const timer = setInterval(() => {
                        const scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if (totalHeight >= scrollHeight) {
                            clearInterval(timer);
                            resolve();
                        }
                    }, 100);
                });
            });

            // Add a delay to ensure page is completely loaded
            await new Promise(resolve => setTimeout(resolve, 3000));

            const screenshotPath = `screenshots/${filename}`;
            await fs.mkdir('screenshots', { recursive: true });

            // Take a full-page screenshot
            await this.page.screenshot({ path: screenshotPath, fullPage: true } as any);
            console.log(`✅ Screenshot saved: ${screenshotPath}`);
            return screenshotPath;
        } catch (error) {
            console.error(`❌ Failed to capture screenshot from ${url}:`, error);
            throw error;
        }
    }

    async extractDataFromScreenshot(screenshotPath: string): Promise<any> {
        try {
            const imageBuffer = await fs.readFile(screenshotPath);
            const imageBase64 = imageBuffer.toString('base64');

            console.log("🔄 Sending screenshot to GPT-4o for extraction...");

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are an AI that extracts tabular data from images and returns JSON output." },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "Extract the tabular data from this image and return it in JSON format." },
                            { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }
                        ]
                    }
                ]
            });

            const raw = response.choices?.[0]?.message?.content ?? '{}';
            const extractedData = JSON.parse(raw.replace(/```json|```/g, "").trim());
            console.log("✅ Data extraction successful:", extractedData);

            return extractedData;
        } catch (error) {
            console.error("❌ Failed to extract data:", error);
            throw error;
        }
    }

    async scrapeWithScreenshot(url: string, filename: string, category?: string): Promise<{ extractedData: any; jsonFilename: string; screenshotPath: string } | null> {
        try {
            const screenshotPath = await this.captureScreenshot(url, filename);
            const extractedData = await this.extractDataFromScreenshot(screenshotPath);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const jsonFilename = `extracted_data_${timestamp}.json`;

            await fs.writeFile(jsonFilename, JSON.stringify(extractedData, null, 2));
            console.log(`✅ Extracted data saved to ${jsonFilename}`);

            // Automatically save data to MongoDB (not implemented here)
            return { extractedData, jsonFilename, screenshotPath };
        } catch (error) {
            console.error(`❌ Failed to scrape and extract data from ${url}:`, error);
            return null;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}

const scraper = new MarketsMojoScraper();
export default scraper;
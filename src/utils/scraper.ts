import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-core";

export class Trading80AgentScraper{
    page:Page | null;
    browser:Browser | null;
    
    constructor(){
        this.page=null,
        this.browser=null;
    }
    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
              headless: true,
              executablePath: "/snap/bin/chromium", 
              args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            this.page = await this.browser.newPage();
        }
    }
    async login() {
        try {
            if(!this || !this.page){
                throw new Error("Error in getting the page")
            }
            console.log('beacuse of this we open pop up');
            await this.page.goto('https://www.marketsmojo.com/mojofeed/login', { waitUntil: 'networkidle2' });
            console.log('Navigated to login page');

            const emailSelector = 'input[formcontrolname="email"]';
            const passwordSelector = 'input[type="password"]';
            const submitButton = 'button[type="submit"]';

            await this.page.waitForSelector(emailSelector, { timeout: 10000 });
            await this.page.waitForSelector(passwordSelector);

            await this.page.type(emailSelector, process.env.MARKETSMOJO_EMAIL as string, { delay: 100 });
            await this.page.type(passwordSelector, process.env.MARKETSMOJO_PASSWORD as string, { delay: 100 });

            await this.page.click(submitButton);
            await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

            const pageCookies=await (this.page).cookies();

            console.log("page cookies",pageCookies);

            console.log('✅ Successfully logged in');
            return pageCookies;
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }
};

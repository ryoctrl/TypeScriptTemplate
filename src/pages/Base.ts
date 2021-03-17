import { Browser, Page } from "puppeteer";

class BasePage {
  browser: Browser;
  page: Page;

  constructor(browser: Browser, page: Page) {
    this.browser = browser;
    this.page = page;
  }

  async open(): Promise<void> {
    if (!this.page || this.page.isClosed()) {
      this.page = await this.browser.newPage();
    }
  }
}

export default BasePage;

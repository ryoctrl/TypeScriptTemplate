import { URL } from "../consts";
import { Selectors } from "../consts/selector";
import BasePage from "./Base";

class LoginPage extends BasePage {
  async open(): Promise<void> {
    await super.open();
    await this.page.goto(URL.LOGIN, { waitUntil: "networkidle2" });
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.waitForSelector(Selectors.LOGIN.USERNAME);

    await this.page.type(Selectors.LOGIN.USERNAME, username);
    await this.page.type(Selectors.LOGIN.PASSWORD, password);
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      this.page.keyboard.press("Enter"),
    ]);
  }
}

export default LoginPage;

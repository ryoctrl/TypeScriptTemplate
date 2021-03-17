import { promises } from "fs";
import puppeteer, { Browser, Page } from "puppeteer";
import { Env } from "./consts/env";
import LoginPage from "./pages/Login";
import UserPage, { Post } from "./pages/User";
import moment from "moment";

const CookieFile = "./cookies.txt";

const login = async (browser: Browser, page: Page) => {
  const cookies: puppeteer.Protocol.Network.CookieParam[] = await promises
    .readFile(CookieFile)
    .then((buf) => buf.toString())
    .then(
      (cookiesStr: string): puppeteer.Protocol.Network.CookieParam[] =>
        (cookiesStr
          ? JSON.parse(cookiesStr)
          : JSON.parse("[]")) as puppeteer.Protocol.Network.CookieParam[]
    )
    .catch(() => []);

  if (cookies.length > 0) {
    await page.setCookie(...cookies);
  } else {
    const loginPage = new LoginPage(browser, page);
    await loginPage.open();
    await loginPage.login(Env.INSTAGRAM_USERNAME, Env.INSTAGRAM_PASSWORD);

    await promises.writeFile(CookieFile, JSON.stringify(await page.cookies()));
  }
};

const saveCsv = async (datas: { [name: string]: Post }, username: string) => {
  const str =
    "index,url,likes,comments\n" +
    Object.entries(datas)
      .map(([url, post], idx) =>
        [idx + 1, url, post.likes, post.comments].join(",")
      )
      .join("\n");
  const resultPath = `./results/insta_user_detail_${username}_${moment().format(
    "YYYYMMDD_HHmmss"
  )}.csv`;
  await promises.writeFile(resultPath, str);
};

const saveJson = async (datas: { [name: string]: Post }, username: string) => {
  const resultPath = `./results/insta_user_detail_${username}_${moment().format(
    "YYYYMMDD_HHmmss"
  )}.json`;
  await promises.writeFile(resultPath, JSON.stringify(datas));
};

const main = async (): Promise<void> => {
  const browser = await puppeteer.launch({ headless: true, devtools: true });
  const page = await browser.newPage();

  await login(browser, page);
  const username = "ahsinst";

  const userPage = new UserPage(browser, page, username);
  const posts = await userPage.fetchUserPostDatas();
  await saveCsv(posts, username);
  await saveJson(posts, username);
  await browser.close();
  return;
};

main()
  .then(() => console.log("Process completed!"))
  .catch((err) => console.error(err));

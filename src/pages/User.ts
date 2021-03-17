import { Browser, Page } from "puppeteer";
import { URL } from "../consts";
import { Selectors } from "../consts/selector";
import BasePage from "./Base";
import { format } from "util";

export type Post = {
  likes: number;
  comments: number;
};

class UserPage extends BasePage {
  url: string;

  constructor(browser: Browser, page: Page, user: string) {
    super(browser, page);
    this.url = format(URL.SEARCH, user);
  }

  async open(): Promise<void> {
    await super.open();
    await this.page.goto(this.url, { waitUntil: "networkidle2" });
  }

  /**
   * ユーザの投稿データを取得する
   * @returns Promise<{ [name: string]: Post }>
   */
  async fetchUserPostDatas(): Promise<{ [name: string]: Post }> {
    const posts: { [name: string]: Post } = {};

    await this.open();

    const totalPosts = await this.page
      .$eval(
        Selectors.USER.TOTAL_NUMBER,
        (el) => (el as HTMLDivElement).innerText
      )
      .then((count) => Number(count) || 0);

    // 全投稿のデータを収集できるまでループ
    while (Object.entries(posts).length < totalPosts) {
      // 表示中の投稿一覧を取得
      let postElements = await this.page.$$(Selectors.USER.POSTS);
      if (postElements.length === 0) break;

      // 既に収集済の要素を除く
      const flags = await Promise.all(
        postElements.map(async (el) => {
          if (!(await el.$("a"))) return false;
          const url = await el.$eval(
            "a",
            (el: Element) => (el as HTMLLinkElement).href
          );

          return posts[url] === undefined;
        })
      );
      postElements = postElements.filter((_, idx) => flags[idx]);

      // 表示中の投稿それぞれをホバーしてurlと、表示されるモーダルからいいね数・コメント数を取得
      for (const postElement of postElements) {
        // url取得
        if (!(await postElement.$("a"))) continue;
        const url = await postElement.$eval(
          "a",
          (el: Element) => (el as HTMLLinkElement).href
        );

        // ホバー
        const hovered = await postElement
          .hover()
          .then(() => true)
          .catch(() => false);

        if (!hovered) continue;
        if (!(await postElement.$(Selectors.USER.MODAL))) continue;

        // モーダルからいいね数・コメント数を取得
        const counts = await postElement.$$eval(Selectors.USER.MODAL, (els) => {
          return Array.from(els).map((el) => (el as HTMLDivElement).innerText);
        });

        posts[url] = {
          likes: Number(counts[0]) || 0,
          comments: Number(counts[1]) || 0,
        };
      }

      // 一通りホバーできたら最下部までスクロール
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
    }
    return posts;
  }
}

export default UserPage;

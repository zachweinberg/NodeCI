const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("when logged in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("can see blog create form", async () => {
    const label = await page.getContentsOf("form label");

    expect(label).toEqual("Blog Title");
  });

  describe("and using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My Awesome Title");
      await page.type(".content input", "My Awesome Content!");
      await page.click("form button");
    });

    test("submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("submitting then saving adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(title).toEqual("My Awesome Title");
      expect(content).toEqual("My Awesome Content!");
    });
  });

  describe("and using invalid inputs", () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("the form shows an error message", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("when not logged in", async () => {
  test("user can not create blog post", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: "My Sick Title!",
          content: "Epic content."
        })
      }).then(res => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("user can not view posts", async () => {
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });
});

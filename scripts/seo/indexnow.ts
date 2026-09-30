/**
 * Ping IndexNow (Bing, Yandex, Seznam, Naver…; Bing also feeds ChatGPT search and Copilot)
 * with every URL in the live sitemap. Run after each production deploy: `pnpm indexnow`.
 */
const KEY = "d4eb6df7be7001b4bde3777fcbc356a7";
const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://build-with-bob.vercel.app"
).replace(/\/$/, "");

async function main() {
  const sitemap = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text());
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => u.startsWith(SITE));
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE).host,
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList: urls,
    }),
  });
  console.log(
    `IndexNow: submitted ${urls.length} URLs → ${res.status} ${res.statusText}`,
  );
  if (res.status >= 400) process.exit(1);
}

main();

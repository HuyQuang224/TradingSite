const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");
const cron = require("node-cron");

const app = express();
app.use(cors());

const parser = new Parser();
const FEED_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/";

// Bộ nhớ cache tin tức
let cachedNews = [];
let lastUpdated = null;

async function updateNews() {
  try {
    const feed = await parser.parseURL(FEED_URL);
    cachedNews = feed.items.slice(0, 30).map(item => ({
      title: item.title,
      url: item.link,
      publishedAt: item.pubDate,
      source: "CoinDesk"
    }));
    lastUpdated = new Date().toISOString();
    console.log(`[NewsService] Updated at ${lastUpdated}, got ${cachedNews.length} articles`);
  } catch (err) {
    console.error("Error updating news:", err.message);
  }
}

// chạy ngay khi service start
updateNews();

// chạy lại mỗi 10 phút
cron.schedule("*/10 * * * *", updateNews);

app.get("/news", (_req, res) => {
  res.json({
    lastUpdated,
    articles: cachedNews
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`News service running on http://localhost:${PORT}`));

import React, { useEffect, useState } from "react";
import axios from "axios";

type Article = { title: string; url: string; publishedAt: string; source: string };

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadNews() {
    try {
      const res = await axios.get("http://localhost:4000/news");
      setArticles(res.data.articles || []);
      setLastUpdated(res.data.lastUpdated || null);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load lần đầu
    loadNews();

    // auto refresh mỗi 10 phút
    const interval = setInterval(() => {
      console.log("Refreshing news...");
      loadNews();
    }, 600_000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">Loading crypto news...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">📰 Latest Crypto News</h2>
        {lastUpdated && (
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* News grid */}
      {articles.length === 0 ? (
        <p className="text-center text-gray-500">No news available right now.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="block bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition transform"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{a.title}</h3>
              <p className="text-sm text-gray-500">
                {a.source} — {new Date(a.publishedAt).toLocaleString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

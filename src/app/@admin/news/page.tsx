import { db } from "@/db";
import { news } from "@/db/schema";
import NewsClient from "@/app/@admin/news/newsClient";
import { desc } from "drizzle-orm";

async function getNews() {
  try {
    return await db.select().from(news).orderBy(desc(news.time));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();
  return <NewsClient initialNews={news} />;
}

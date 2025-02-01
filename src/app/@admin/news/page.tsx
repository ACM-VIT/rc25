import { prisma } from "@/utils/prisma";    
import NewsClient from "@/app/@admin/news/newsClient";
async function getNews() {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        time: "desc",
      },
    });
    return news;
  } finally {
    await prisma.$disconnect();
  }
}

export default async function NewsPage() {
  const news = await getNews();
  return <NewsClient initialNews={news} />;
}

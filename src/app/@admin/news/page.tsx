import {prisma} from "@/utils/prisma";
import NewsClient from "@/app/@admin/news/newsClient";

async function getNews() {
  try {
    return await prisma.news.findMany({
      orderBy: {
        time: "desc",
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export default async function NewsPage() {
  const news = await getNews();
  return <NewsClient initialNews={news} />;
}

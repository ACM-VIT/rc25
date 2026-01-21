'use server'

import { db } from "@/db";
import { news } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createNews(data: { title: string; content: string }) {
  await db.insert(news).values({
    ...data,
    time: new Date(),
  });
  revalidatePath('/admin/news');
}

export async function updateNews(id: string, data: { title: string; content: string }) {
  await db
    .update(news)
    .set({
      ...data,
      time: new Date(),
    })
    .where(eq(news.id, id));
  revalidatePath('/admin/news');
}

export async function deleteNews(id: string) {
  await db.delete(news).where(eq(news.id, id));
  revalidatePath('/admin/news');
}

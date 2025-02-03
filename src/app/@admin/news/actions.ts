'use server'

import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

export async function createNews(data: { title: string; content: string }) {
  try {
    await prisma.news.create({
      data: {
        ...data,
        time: new Date(),
      },
    });
    revalidatePath('/admin/news');
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateNews(id: string, data: { title: string; content: string }) {
  try {
    await prisma.news.update({
      where: { id },
      data: {
        ...data,
        time: new Date(),
      },
    });
    revalidatePath('/admin/news');
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteNews(id: string) {
  try {
    await prisma.news.delete({
      where: { id },
    });
    revalidatePath('/admin/news');
  } finally {
    await prisma.$disconnect();
  }
}
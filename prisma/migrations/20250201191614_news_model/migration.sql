-- CreateTable
CREATE TABLE "News" (
    "id" STRING NOT NULL,
    "content" STRING NOT NULL,
    "title" STRING NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

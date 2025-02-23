-- CreateTable
CREATE TABLE "Solution" (
    "id" STRING NOT NULL,
    "problemId" STRING NOT NULL,
    "code" STRING NOT NULL,
    "explanation" STRING NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Solution_problemId_key" ON "Solution"("problemId");

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

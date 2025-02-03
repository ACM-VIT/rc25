-- CreateTable
CREATE TABLE "Flags" (
    "name" STRING NOT NULL,
    "value" BOOL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Flags_name_key" ON "Flags"("name");

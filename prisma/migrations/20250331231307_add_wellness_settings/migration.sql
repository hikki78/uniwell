-- CreateTable
CREATE TABLE "WellnessSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "screenTimeLimit" INTEGER NOT NULL DEFAULT 480,
    "waterIntakeGoal" INTEGER NOT NULL DEFAULT 2000,
    "meditationGoal" INTEGER NOT NULL DEFAULT 10,
    "sleepGoal" INTEGER NOT NULL DEFAULT 8,
    "exerciseGoal" INTEGER NOT NULL DEFAULT 30,
    "readingGoal" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomHabit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "weightInScore" INTEGER NOT NULL DEFAULT 10,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomHabit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WellnessSettings_userId_key" ON "WellnessSettings"("userId");

-- AddForeignKey
ALTER TABLE "WellnessSettings" ADD CONSTRAINT "WellnessSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomHabit" ADD CONSTRAINT "CustomHabit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "DeviceData" (
    "id" SERIAL NOT NULL,
    "deviceId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceData_pkey" PRIMARY KEY ("id")
);

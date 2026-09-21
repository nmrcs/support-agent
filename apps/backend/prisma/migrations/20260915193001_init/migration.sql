-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'SHIPPED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'AGENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "eta" TEXT NOT NULL,
    "trackingCode" TEXT,
    "total" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "seq" SERIAL NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "text" TEXT NOT NULL,
    "trace" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Order_number_key" ON "Order"("number");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_seq_key" ON "Message"("seq");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

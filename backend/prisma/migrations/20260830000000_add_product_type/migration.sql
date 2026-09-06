-- CreateEnum
CREATE TYPE "product_type_enum" AS ENUM ('perfume', 'body_spray', 'charm_bag', 'candle');

-- AlterTable
ALTER TABLE "products" ADD COLUMN "product_type" "product_type_enum" NOT NULL DEFAULT 'perfume';

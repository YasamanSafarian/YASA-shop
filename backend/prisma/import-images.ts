import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const UPLOAD_DIR = resolve(process.cwd(), 'uploads/products');
const ALLOWED = /\.(jpg|jpeg|png|webp|gif)$/i;

// Usage: npx ts-node prisma/import-images.ts [rootFolder]
// rootFolder default: ./import-images
// Layout: <root>/<product-slug>/image1.jpg, image2.jpg …
// A file named `primary.<ext>` is set as the primary image; otherwise the first (sorted) image is primary.
const rootArg = process.argv[2] ?? 'import-images';
const ROOT = resolve(process.cwd(), rootArg);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function imageFilesFor(folder: string): Promise<{
  path: string;
  name: string;
}[]> {
  if (!existsSync(folder)) {
    throw new Error(`Image folder not found: ${folder}`);
  }
  return (readdirSync(folder) || [])
    .filter((f) => ALLOWED.test(f))
    .sort()
    .map((f) => ({ path: join(folder, f), name: f }));
}

async function main() {
  if (!existsSync(ROOT) || !statSync(ROOT).isDirectory()) {
    throw new Error(
      `Root folder not found: ${ROOT}\nExpected: <root>/<product-slug>/image1.jpg`,
    );
  }

  mkdirSync(UPLOAD_DIR, { recursive: true });

  const slugs = (readdirSync(ROOT) || []).filter((entry) =>
    statSync(join(ROOT, entry)).isDirectory(),
  );

  if (slugs.length === 0) {
    throw new Error(
      `No product folders inside ${ROOT}. Each subfolder should be named by the product slug.`,
    );
  }

  let imported = 0;
  let skipped = 0;

  for (const rawSlug of slugs) {
    const slug = slugify(rawSlug);

    const product = await prisma.products.findUnique({
      where: { slug },
      include: { product_variants: true },
    });

    if (!product) {
      console.warn(`[skip] no product with slug "${slug}" (folder: ${rawSlug})`);
      skipped++;
      continue;
    }

    const variant =
      product.product_variants.find((v) => v.is_default) ??
      product.product_variants[0];

    if (!variant) {
      console.warn(`[skip] product "${slug}" has no variants`);
      skipped++;
      continue;
    }

    const images = await imageFilesFor(join(ROOT, rawSlug));
    if (images.length === 0) {
      console.warn(`[skip] no image files in folder "${rawSlug}"`);
      skipped++;
      continue;
    }

    // Replace existing images for this variant with the imported set.
    await prisma.product_images.deleteMany({ where: { variant_id: variant.id } });

    const primaryIdx = images.findIndex((i) => i.name.toLowerCase().startsWith('primary'));
    const firstIdx = primaryIdx >= 0 ? primaryIdx : 0;

    for (let i = 0; i < images.length; i++) {
      const ext = extname(images[i].name).toLowerCase();
      const filename = `${randomUUID()}${ext}`;
      const dest = join(UPLOAD_DIR, filename);
      copyFileSync(images[i].path, dest);

      await prisma.product_images.create({
        data: {
          variant_id: variant.id,
          image_url: `/uploads/products/${filename}`,
          alt_text: product.name,
          sort_order: i,
          is_primary: i === firstIdx,
        },
      });
    }

    console.log(
      `[ok] ${slug} -> ${images.length} image(s) (primary: ${images[firstIdx].name})`,
    );
    imported++;
  }

  console.log(
    `\nDone. imported ${imported} product(s), skipped ${skipped}. Files copied to ${UPLOAD_DIR}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

interface SeedNote {
  name: string;
  slug: string;
}

interface SeedFamily {
  name: string;
  slug: string;
}

interface SeedCategory {
  name: string;
  slug: string;
  parentSlug?: string;
  sortOrder: number;
}

interface SeedVariant {
  sku: string;
  format: 'original' | 'decant' | 'sample' | 'gift_set';
  volumeMl: number;
  price: number;
  stockQuantity: number;
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  brandSlug: string;
  gender: 'male' | 'female' | 'unisex';
  categorySlugs: string[];
  familySlugs: string[];
  notes: {
    top: string[];
    middle: string[];
    base: string[];
  };
  variants: SeedVariant[];
}

const BRANDS = [
  { name: 'SMART', slug: 'smart' },
  { name: 'Super smart', slug: 'super-smart' },
];

const CATEGORIES: SeedCategory[] = [
  { name: 'زنانه', slug: 'women', sortOrder: 1 },
  { name: 'مردانه', slug: 'men', sortOrder: 2 },
  { name: 'یونیسکس', slug: 'unisex', sortOrder: 3 },
  { name: 'گلفام', slug: 'women-floral', parentSlug: 'women', sortOrder: 1 },
  { name: 'میوه‌ای', slug: 'women-fruity', parentSlug: 'women', sortOrder: 2 },
  { name: 'گورماند', slug: 'women-gourmand', parentSlug: 'women', sortOrder: 3 },
  { name: 'شرقی', slug: 'women-oriental', parentSlug: 'women', sortOrder: 4 },
  { name: 'شرقی', slug: 'men-oriental', parentSlug: 'men', sortOrder: 1 },
  { name: 'آروماتیک', slug: 'men-aromatic', parentSlug: 'men', sortOrder: 2 },
  { name: 'چوبی', slug: 'men-woody', parentSlug: 'men', sortOrder: 3 },
];

const FRAGRANCE_FAMILIES: SeedFamily[] = [
  { name: 'گلفام', slug: 'floral' },
  { name: 'گلی - میوه‌ای - شیرین', slug: 'floral-fruity-gourmand' },
  { name: 'شرقی، آروماتیک', slug: 'oriental-aromatic' },
  { name: 'شرقی - گلی', slug: 'oriental-floral' },
  { name: 'چوبی - آروماتیک', slug: 'woody-aromatic' },
];

const NOTES: SeedNote[] = [
  { name: 'یاس', slug: 'jasmine' },
  { name: 'گل مریم', slug: 'tuberose' },
  { name: 'پیچ امین‌الدوله رنگون', slug: 'rangoon-creeper' },
  { name: 'انگور سیاه', slug: 'blackcurrant' },
  { name: 'گلابی', slug: 'pear' },
  { name: 'زنبق', slug: 'iris' },
  { name: 'شکوفه پرتقال', slug: 'orange-blossom' },
  { name: 'پرالین', slug: 'praline' },
  { name: 'وانیل', slug: 'vanilla' },
  { name: 'دانه تونکا', slug: 'tonka-bean' },
  { name: 'پچولی', slug: 'patchouli' },
  { name: 'ترنج', slug: 'bergamot' },
  { name: 'زیره', slug: 'cumin' },
  { name: 'گل آفتاب‌پرست', slug: 'heliotrope' },
  { name: 'اسطوخودوس', slug: 'lavender' },
  { name: 'بادام', slug: 'almond' },
  { name: 'چوب صندل', slug: 'sandalwood' },
  { name: 'کهربا', slug: 'amber' },
  { name: 'قهوه', slug: 'coffee' },
  { name: 'یاس سامباک', slug: 'jasmine-sambac' },
  { name: 'کاکائو', slug: 'cocoa' },
  { name: 'خامه نارگیل', slug: 'coconut-cream' },
  { name: 'ارکیده وانیلی', slug: 'vanilla-orchid' },
  { name: 'مشک', slug: 'musk' },
  { name: 'نت‌های چوبی', slug: 'woody-notes' },
  { name: 'گریپ‌فروت', slug: 'grapefruit' },
  { name: 'نت‌های دریایی', slug: 'sea-notes' },
  { name: 'نارنگی', slug: 'mandarin' },
  { name: 'برگ بو', slug: 'bay-leaf' },
  { name: 'چوب گایاک', slug: 'guaiac-wood' },
  { name: 'خزه بلوط', slug: 'oakmoss' },
];

const PRODUCTS: SeedProduct[] = [
  {
    name: 'گوچی بلوم',
    slug: 'gucci-bloom',
    description:
      'رایحه‌ای گرم و گلی؛ گوچی بلوم با گل‌های یاس، گل مریم و پیچ امین‌الدولهٔ رنگون، شاد و زنانه و ماندگار. (Gucci Bloom)',
    brandSlug: 'super-smart',
    gender: 'female',
    categorySlugs: ['women-floral'],
    familySlugs: ['floral'],
    notes: { top: ['jasmine'], middle: ['tuberose'], base: ['rangoon-creeper'] },
    variants: [
      {
        sku: 'GUCCI-BLOOM-25',
        format: 'decant',
        volumeMl: 25,
        price: 498000,
        stockQuantity: 20,
      },
    ],
  },
  {
    name: 'مارک کلکسیون ۱۰۵',
    slug: 'marque-collection-105',
    description:
      'الهام‌گرفته از لانکوم لاویه اِست بِل (La Vie Est Belle)؛ رایحه‌ای گرم و شیرین با خانوادهٔ گلی - میوه‌ای - شیرین.',
    brandSlug: 'smart',
    gender: 'female',
    categorySlugs: ['women-floral', 'women-fruity', 'women-gourmand'],
    familySlugs: ['floral-fruity-gourmand'],
    notes: {
      top: ['blackcurrant', 'pear'],
      middle: ['iris', 'jasmine', 'orange-blossom'],
      base: ['praline', 'vanilla', 'tonka-bean', 'patchouli'],
    },
    variants: [
      {
        sku: 'MARQUE-105-25',
        format: 'original',
        volumeMl: 25,
        price: 498000,
        stockQuantity: 20,
      },
    ],
  },
  {
    name: 'پگاسوس',
    slug: 'pegasus',
    description:
      'پگاسوس از پارفوم دُ مارلی (Parfums de Marly)؛ رایحه‌ای گرم و شیرین، شرقی - آروماتیک با نت‌های بادام، وانیل و کهربا.',
    brandSlug: 'super-smart',
    gender: 'male',
    categorySlugs: ['men-oriental', 'men-aromatic'],
    familySlugs: ['oriental-aromatic'],
    notes: {
      top: ['bergamot', 'cumin', 'heliotrope'],
      middle: ['lavender', 'jasmine'],
      base: ['almond', 'vanilla', 'sandalwood', 'amber'],
    },
    variants: [
      {
        sku: 'PEGASUS-25',
        format: 'decant',
        volumeMl: 25,
        price: 498000,
        stockQuantity: 20,
      },
    ],
  },
  {
    name: 'گود گرل',
    slug: 'good-girl',
    description:
      'گود گرل از کارولینا هررا (Carolina Herrera)؛ رایحه‌ای گرم و شیرین، شرقی - گلی با نت‌های قهوه، گل مریم و وانیل.',
    brandSlug: 'smart',
    gender: 'female',
    categorySlugs: ['women-oriental', 'women-floral'],
    familySlugs: ['oriental-floral'],
    notes: {
      top: ['almond', 'coffee'],
      middle: ['jasmine-sambac', 'tuberose'],
      base: ['tonka-bean', 'cocoa', 'vanilla', 'sandalwood'],
    },
    variants: [
      {
        sku: 'GOOD-GIRL-25',
        format: 'decant',
        volumeMl: 25,
        price: 498000,
        stockQuantity: 20,
      },
    ],
  },
  {
    name: 'کلود آریانا گرانده',
    slug: 'arijana-grande-cloud',
    description:
      'کلود آریانا گرانده (Ariana Grande Cloud)؛ رایحه‌ای شیرین و ملایم با خانوادهٔ گلی - میوه‌ای - گورماند.',
    brandSlug: 'super-smart',
    gender: 'female',
    categorySlugs: ['women-floral', 'women-fruity', 'women-gourmand'],
    familySlugs: ['floral-fruity-gourmand'],
    notes: {
      top: ['bergamot', 'pear', 'lavender'],
      middle: ['coconut-cream', 'praline', 'vanilla-orchid'],
      base: ['musk', 'woody-notes', 'vanilla'],
    },
    variants: [
      {
        sku: 'CLOUD-25',
        format: 'decant',
        volumeMl: 25,
        price: 498000,
        stockQuantity: 20,
      },
    ],
  },
  {
    name: 'مارک کلکسیون شماره ۱۲۵',
    slug: 'marque-collection-125',
    description:
      'الهام‌گرفته از پاکو رابان اینویکتوس (Paco Rabanne Invictus)؛ رایحه‌ای گرم، چوبی - آروماتیک.',
    brandSlug: 'smart',
    gender: 'male',
    categorySlugs: ['men-woody', 'men-aromatic'],
    familySlugs: ['woody-aromatic'],
    notes: {
      top: ['grapefruit', 'sea-notes', 'mandarin'],
      middle: ['bay-leaf', 'jasmine'],
      base: ['guaiac-wood', 'patchouli', 'oakmoss'],
    },
    variants: [
      {
        sku: 'MARQUE-125-25',
        format: 'original',
        volumeMl: 25,
        price: 498000,
        stockQuantity: 20,
      },
    ],
  },
];

async function main() {
  for (const brand of BRANDS) {
    await prisma.brands.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, is_active: true },
      create: { name: brand.name, slug: brand.slug, is_active: true },
    });
    console.log(`brand ensured: ${brand.slug}`);
  }

  const parentId = new Map<string, string>();
  for (const category of CATEGORIES) {
    const data = {
      name: category.name,
      slug: category.slug,
      sort_order: category.sortOrder,
      is_active: true,
      parent_id: category.parentSlug ? parentId.get(category.parentSlug) : null,
    };
    const saved = await prisma.categories.upsert({
      where: { slug: category.slug },
      update: data,
      create: data,
    });
    parentId.set(category.slug, saved.id);
    console.log(`category ensured: ${category.slug}`);
  }

  for (const family of FRAGRANCE_FAMILIES) {
    await prisma.fragrance_families.upsert({
      where: { slug: family.slug },
      update: { name: family.name },
      create: { name: family.name, slug: family.slug },
    });
    console.log(`fragrance family ensured: ${family.slug}`);
  }

  for (const note of NOTES) {
    await prisma.notes.upsert({
      where: { slug: note.slug },
      update: { name: note.name },
      create: { name: note.name, slug: note.slug },
    });
  }
  console.log(`notes ensured: ${NOTES.length}`);

  const brandId = new Map(
    (await prisma.brands.findMany()).map((brand) => [brand.slug, brand.id]),
  );
  const categoryId = new Map(
    (await prisma.categories.findMany()).map((category) => [
      category.slug,
      category.id,
    ]),
  );
  const familyId = new Map(
    (await prisma.fragrance_families.findMany()).map((family) => [
      family.slug,
      family.id,
    ]),
  );
  const noteId = new Map(
    (await prisma.notes.findMany()).map((note) => [note.slug, note.id]),
  );

  for (const product of PRODUCTS) {
    const brand = brandId.get(product.brandSlug);
    if (!brand) {
      throw new Error(`brand not found: ${product.brandSlug}`);
    }

    const productData = {
      brand_id: brand,
      name: product.name,
      slug: product.slug,
      description: product.description,
      gender: product.gender,
      is_active: true,
    };

    const saved = await prisma.products.upsert({
      where: { slug: product.slug },
      update: productData,
      create: productData,
    });

    await prisma.product_variants.deleteMany({
      where: { product_id: saved.id },
    });
    await prisma.product_categories.deleteMany({
      where: { product_id: saved.id },
    });
    await prisma.product_fragrance_families.deleteMany({
      where: { product_id: saved.id },
    });
    await prisma.product_notes.deleteMany({ where: { product_id: saved.id } });

    await prisma.product_variants.create({
      data: {
        product_id: saved.id,
        sku: product.variants[0].sku,
        format: product.variants[0].format,
        volume_ml: product.variants[0].volumeMl,
        price: product.variants[0].price,
        stock_quantity: product.variants[0].stockQuantity,
        is_default: true,
        is_active: true,
      },
    });

    await prisma.product_categories.createMany({
      data: product.categorySlugs.map((slug) => ({
        product_id: saved.id,
        category_id: categoryId.get(slug)!,
      })),
      skipDuplicates: true,
    });

    await prisma.product_fragrance_families.createMany({
      data: product.familySlugs.map((slug) => ({
        product_id: saved.id,
        fragrance_family_id: familyId.get(slug)!,
      })),
      skipDuplicates: true,
    });

    const noteLinks: {
      product_id: string;
      note_id: string;
      note_type: 'top' | 'middle' | 'base';
    }[] = [];
    for (const type of ['top', 'middle', 'base'] as const) {
      for (const slug of product.notes[type]) {
        noteLinks.push({
          product_id: saved.id,
          note_id: noteId.get(slug)!,
          note_type: type,
        });
      }
    }
    await prisma.product_notes.createMany({
      data: noteLinks,
      skipDuplicates: true,
    });

    console.log(`product ensured: ${product.slug}`);
  }

  console.log('catalog seed complete');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

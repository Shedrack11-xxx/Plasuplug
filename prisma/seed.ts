import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = ["Electronics", "Fashion", "Books & Notes", "Food", "Services", "Room Essentials"];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
    });
  }

  // Admin user
  const adminPassword = await bcrypt.hash("Admin12345!", 12);
  await prisma.user.upsert({
    where: { email: "admin@plasuplug.test" },
    update: {},
    create: {
      name: "PLASU Plug Admin",
      email: "admin@plasuplug.test",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("Seed complete. Admin login: admin@plasuplug.test / Admin12345!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

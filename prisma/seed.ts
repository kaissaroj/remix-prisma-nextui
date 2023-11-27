import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME as string;
  const password = process.env.ADMIN_PASSWORD as string;
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await prisma.user.upsert({
    where: {
      username: username,
    },
    update: {},
    create: {
      username: username,
      password: hashedPassword,
    },
  });
  console.log("USER UPSERTED ... >>");
  console.log(user);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

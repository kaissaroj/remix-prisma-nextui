import { prisma } from "~/lib/prisma";
import bcrypt from "bcrypt";
import type { User } from "@prisma/client";

async function UserLogin(
  username: string,
  password: string
): Promise<User | null> {
  let user = null;
  const model = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (model) {
    const passwordMatch = await bcrypt.compare(password, model.password);
    user = passwordMatch ? model : null;
  }
  return user;
}

export { UserLogin };

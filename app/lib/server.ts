import { redirect, createCookie } from "@remix-run/node";
import { createRedisSessionStorage } from "./session-redis";

const secretKey = process.env.SESSION_SECRET_KEY || "";
const USER_SESSION_KEY = "userId";

async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}
const cookie = createCookie("__session", {
  secure: process.env.NODE_ENV === "production",
  secrets: [secretKey],
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true,
  path: "/",
});

// const sessionStorage = createFileSessionStorage({
//   dir: "/data/sessions",
//   cookie: cookie,
// });
const sessionStorage = createRedisSessionStorage({
  cookie,
  options: {
    host: process.env.REDIS_HOST,
    password:
      process.env.NODE_ENV === "production"
        ? process.env.REDIS_PASSWORD
        : undefined,
    keyPrefix: process.env.REDIS_PREFIX ?? "__session:",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },
});

async function createUserSession({
  request,
  userId,
}: {
  request: Request;
  userId: number;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 7, // 7 days,
      }),
    },
  });
}
async function logout(request: Request) {
  const session = await getSession(request);
  session.unset(USER_SESSION_KEY);
  const destoryedSession = await sessionStorage.destroySession(session);
  await sessionStorage.destroySession(session);
  return redirect("/login", {
    headers: {
      "Set-Cookie": destoryedSession,
    },
  });
}
async function isSessionActive(request: Request): Promise<boolean> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return !!userId;
}

export { sessionStorage, createUserSession, logout, isSessionActive };

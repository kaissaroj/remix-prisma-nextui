import type { Cookie } from "@remix-run/node";
import { createSessionStorage } from "@remix-run/node";
import cuid from "cuid";
import { differenceInSeconds } from "date-fns";
import type { RedisOptions } from "ioredis";
import Redis from "ioredis";

interface RedisSessionStorageOptions {
  cookie: Cookie;
  options: RedisOptions;
}
export function createRedisSessionStorage({
  cookie,
  options,
}: RedisSessionStorageOptions) {
  const redis = new Redis(options);

  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const id = cuid();
      expires
        ? await redis.set(
            id,
            JSON.stringify(data),
            "EX",
            expirationSeconds(expires)
          )
        : await redis.set(id, JSON.stringify(data));
      return id;
    },
    async readData(id) {
      const data = await redis.get(id);
      return data ? JSON.parse(data) : null;
    },
    async updateData(id, data, expires) {
      expires
        ? await redis.set(
            id,
            JSON.stringify(data),
            "EX",
            expirationSeconds(expires)
          )
        : await redis.set(id, JSON.stringify(data));
    },
    async deleteData(id) {
      await redis.del(id);
    },
  });
}
function expirationSeconds(expires: Date) {
  return Math.max(0, differenceInSeconds(expires, new Date()));
}

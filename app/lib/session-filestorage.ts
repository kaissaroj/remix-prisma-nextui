import * as crypto from "node:crypto";
import { promises as fsp } from "node:fs";
import * as path from "node:path";
import type {
  SessionStorage,
  SessionIdStorageStrategy,
  SessionData,
} from "@remix-run/server-runtime";
import {
  createCookieFactory,
  createSessionStorageFactory,
} from "@remix-run/server-runtime";
import cookieSignature from "cookie-signature";

export const sign = async (value: string, secret: string) => {
  return cookieSignature.sign(value, secret);
};

export const unsign = async (signed: string, secret: string) => {
  return cookieSignature.unsign(signed, secret);
};

export const createCookie = createCookieFactory({ sign, unsign });

export const createSessionStorage = createSessionStorageFactory(createCookie);

interface FileSessionStorageOptions {
  /**
   * The Cookie used to store the session id on the client, or options used
   * to automatically create one.
   */
  cookie?: SessionIdStorageStrategy["cookie"];

  /**
   * The directory to use to store session files.
   */
  dir: string;
}

/**
 * Creates a SessionStorage that stores session data on a filesystem.
 *
 * The advantage of using this instead of cookie session storage is that
 * files may contain much more data than cookies.
 *
 * @see https://remix.run/utils/sessions#createfilesessionstorage-node
 */
export function createFileSessionStorage<Data = SessionData, FlashData = Data>({
  cookie,
  dir,
}: FileSessionStorageOptions): SessionStorage<Data, FlashData> {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      let content = JSON.stringify({ data, expires });
      console.log({ dir });
      while (true) {
        let randomBytes = crypto.webcrypto.getRandomValues(new Uint8Array(8));
        let id = Buffer.from(randomBytes).toString("hex");
        try {
          let file = getFile(dir, id);
          await fsp.mkdir(path.dirname(file), { recursive: true });
          await fsp.writeFile(file, content, { encoding: "utf-8", flag: "wx" });
          return id;
        } catch (error: any) {
          if (error.code !== "EEXIST") throw error;
        }
      }
    },
    async readData(id) {
      try {
        let file = getFile(dir, id);
        let content = JSON.parse(await fsp.readFile(file, "utf-8"));
        let data = content.data;
        let expires =
          typeof content.expires === "string"
            ? new Date(content.expires)
            : null;

        if (!expires || expires > new Date()) {
          return data;
        }

        // Remove expired session data.
        if (expires) await fsp.unlink(file);

        return null;
      } catch (error: any) {
        if (error.code !== "ENOENT") throw error;
        return null;
      }
    },
    async updateData(id, data, expires) {
      let content = JSON.stringify({ data, expires });
      let file = getFile(dir, id);
      await fsp.mkdir(path.dirname(file), { recursive: true });
      await fsp.writeFile(file, content, "utf-8");
    },
    async deleteData(id) {
      // Return early if the id is empty, otherwise we'll end up trying to
      // unlink the dir, which will cause the EPERM error.
      if (!id) {
        return;
      }
      try {
        await fsp.unlink(getFile(dir, id));
      } catch (error: any) {
        if (error.code !== "ENOENT") throw error;
      }
    },
  });
}

export function getFile(dir: string, id: string): string {
  // Divide the session id up into a directory (first 2 bytes) and filename
  // (remaining 6 bytes) to reduce the chance of having very large directories,
  // which should speed up file access. This is a maximum of 2^16 directories,
  // each with 2^48 files.
  return path.join(dir, id.slice(0, 4), id.slice(4));
}

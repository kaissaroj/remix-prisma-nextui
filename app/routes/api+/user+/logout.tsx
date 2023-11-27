import {
  redirect,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { isSessionActive, logout } from "~/lib/server";

export const action: ActionFunction = async ({ request }) => {
  const isActive = await isSessionActive(request);
  if (!isActive) return redirect("/login");
  return logout(request);
};

export const loader: LoaderFunction = async ({}) => {
  return redirect("/");
};

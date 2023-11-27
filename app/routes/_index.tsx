import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { isSessionActive } from "~/lib/server";

export const loader: LoaderFunction = async ({ request }) => {
  const isActiveSession: any = await isSessionActive(request);
  console.log({ isActiveSession });
  if (isActiveSession) {
    return redirect("/dashboard");
  }
  return redirect("/login");
};

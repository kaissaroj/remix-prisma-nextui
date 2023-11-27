import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { NextUIProvider } from "@nextui-org/react";
import stylesheet from "~/tailwind.css";
import rdtStylesheet from "remix-development-tools/index.css";

export const links: LinksFunction = () => {
  let linkStyles = [
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
    { rel: "stylesheet", href: stylesheet },
  ];

  if (process.env.NODE_ENV === "development") {
    linkStyles.push({ rel: "stylesheet", href: rdtStylesheet });
  }

  return linkStyles;
};

function App() {
  return (
    <html lang="en" className="h-full bg-white">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <NextUIProvider>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </NextUIProvider>
      </body>
    </html>
  );
}

let AppExport = App;
if (process.env.NODE_ENV === "development") {
  const { withDevTools } = await import("remix-development-tools");
  AppExport = withDevTools(AppExport);
}

export default AppExport;

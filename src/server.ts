import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

import { auth } from "./lib/auth.ts";

const tanstackHandler = createStartHandler(defaultStreamHandler);

const server = {
  fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth")) {
      return auth.handler(request);
    }

    return tanstackHandler(request);
  },
};

export default server;

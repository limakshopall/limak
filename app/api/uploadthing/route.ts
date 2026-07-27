// ============================================================
//  UPLOADTHING — le "guichet" /api/uploadthing
// ============================================================

import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});

const { Router } = require("express");
const { prisma } = require("../..");
const { authMiddleware, permissionMiddleware, csrfMiddleware } = require("../middlewares/auth.middleware");
const { convertQuerys } = require("../middlewares/validators.middleware");

const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");

const router = Router();


const routesMiddlewares = (rateLimiter) => {
  router.use(
    session({
      secret: "papurritesteo",
      store: new PrismaSessionStore(
        prisma, {
        checkPeriod: 2 * 60 * 1000, //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
      },
      resave: false,
      saveUninitialized: false,
    })
  );
  router.use(cookieParser());
  router.use(
    csurf({
      cookie: {
        httpOnly: true,
      },
    })
  );

  router.use(csrfMiddleware);

  router.use("/api", authMiddleware, convertQuerys, permissionMiddleware);

  router.use("/assets", require("./assets/assets.router"));

  router.use("/auth", require("./auth/auth.router")(rateLimiter));
  router.use("/api", require("./comercials/comercials.router"));
  router.use("/api", require("./periods/periods.router"));
  router.use("/api", require("./coordinators/coordinators.router"));
  router.use("/api", require("./supervisors/supervisors.router"));
  router.use("/api", require("./branches/branches.router"));
  router.use("/api", require("./zones/zones.router"));
  router.use("/api", require("./clients/clients.router"));
  router.use("/api", require("./chains/chains.router"));
  router.use("/api", require("./categories/categories.router"));
  router.use("/api", require("./reports/reports.router"));
  router.use("/api", require("./accounts/accounts.router"));

  return router;
}

module.exports = routesMiddlewares;

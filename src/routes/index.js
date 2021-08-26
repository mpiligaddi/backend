const { Router } = require("express");
const { authMiddleware, permissionMiddleware, csrfMiddleware } = require("../middlewares/auth.middleware");
const { convertQuerys } = require("../middlewares/validators.middleware");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const { sessionStore } = require("../db/prisma.client");
const jwt = require("express-jwt");

const router = Router();

const routesMiddlewares = (rateLimiter) => {
  router.use(cookieParser());

  router.use(
    csurf({
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 4,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      },
    })
  );

  router.use(csrfMiddleware);

  router.use(
    "/api",
    jwt({
      credentialsRequired: true,
      secret: "secretword",
      algorithms: ["HS256"],
      getToken(req) {
        if (req.cookies && req.cookies.token) {
          return req.cookies.token;
        }

        if (req.headers.authorization) {
          return req.headers.authorization.split(" ")[1];
        }

        return null;
      },
    }),
    (err, req, res, next) => {
      if(err){
        return res.status(401).send({code: 401, message: err.message})
      }
      return next();
    },
    convertQuerys
  );

  router.use("/assets", require("./assets/assets.router"));

  router.use("/auth", require("./auth/auth.router")(rateLimiter));
  router.use("/api", require("./comercials/comercials.router"));
  router.use("/api", require("./products/products.router"));
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
  router.use("/api", require("./users/users.router"));
  router.use("/api", require("./coverages/coverages.router"));
  router.use("/api", require("./formats/formats.router"));
  router.use("/api", require("./rivals/rivals.router"));
  router.use("/api", require("./additionals/additionals.router"));

  return router;
};

module.exports = routesMiddlewares;

var express = require("express");
const AuthController = require("./auth.controller");
const { check } = require("express-validator");
const { prisma } = require("../../db/prisma.client");
const { validateBody } = require("../../middlewares/validators.middleware");
const { RateLimiterPostgres } = require("rate-limiter-flexible");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { user_role } = require("@prisma/client");

/**
 *
 * @param {RateLimiterPostgres} rateLimiter
 */
module.exports = (rateLimiter) => {
  var router = express.Router();

  const controller = new AuthController();

  router
    .get(
      "/",
      expressJwt({
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
      async (req, res) => {
        const user = await prisma.user.findUnique({
          where: {
            id: req.user.user.id,
          },
          include: {
            client: {
              select: {
                id: true,
              },
            },
          },
        });

        res.json({ user });
      }
    )
    .delete("/", (req, res) => {
      res.clearCookie("token");

      res.json({ message: "Logout con Exito" });
    });

  router.get("/csrf", (req, res) => {
    res.send({ token: req.csrfToken() });
  });

  router.post(
    "/login",
    check("password", "Faltó ingresar la contraseña").notEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    check("remember", "Remember tiene que ser un boolean").isBoolean().optional({ nullable: false, checkFalsy: false }),
    validateBody,
    (req, res) => {
      rateLimiter.get(req.ip).then((value) => {
        let retrySecs = 0;

        if (value != null && value.consumedPoints > 5) {
          retrySecs = Math.round(value.msBeforeNext / 1000) || 1;
        }

        if (retrySecs > 0) {
          res.set("Retry-After", String(retrySecs));
          return res.status(429).send({ code: 429, message: "Demasiadas peticiones." });
        }

        controller
          .tryLogin(req.body)
          .then((r) => {
            const token = jwt.sign(
              {
                user: {
                  id: r.user.id,
                  role: r.user.role,
                  clientId: r.user.role === user_role.client ? r.user?.client?.id : undefined,
                },
              },
              "secretword",
              {
                expiresIn: "3d",
              }
            );

            res.cookie("token", token, {
              httpOnly: true,
            });

            return res.status(r.code).send(r);
          })
          .catch((c) => {
            rateLimiter
              .consume(req.ip)
              .then((value) => {
                res.status(c.code).send(c);
              })
              .catch((value) => {
                if (value instanceof Error) {
                  return res.status(503).send({ code: 503, message: "Hubo un error en el servidor" });
                } else {
                  res.set("Retry-After", String(retrySecs));
                  return res.status(429).send({ code: 429, message: "Demasiadas peticiones." });
                }
              });
          });
      });
    }
  );

  return router;
};

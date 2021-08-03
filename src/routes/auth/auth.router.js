var express = require("express");
const AuthController = require("./auth.controller");
const { check } = require('express-validator');
const { validateBody } = require("../../middlewares/validators.middleware");
const { RateLimiterPostgres } = require("rate-limiter-flexible");
const { authMiddleware } = require("../../middlewares/auth.middleware");

/**
 *
 * @param {RateLimiterPostgres} rateLimiter
 */
module.exports = (rateLimiter) => {

  var router = express.Router();

  const controller = new AuthController();

  router.put("/authenticate", authMiddleware, (req, res) => {
    console.log(req.headers.cookie);
    const user = req.session.user;

    req.session.regenerate((err) => {
      if (err) return res.status(500).send({ code: 500, message: "Hubo un error al autenticar la sesión" });
      req.session.isAuth = true;
      req.session.user = user;
      return res.status(200).send({ code: 200, message: "Se reautenticó la sesión con éxito!", user: req.session.user });
    })
  })

  router.put("/logout", authMiddleware, (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).send({ code: 500, message: "Hubo un error al desconectarlo de la cuenta" });
      return res.status(200).send({ code: 200, message: "Se elimino la sesión actual." });
    })
  });

  router.get('/csfr', (req, res) => {
    res.send({ token: req.csrfToken() });
  })

  module.exports = router;

  router.post("/login",
    check("password", "Faltó ingresar la contraseña").notEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    check("remember", "Remember tiene que ser un boolean").isBoolean().optional({ nullable: false, checkFalsy: false }),
    validateBody
    , (req, res) => {

      if (req.session.isAuth && req.session.user != null && req.session.user.email == req.body.email)
        return res.status(202).send({ code: 202, message: "Sesión obtenida con éxito", user: req.session.user });

      rateLimiter.get(req.ip).then((value) => {
        let retrySecs = 0;

        if (value != null && value.consumedPoints > 5) {
          retrySecs = Math.round(value.msBeforeNext / 1000) || 1;
        }

        if (retrySecs > 0) {
          res.set('Retry-After', String(retrySecs));
          return res.status(429).send({ code: 429, message: "Demasiadas peticiones." });
        }

        controller
          .tryLogin(req.body)
          .then((r) => {
            req.session.isAuth = true;
            req.session.user = r.user;
            if (req.body.remember) {
              let timeExpire = 1000 * 60 * 60 * 24 * 4;
              req.session.cookie.expires = new Date(Date.now() + timeExpire);
              req.session.cookie.maxAge = timeExpire;
            }
            return res.status(r.code).send(r);
          })
          .catch((c) => {
            rateLimiter.consume(req.ip)
              .then(value => {
                res.status(c.code).send(c)
              })
              .catch(value => {
                if (value instanceof Error) {
                  return res.status(503).send({ code: 503, message: "Hubo un error en el servidor" })
                } else {
                  res.set('Retry-After', String(retrySecs));
                  return res.status(429).send({ code: 429, message: "Demasiadas peticiones." });
                }
              })
          });
      });


    });

  return router;
};
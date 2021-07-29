var express = require("express");
const AuthController = require("./auth.controller");
const { check } = require('express-validator');
const { validateBody } = require("../../middlewares/validators.middleware");
const { RateLimiterPostgres } = require("rate-limiter-flexible");

/**
 *
 * @param {RateLimiterPostgres} rateLimiter
 */
module.exports = (rateLimiter) => {

  var router = express.Router();

  const controller = new AuthController();

  router.post("/register", [
    check("role", "Faltó ingresar el rol").notEmpty(),
    check("name", "Faltó ingresar el nombre").notEmpty(),
    check("password", "Faltó ingresar la contraseña").notEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    check("role", "El rol es incorrecto").isIn('backoffice', 'merchandiser'),
    validateBody
  ], (req, res) => {

    controller
      .registerAccount(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        res.status(c.code).send(c)
      });
  });

  router.put("/authenticate", (req, res) => {
    if (!req.session.isAuth) return res.status(400).send({ code: 400, message: "No se encontro ninguna sesión" })
    req.session.reload((err) => {
      if (err) return res.status(500).send({ code: 500, message: "Hubo un error al autenticar la sesión" });
      return res.status(200).send({ code: 200, message: "Se reautenticó la sesión con éxito!", user: req.session.user });
    })
  })

  router.put("/logout", (req, res) => {
    if (!req.session.isAuth) return res.status(400).send({ code: 400, message: "No se encontro ninguna sesión" })
    req.session.destroy((err) => {
      if (err) return res.status(500).send({ code: 500, message: "Hubo un error al desconectarlo de la cuenta" });
      return res.status(200).send({ code: 200, message: "Se elimino la sesión actual." });
    })
  });

  router.post("/login", [
    check("password", "Faltó ingresar la contraseña").notEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    validateBody
  ], (req, res) => {

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
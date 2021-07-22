var express = require("express");
const AuthController = require("./auth.controller");
const { PrismaClient } = require('@prisma/client')

var router = express.Router();

/**
 *
 * @param {PrismaClient} prisma
 * @returns
 */

module.exports = function (prisma) {
  const controller = new AuthController(prisma);

  router.post("/register", (req, res) => {
    let _defaultParams = ["uuids", "displayName", "email", "role", "password"];

    var params = _defaultParams.filter((value) => !Object.keys(req.body).includes(value));

    if (params.length != 0) {
      return res.send({ code: 206, message: `Faltan parametros: ${params.join(", ")}` });
    }

    controller
      .registerAccount(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/logout", (req, res) => {
    controller
      .tryLogout(req.session)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send({ code: 204, message: "Es necesario ingresar un correo y una contraseña." });
    }

    controller
      .tryLogin({ email, password, id: req.session.id })
      .then((r) => {
        req.session.account = r.user;
        req.session.isAuth = true;
        res.send(r);
      })
      .catch((c) => res.send(c));
  });

  return router;
};

var express = require("express");
const MongoDB = require("../db/mongo.driver");
const AuthController = require("./auth.controller");
var router = express.Router();

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {
  const controller = new AuthController(db);

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

  router.post("/authenticate", (req, res) => {
    const { timestamp, token } = req.body;

    if (!token) {
      return res.send({ code: 401, message: "Es necesario de una autorización" });
    }

    controller
      .authenticateToken({ token, timestamp })
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send({ code: 204, message: "Es necesario ingresar un correo y una contraseña." });
    }

    controller
      .tryLogin({ email, password })
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

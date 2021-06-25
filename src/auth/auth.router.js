var express = require("express");
const MongoDB = require("../db/mongo.driver");
var router = express.Router();

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {
  router.post("/register", (req, res) => {
    let _defaultParams = ["uuids", "username", "name", "lastname", "email", "role", "password"];

    var params = _defaultParams.filter((value) => !Object.keys(req.body).includes(value));

    if (params.length != 0) {
      return res.send({ code: 206, message: `Faltan parametros: ${params.join(", ")}` });
    }

    db.registerAccount(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/authenticate", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.send({ code: 401, message: "Es necesario de una autorización" });
    }

    const { timestamp } = req.body;

    db.authenticateToken({ token, timestamp })
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send({ code: 204, message: "Es necesario ingresar un correo y una contraseña." });
    }

    db.tryLogin({ email, password })
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

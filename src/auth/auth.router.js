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

    if (!req.body) res.send({ code: 400, message: "La petición no puede estar vacía" });
    var params = _defaultParams.filter((value) => !Object.keys(req.body).includes(value));

    if (params.length != 0) {
      res.send({ code: 400, message: `Faltan parametros: ${params.join(", ")}` });
      return;
    }

    db.registerUser(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/authenticate", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.send({ code: 401, message: "Es necesario de una autorización" });
      return;
    }

    db.authenticateToken({ token })
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.send({ code: 400, message: "Es necesario ingresar un correo y una contraseña." });
      return;
    }

    db.tryLogin({ email, password })
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

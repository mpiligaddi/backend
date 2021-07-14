var express = require("express");
const MongoDB = require("../db/mongo.driver");
const ReportsController = require("./reports.controller");
const AuthController = require("../auth/auth.controller");
var router = express.Router();

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {

  const authController = new AuthController(db);
  const controller = new ReportsController(db);

  router.use(function (req, res, next) {
    if (req.headers.authorization.split(" ")[1] == null) {
      res.send({ "code": 401, message: "No se detectó ningún código de autorización" })
      return
    }
    const token = req.headers.authorization.split(" ")[1];

    authController.authenticateToken({ token, timestamp: Date.now() }).then((user) => {
      req.user = user.user;
      next()
    }).catch((err) => res.send(err))

  })

  router.post("/report/create", (req, res) => {

    const { createdBy, type } = req.body;
    const user = req.user;

    if (!type) return res.send({ code: 401, message: "Es necesario definir el tipo de reporte." });

    if (!user) return res.send({ code: 404, message: "La sesión no existe o no está disponible" });
    if (createdBy != user.id.toString()) return res.send({ code: 403, message: "El identificador no corresponde con el token de validación" });

    console.log({ createdBy, user: user.id.toString(), value: createdBy === user.id.toString() });

    controller
      .createReport(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/report/get", (req, res) => {
    const user = req.user;

    const { type, id } = req.body;

    if (!id) return res.send({ code: 401, message: "Es necesario un identificador." });
    if (!type) return res.send({ code: 401, message: "Es necesario definir el tipo de reporte." });

    if (!user) return res.send({ code: 404, message: "La sesión no existe o no está disponible" });
    return controller
      .getReport(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/report/get/all", (req, res) => {
    const token = req.token

    if (!token) {
      return res.send({ code: 401, message: "Es necesario de una autorización" });
    }

    const { type } = req.body;

    if (!type) return res.send({ code: 401, message: "Es necesario definir el tipo de reporte." });

    controller
      .getReports(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

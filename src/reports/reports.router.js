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
  function hasBearer(auth) {
    return auth?.split(" ")[1];
  }

  const authController = new AuthController(db);
  const controller = new ReportsController(db);

  router.post("/report/add", (req, res) => {
    const token = hasBearer(req.headers.authorization);

    if (!token) {
      return res.send({ code: 401, message: "Es necesario de una autorización" });
    }

    const { createdBy, type } = req.body;

    if (!type) return res.send({ code: 401, message: "Es necesario definir el tipo de reporte." });

    authController.userByToken({ token })
      .then((user) => {
        if (!user) return res.send({ code: 404, message: "La sesión no existe o no está disponible" });
        if (createdBy != user.id) return res.send({ code: 403, message: "El identificador no corresponde con el token de validación" });

        controller.createReport(req.body)
          .then((r) => res.send(r))
          .catch((c) => res.send(c));
      })
      .catch((r) => res.send(r));
  });

  router.post("/report/get", (req, res) => {
    const token = hasBearer(req.headers.authorization);

    if (!token) {
      return res.send({ code: 401, message: "Es necesario de una autorización" });
    }

    const { filter, type } = req.body;

    if (!filter) return res.send({ code: 400, message: "Es necesario un filtro" });
    if (!type) return res.send({ code: 401, message: "Es necesario definir el tipo de reporte." });

    authController.userByToken({ token })
      .then((user) => {
        if (!user) return res.send({ code: 404, message: "La sesión no existe o no está disponible" });
        controller.getReport(req.body)
          .then((r) => res.send(r))
          .catch((c) => res.send(c));
      })
      .catch((r) => res.send(r));
  });

  router.post("/report/get/all", (req, res) => {
    const token = hasBearer(req.headers.authorization);

    if (!token) {
      return res.send({ code: 401, message: "Es necesario de una autorización" });
    }
    const _defaultParams = ["filter", "type"];

    var params = _defaultParams.filter((value) => !Object.keys(req.body).includes(value));

    if (params.length != 0) return res.send({ code: 206, message: `Faltan parametros: ${params.join(", ")}` });

    controller.getReports(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

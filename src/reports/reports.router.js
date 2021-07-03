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

    authController
      .userByToken({ token })
      .then((user) => {
        if (!user) return res.send({ code: 404, message: "La sesión no existe o no está disponible" });
        if (createdBy != user.user._id.toString()) return res.send({ code: 403, message: "El identificador no corresponde con el token de validación" });

        console.log({ createdBy, user: user.user._id.toString(), value: createdBy === user.user._id.toString() });

        controller
          .createReport(req.body)
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

    const { type, id } = req.body;

    if (!id) return res.send({ code: 401, message: "Es necesario un identificador." });
    if (!type) return res.send({ code: 401, message: "Es necesario definir el tipo de reporte." });

    authController
      .userByToken({ token })
      .then((user) => {
        if (!user) return res.send({ code: 404, message: "La sesión no existe o no está disponible" });
        return controller
          .getReport(req.body)
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

    const { type } = req.body;

    if (!type) return res.send({ code: 401, message: "Es necesario definir el tipo de reporte." });

    controller
      .getReports(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

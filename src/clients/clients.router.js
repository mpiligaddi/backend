var express = require("express");
const MongoDB = require("../db/mongo.driver");
const ClientsController = require("./clients.controller");
var router = express.Router();

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {

  const controller = new ClientsController(db);

  router.post("/clients/statistics", (req, res) => {
    res.send({
      OFC: {

      },
      OQC: {

      },
      OPC: {

      }
    })
  })

  router.post("/clients/create", (req, res) => {
    const user = req.session.account;

    if (!["admin", "superadmin", "god"].includes(user.role)) return res.send({ code: 503, message: "No tenes los permisos para hacer esta acción" });

    const _defaultParams = ["companyName", "name", "adminId", "comercialId", "address", "CUIT", "contactName", "periodReportId", "control"];

    var params = _defaultParams.filter((value) => !Object.keys(req.body).includes(value));

    if (params.length != 0) {
      return res.send({ code: 206, message: `Faltan parametros: ${params.join(", ")}` });
    }

    return controller
      .createClient(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  })

  router.post("/clients/all", (req, res) => {
    return controller
      .getClients(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/clients/get", (req, res) => {
    const { filter } = req.body;

    if (!filter) return res.send({ code: 401, message: "Es necesario definir una busqueda" });

    return controller
      .getClientById(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

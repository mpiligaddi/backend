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

  router.post("/get/clients", (req, res) => {
    controller.getClients(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/get/client", (req, res) => {
    controller.getClientById(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

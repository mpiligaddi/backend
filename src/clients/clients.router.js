var express = require("express");
const MongoDB = require("../db/mongo.driver");
var router = express.Router();

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {
  router.post("/get/clients", (req, res) => {
    db.getClients(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  router.post("/get/client", (req, res) => {
    db.getClientById(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

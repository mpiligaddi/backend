var express = require("express");
const MongoDB = require("../db/mongo.driver");
const BranchesController = require("./branches.controller");
var router = express.Router();

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {
  const controller = new BranchesController(db);

  router.post("/get/branches", (req, res) => {

    const { start, end, filter } = req.body;

    controller
      .getBranches(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

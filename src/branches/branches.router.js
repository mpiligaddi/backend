var express = require("express");
const MongoDB = require("../db/mongo.driver");
var router = express.Router();

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {
  router.post("/get/branches", (req, res) => {
    db.getBranches(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

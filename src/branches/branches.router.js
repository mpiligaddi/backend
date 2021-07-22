var express = require("express");
const BranchesController = require("./branches.controller");
var router = express.Router();

module.exports = function () {
  const controller = new BranchesController();

  router.post("/get/branches", (req, res) => {

    const { start, end, filter } = req.body;

    controller
      .getBranches(req.body)
      .then((r) => res.send(r))
      .catch((c) => res.send(c));
  });

  return router;
};

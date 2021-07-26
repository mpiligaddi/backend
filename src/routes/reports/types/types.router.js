const { body } = require('express-validator');
var { Router } = require("express");
const { validateBody } = require("../../../middlewares/validators.utils");
const ReportsController = require('../reports.controller');


const router = Router();

/**
 *
 * @param {ReportsController} controller
 * @returns Router
 */
module.exports = (controller) => {

  router.post("/type", [
    body("name", "Es necesario un nombre").not().isEmpty(),
    body("alias", "Es necesario un alias").not().isEmpty(),
    validateBody
  ], (req, res) => {
    controller.createReportType(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

  router.route("/types/:id")
    .get((req, res) => {
      controller.getReportType({ search: req.params.id, query: req.query })
        .then((r) => res.status(r.code).send(r))
        .catch((c) => res.status(c.code).send(c))
    })
    .delete((req, res) => {
      controller.deleteReportType(req.params.id)
        .then((r) => res.status(r.code).send(r))
        .catch((c) => res.status(c.code).send(c))
    })
    .put([
      body("name", "Es necesario un nombre").not().isEmpty(),
      body("alias", "Es necesario un alias").not().isEmpty(),
      validateBody
    ], (req, res) => {
      controller.updateReportType({ search: req.params.id, data: req.body, query: req.query })
        .then((r) => res.status(r.code).send(r))
        .catch((c) => {
          console.log(c);
          return res.status(c.code).send(c)
        })
    })
    .patch((req, res) => {
      controller.updateReportType({ search: req.params.id, data: req.body, query: req.query })
        .then((r) => res.status(r.code).send(r))
        .catch((c) => {
          console.log(c);
          return res.status(c.code).send(c)
        })
    })

  router.get("/types", (req, res) => {
    controller.getZones({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

  return router;
};
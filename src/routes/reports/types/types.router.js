const { body } = require('express-validator');
var { Router } = require("express");
const { validateBody } = require("../../../middlewares/validators.middleware");
const ReportsController = require('../reports.controller');


const router = Router();

/**
 *
 * @param {ReportsController} controller
 * @returns Router
 */
module.exports = (controller) => {

  router.route("/types")
    .post([
      body("name", "Es necesario un nombre").not().isEmpty(),
      body("alias", "Es necesario un alias").not().isEmpty(),
      validateBody
    ], (req, res) => {
      controller.createReportType(req.body)
        .then((r) => res.status(r.code).send(r))
        .catch((c) => res.status(c.code).send(c))
    })
    .get((req, res) => {
      controller.getReportTypes({ query: req.query })
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
          ;
          return res.status(c.code).send(c)
        })
    })
    .patch((req, res) => {
      controller.updateReportType({ search: req.params.id, data: req.body, query: req.query })
        .then((r) => res.status(r.code).send(r))
        .catch((c) => {
          ;
          return res.status(c.code).send(c)
        })
    })

  return router;
};
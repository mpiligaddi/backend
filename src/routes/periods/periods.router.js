const { body } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.utils");
const PeriodsController = require('./periods.controller');

const router = express.Router();

const controller = new PeriodsController();

router.route("/periods")
  .post([
    body("periods", "Faltó ingresar el periodos").isArray({ min: 1 }),
    validateBody
  ], (req, res) => {
    console.log(req.params.client);
    controller.createPeriod({ client: req.params.client, period: req.body.periods })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getPeriods({ client: req.params.client, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        ;
        return res.status(c.code).send(c)
      })
  })

router.route("/periods/:id")
  .get((req, res) => {
    controller.getClient({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteClient(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
  ], (req, res) => {
    controller.updateClient({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        ;
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateClient({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        ;
        return res.status(c.code).send(c)
      })
  })

module.exports = router;
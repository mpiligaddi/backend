const { body, header } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const CoveragesController = require('./coverages.controller');


const router = express.Router();

const controller = new CoveragesController();

router.route("/coverages")
  .post([
    body("client", "Faltó ingresar el cliente").isUUID(),
    body("branch", "Faltó ingresar la sucursal").isUUID(),
    body("intensity", "Faltó ingresar la intensidad").isNumeric(),
    body("frecuency", "Faltó ingresar la frecuencia").isNumeric(),
    validateBody
  ], (req, res) => {
    controller.createCoverage(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getCoverages({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        return res.status(c.code).send(c)
      })
  })

router.route("/coverages/:id")
  .get((req, res) => {
    controller.getCoverage({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteCoverage(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    body("intensity", "Faltó ingresar la intensidad").isNumeric(),
    body("frecuency", "Faltó ingresar la frecuencia").isNumeric(),
    validateBody
  ], (req, res) => {
    controller.updateCoverage({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        ;
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateCoverage({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        return res.status(c.code).send(c)
      })
  })



module.exports = router;
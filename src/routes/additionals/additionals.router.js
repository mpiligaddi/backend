const { body } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const AdditionalsController = require('./additionals.controller');

const router = express.Router();

const controller = new AdditionalsController();

router.route("/additionals")
  .post([
    body("name", "Faltó ingresar el nombre").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.createAdditional(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })
  .get((req, res) => {
    controller.getAdditionals({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })

router.route("/additionals/:id")
  .get((req, res) => {
    controller.getAdditional({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })
  .put([
    body("name", "Faltó ingresar el nombre").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateAdditional({ id: req.params.id, name: req.body.name })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })

module.exports = router;
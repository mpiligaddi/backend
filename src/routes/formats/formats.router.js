const { body, header } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const FormatsController = require('./formats.controller');

const router = express.Router();

const controller = new FormatsController();

router

router.route("/formats")
  .post([
    body("name", "Falta ingresar el nombre").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.createFormat(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getFormats({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        return res.status(c.code).send(c)
      })
  })

router.route("/formats/:id")
  .get((req, res) => {
    controller.getFormat({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteFormat(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    body("name", "Falta ingresar el nombre").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateFormat({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateFormat({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        return res.status(c.code).send(c)
      })
  })



module.exports = router;
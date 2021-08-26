const { body } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const RivalsController = require('./rivals.controller');

const router = express.Router();

const controller = new RivalsController();

router.route("/rivals")
  .post([
    body("name", "Faltó ingresar el nombre").notEmpty(),
    body("categories", "Faltó ingresar las categorias").isArray({ min: 1 }),
    body("clients", "Faltó ingresar clientes").isArray({ min: 1 }),
    validateBody
  ], (req, res) => {
    controller.createRival(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })
  .get((req, res) => {
    controller.getRivals({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })

router.route("/rivals/:id")
  .get((req, res) => {
    controller.getRival({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })
  .put([
    body("name", "Faltó ingresar el nombre").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateRival({ id: req.params.id, name: req.body.name })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })

router.route("/rivals/:id/client/:client")
  .patch((req, res) => {
    controller.addClient({ rival: req.params.id, client: req.params.client })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })
  .delete((req, res) => {
    controller.deleteClient({ rival: req.params.id, client: req.params.client })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })

router.route("/rivals/:id/category/:category")
  .patch((req, res) => {
    controller.addCategory({ rival: req.params.id, category: req.params.category })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })
  .delete((req, res) => {
    controller.deleteCategory({ rival: req.params.id, category: req.params.category })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(500).send({message: c.message}))
  })


module.exports = router;
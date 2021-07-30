const { body, header } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const ClientsController = require("./clients.controller");
const { route } = require('../assets/assets.router');


const router = express.Router();

const controller = new ClientsController();

router.route("/clients")
  .post([
    body("name", "Faltó ingresar el nombre").notEmpty(),
    body("displayname", "Faltó ingresar el nombre comercial").notEmpty(),
    body("address", "Faltó ingresar la dirección").notEmpty(),
    body("cuit", "Faltó ingresar el cuit").notEmpty(),
    body("admin", "Faltó ingresar el backoffice").notEmpty(),
    body("comercial", "Faltó ingresar el comercial").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.createClient(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getClients({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })

router.get("/clients/:client/categories", (req, res) => {
  controller.getCategories({ client: req.params.client, query: req.query })
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c))
})

router.get("/clients/:client/reports", (req, res) => {
  controller.getReports({ client: req.params.client, query: req.query })
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c))
})

router.route("/clients/:client/periods")
  .get((req, res) => {
    controller.getPeriods({ client: req.params.client, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .post([
    body("periods", "Faltó ingresar el periodos").isArray({ min: 1 }),
    validateBody
  ], (req, res) => {
    controller.createPeriod({ client: req.params.client, periods: req.body.periods })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

router.route("/clients/:id")
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
    body("name", "Faltó ingresar el nombre").notEmpty(),
    body("displayname", "Faltó ingresar el nombre comercial").notEmpty(),
    body("address", "Faltó ingresar la dirección").notEmpty(),
    body("cuit", "Faltó ingresar el cuit").notEmpty(),
    body("admin", "Faltó ingresar el backoffice").notEmpty(),
    body("comercial", "Faltó ingresar el comercial").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateClient({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateClient({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })



module.exports = router;
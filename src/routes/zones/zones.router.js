const { body } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.utils");
const ZonesController = require("./zones.controller");


const router = express.Router();

const controller = new ZonesController();

router.route("/zones")
  .post([
    body("name", "Faltó ingresar el nombre").notEmpty(),
    body("region", "Faltó ingresar la región").notEmpty(),
    body("supervisor", "Faltó ingresar al supervisor").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.createZone(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getZones({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

router.route("/zones/:id")
  .get((req, res) => {
    controller.getZone({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteZone(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    body("name", "Faltó ingresar el nombre").notEmpty(),
    body("region", "Faltó ingresar la región").notEmpty(),
    body("supervisor", "Faltó ingresar al supervisor").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateZone({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateZone({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })


module.exports = router;
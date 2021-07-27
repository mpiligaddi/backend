const { check } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const CoordinatorsController = require("./coordinators.controller");


const router = express.Router();

const controller = new CoordinatorsController();

router.route("/coordinators")
  .post([
    check("name", "Faltó ingresar el nombre").isEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    validateBody
  ], (req, res) => {
    controller.createCoordinator(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getCoordinators({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })


router.route("/coordinators/:id")
  .get((req, res) => {
    controller.getCoordinator({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteCoordinator(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    check("name", "Faltó ingresar el nombre").not().isEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    validateBody
  ], (req, res) => {
    controller.updateCoordinator({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateCoordinator({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })


module.exports = router;
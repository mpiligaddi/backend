const { check } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const SupervisorsController = require("./supervisors.controller");


const router = express.Router();

const controller = new SupervisorsController();

router.route("/supervisors")
  .post([
    check("name", "Faltó ingresar el nombre").notEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    check("coordinator", "El coordinador no es correcto").isEmail(),
    validateBody
  ], (req, res) => {
    controller.createSupervisor(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getSupervisors({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

router.route("/supervisors/:id")
  .get((req, res) => {
    controller.getSupervisor({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteSupervisor(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    check("name", "Faltó ingresar el nombre").notEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    check("coordinator", "El coordinador no es correcto").isEmail(),
    validateBody
  ], (req, res) => {
    controller.updateSupervisor({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateSupervisor({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })

module.exports = router;
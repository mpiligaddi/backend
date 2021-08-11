const { check, query } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const UsersController = require('./users.controller');


const router = express.Router();

const controller = new UsersController();

router.route("/users").get((req, res) => {
    controller.getUsers({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        ;
        return res.status(c.code).send(c);
      })
  })

router.route("/users/:id")
  .get((req, res) => {
    controller.getUser({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    check("name", "Faltó ingresar el nombre").not().isEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    validateBody
  ], (req, res) => {
    controller.updateUser({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        ;
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateUser({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        ;
        return res.status(c.code).send(c)
      })
  })



module.exports = router;
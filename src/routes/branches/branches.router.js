const { check } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const BranchesController = require('./branches.controller');

const router = express.Router();

const controller = new BranchesController();

router.route("/branches")
  .post([
    check("name", "Faltó ingresar el nombre").notEmpty(),
    check("displayname", "Faltó ingresar el nombre comercial").notEmpty(),
    check("locality", "Faltó ingresar la localidad").notEmpty(),
    check("address", "Faltó ingresar la dirección").notEmpty(),
    check("zone", "Faltó ingresar la zona").notEmpty(),
    check("chain", "Faltó ingresar la cadena").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.createBranch(req.body)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .get((req, res) => {
    controller.getBranches({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

router.route("/branches/:id")
  .get((req, res) => {
    controller.getBranch({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteBranch(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    check("name", "Faltó ingresar el nombre").notEmpty(),
    check("displayname", "Faltó ingresar el nombre comercial").notEmpty(),
    check("locality", "Faltó ingresar la localidad").notEmpty(),
    check("address", "Faltó ingresar la dirección").notEmpty(),
    check("zone", "Faltó ingresar la zona").notEmpty(),
    check("chain", "Faltó ingresar la cadena").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateBranch({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateBranch({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })


module.exports = router;
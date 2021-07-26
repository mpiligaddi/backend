const ComercialsController = require("./comercials.controller");
const { check, query } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.utils");


const router = express.Router();

const controller = new ComercialsController();

router.post("/comercial", [
  check("name", "Faltó ingresar el nombre").not().isEmpty(),
  check("email", "El email es incorrecto").isEmail(),
  validateBody
], (req, res) => {
  controller.createComercial(req.body)
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c))
})

router.route("/comercials/:id")
  .get((req, res) => {
    controller.getComercial({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteComerical(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    check("name", "Faltó ingresar el nombre").not().isEmpty(),
    check("email", "El email es incorrecto").isEmail(),
    validateBody
  ], (req, res) => {
    controller.updateComercial({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateComercial({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })

router.get("/comercials", (req, res) => {
  controller.getComercials({ query: req.query })
    .then((r) => res.status(r.code).send(r))
    .catch((c) => {
      console.log(c);
      return res.status(c.code).send(c);
    })
})


module.exports = router;
const { check } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.utils");
const ChainsController = require("./chains.controller");


const router = express.Router();

const controller = new ChainsController();

router.post("/chain", [
  check("name", "Faltó ingresar el nombre").notEmpty(),
  validateBody
], (req, res) => {
  controller.createChain(req.body)
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c))
})

router.route("/chains/:id")
  .get((req, res) => {
    controller.getChain({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteChain(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    check("name", "Faltó ingresar el nombre").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateChain({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateChain({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })

router.get("/chains", (req, res) => {
  controller.getChains({ query: req.query })
    .then((r) => res.status(r.code).send(r))
    .catch((c) => {
      console.log(c);
      res.status(c.code).send(c)
    })
})


module.exports = router;
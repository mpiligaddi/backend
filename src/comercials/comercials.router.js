const ComercialsController = require("./comercials.controller");
const { PrismaClient } = require("@prisma/client");
const { check } = require('express-validator');
var express = require("express");
const { validateBody } = require("../middlewares/validators.utils");
var router = express.Router();

/**
 *
 * @param {PrismaClient} prisma
 * @returns
 */
module.exports = function (prisma) {
  const controller = new ComercialsController(prisma);

  router.put("/comercials/create", [
    check("name", "Faltó ingresar tu nombre").not().isEmpty(),
    check("email", "Tu email es incorrecto").isEmail(),
    validateBody
  ], (req, res) => {
    controller.createComercial(req.body)
      .then((r) => {
        r.then((s) => {
          console.log(s);
        })
        res.status(200).send(r)
      })
      .catch((c) => {
        res.status(500).send(c);
      })
  })

  return router;
};

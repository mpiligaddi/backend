var express = require("express");
const { body } = require("express-validator");
const ReportsController = require('./reports.controller');


const router = express.Router();

const controller = new ReportsController();

router.use("/reports", require("./types/types.router")(controller));

router.route("/reports")
  .post([
    body("branchId", "Es necesario de una sucursal").notEmpty(),
    body("clientId", "Es necesario de un cliente").notEmpty(),
    body("chainId", "Es necesario de una cadena").notEmpty(),

    body("categories", "Es necesario de una lista de categorias").isArray(),
    body("categories.*.category", "Es necesario el id de la categoria").notEmpty(),

    body("categories.*.images", "Es necesario definir la lista de imagenes").if((value, { req }) => req.body.type == "photographic").isArray(),
    body("categories.*.images.*.name", "Falta el nombre de una imagen").isString().notEmpty(),
    body("categories.*.images.*.favorite", "Favorito tiene que ser un booleano").isBoolean().optional(true),
    body("categories.*.images.*.type", "El tipo de una foto es incorrecto es primary o secundary").isIn(["primary", "seundary"]).optional(true),
    body("categories.*.images.*.name", "Falta el nombre de una imagen").isString().optional(true),
    body("categories.*.images.*.uri", "Falta la url de una imagen").isURL(),

    body("categories.*.pricing").if((value, { req }) => req.body.type == "pricing").isArray(),
    body("categories.*.breakeven").if((value, { req }) => req.body.type == "breakeven").isArray(),

    body("createAt", "Es necesario el tiempo de creación").notEmpty(),
    body("isComplete", "isComplete es inválido").isBoolean(),
    body("location", "Es necesario una locación").notEmpty(),
    body("location.latitude", "La latitud es erronea").isNumeric(),
    body("location.longitude", "La longitud es erronea").isNumeric(),
    body("type", "El tipo de reporte es erroneo").isIn(["photographic", "breakeven", "pricing"])
  ], (req, res) => {
    controller.createReport(req.session.user.id, req.body)
      .then((r) => {
        return res.status(r.code).send(r);
      })
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c);
      })
  })

module.exports = router;
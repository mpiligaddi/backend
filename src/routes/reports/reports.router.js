var express = require("express");
const ReportsController = require('./reports.controller');
const multer = require("multer");
const { validateReport } = require("../../utils/json.utils.");
const fs = require('fs');
const path = require('path');
const { createFile } = require("../../utils/images.utils");

const router = express.Router();
const controller = new ReportsController();


var upload = multer({ dest: "public/temp", preservePath: false })

const path_url = "http://e.undervolt.io:3000/assets";

router.use("/reports", require("./types/types.router")(controller));


router.route("/reports")
  .post(upload.fields([{ name: "image", maxCount: 15 }, { name: "report", maxCount: 1 }]), (req, res) => {
    const report = JSON.parse(req.body.report);
    const reportValidator = validateReport(report);

    const id = req.session.user.id;

    if (reportValidator.valid)
      controller.createReport(id, report)
        .then((r) => {
          if (req.files.image.length > 0) {
            let directory = path.join(__dirname, "../../../public", id, r.report.id);

            if (!fs.existsSync(path.join(__dirname, "../../../public", id)))
              fs.mkdirSync(path.join(__dirname, "../../../public", id))
            if (!fs.existsSync(directory))
              fs.mkdirSync(directory);

            const success = [];
            const errors = [];

            Promise.all(req.files.image.map((file) => {
              return createFile(file, directory).then((value) => {
                success.push(`${path_url}/${id}/${r.report.id}/${value}`);
              }).catch((value) => {
                errors.push(value);
              })
            })).finally(() => {
              console.log(errors);
              console.log(success);
            })
          }
          return res.status(r.code).send(r);
        })
        .catch((c) => {
          console.log(c);
          return res.status(c.code).send(c);
        })
    else {
      return res.statuc(400).send({ code: 400, message: `${reportValidator.errors[0].path[0]} es un valor erroneo, revisalo.` })
    }
  })


module.exports = router;

/*
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
    body("type", "El tipo de reporte es erroneo").isIn(["photographic", "breakeven", "pricing"]) */
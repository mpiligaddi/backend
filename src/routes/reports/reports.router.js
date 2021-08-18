var express = require("express");
const ReportsController = require("./reports.controller");
const multer = require("multer");
const { validateReport } = require("../../utils/json.utils.");
const fs = require("fs");
const path = require("path");
const { createFile } = require("../../utils/images.utils");
const { user_role } = require("@prisma/client");
const { header, query, body } = require("express-validator");
const { validateBody } = require("../../middlewares/validators.middleware");

const router = express.Router();
const controller = new ReportsController();

var upload = multer({ dest: "public/temp", preservePath: false });

const path_url = "http://e.undervolt.io:3000/assets";

router.patch("/images/:id/favorite", [query("favorite", "Falta marcar si es favorito o no").isBoolean(), validateBody], (req, res) => {
  controller
    .favoriteReport({ id: req.params.id, favorite: req.query.favorite })
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c));
});
router.patch(
  "/images/:id/delete",
  [body("delete", "Es necesario marcar si se quiere borrar").isBoolean(), body("reason", "Es necesario marcar la razón de borrado").isString().notEmpty(), validateBody],
  (req, res) => {
    controller
      .deleteImage({ id: req.params.id, reason: req.body })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c));
  }
);
router.patch("/reports/:report/revised", [query("revised", "Falta marcar si está revisado o no").isBoolean(), validateBody], (req, res) => {
  controller
    .revisedReport({ id: req.params.report, revised: req.query.revised })
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c));
});

router
  .route("/reports/:report")
  .get((req, res) => {
    controller
      .getReport({ report: req.params.report, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c));
  })
  .patch((req, res) => {
    controller
      .updateReport({ report: req.params.report, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c));
  });

router
  .route("/reports")
  .post(
    upload.fields([
      { name: "image", maxCount: 15 },
      { name: "report", maxCount: 1 },
    ]),
    (req, res) => {
      const report = JSON.parse(req.body.report);
      const reportValidator = validateReport(report);

      const id = req.user.user.id;

      if (reportValidator.valid)
        controller
          .createReport(id, report)
          .then((r) => {
            if (report.type == "photographic" && req.files.image != null && req.files.image.length > 0) {
              let directory = path.join(__dirname, "../../../public", id, r.report.id);

              if (!fs.existsSync(path.join(__dirname, "../../../public", id))) fs.mkdirSync(path.join(__dirname, "../../../public", id));
              if (!fs.existsSync(directory)) fs.mkdirSync(directory);

              const success = [];
              const errors = [];

              Promise.all(req.files.image.filter((file) => {
                print(file);
                return file.mimetype.startsWith("image");
              }).map((file) => {
                console.log(file);
                return createFile(file, directory)
                  .then((value) => {
                    success.push(`${path_url}/${id}/${r.report.id}/${value}`);
                  })
                  .catch((value) => {
                    controller.deleteReport({id: r.report.id}).then(() => {
                      return res.status(400).send(value)
                    })
                  });
              }));
            }
            return res.status(r.code).send(r);
          })
          .catch((c) => {
            console.log(c);
            return res.status(c.code).send(c);
          });
      else {
        console.log(reportValidator.errors);
        return res.status(400).send({ code: 400, message: `${reportValidator.errors.map((errors) => errors.argument).join(', ')} son incorrectos` });
      }
    }
  )
  .get((req, res) => {
    if (req.user.user.role == user_role.client) {
      req.query.byclient = req.user.user.clientId;
    }
    controller
      .getReports({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c));
  });

module.exports = router;

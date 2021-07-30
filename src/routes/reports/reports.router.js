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

router.route("/reports/:report")
  .get((req, res) => {
    controller.getReport({ report: req.params.report, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .patch((req, res) => {
    controller.updateReport({ report: req.params.report, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

router.patch("/reports/:report/favorite", (req, res) => {

})

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
      return res.status(400).send({ code: 400, message: `${reportValidator.errors[0].path[0]} es un valor erroneo, revisalo.` })
    }
  })
  .get((req, res) => {
    controller.getReports({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })

module.exports = router;

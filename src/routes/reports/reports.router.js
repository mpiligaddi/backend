var express = require("express");
const ReportsController = require('./reports.controller');


const router = express.Router();

const controller = new ReportsController();

router.use("/reports", require("./types/types.router")(controller));

module.exports = router;
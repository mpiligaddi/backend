var express = require("express");
const morgan = require("morgan");
var bodyParser = require("body-parser");
const MongoDB = require("./src/db/mongo.driver");
const DataToDb = require("./data/dataToFirebase")

var app = express();

var mongo = new MongoDB();

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.post("*", function (req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0 || req.body.constructor != Object) return res.status(400).send({ code: 400, message: "La petición no puede estar vacía" });
  next();
});

mongo
  .connect()
  .then((db) => {

    const dbt = new DataToDb(db);
    dbt.uploadData()

    app.use("/auth", require("./src/auth/auth.router")(db));
    app.use("/assets", require("./src/assets/assets.router")(db));
    app.use("/api", require("./src/reports/reports.router")(db));
    app.use("/api", require("./src/reports/reports.router")(db));
    app.use("/api", require("./src/branches/branches.router")(db));

    app.listen(process.env.PORT || 3000, () => console.log("Server escuchando UwU"));
  })
  .catch((err) => {
    console.log(err);
  });

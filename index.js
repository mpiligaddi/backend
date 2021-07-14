var express = require("express");
const morgan = require("morgan");
const MongoDB = require("./src/db/mongo.driver");

var app = express();

var mongo = new MongoDB();

app.use(morgan("dev"));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

mongo
  .connect()
  .then((db) => {
    app.use("/auth", require("./src/auth/auth.router")(db));
    app.use("/assets", require("./src/assets/assets.router")(db));
    app.use("/api", require("./src/reports/reports.router")(db));
    app.use("/api", require("./src/clients/clients.router")(db));
    app.use("/api", require("./src/branches/branches.router")(db));

    app.listen(process.env.PORT || 3000, () => console.log("Server escuchando UwU"));
  })
  .catch((err) => {
    console.log(err);
  });

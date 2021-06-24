var express = require("express");
const morgan = require('morgan');
var bodyParser = require("body-parser");
const MongoDB = require("./src/db/mongo.driver");

var app = express();

var mongo = new MongoDB();

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

mongo.connect().then((db) => {

  app.use("/api", require("./src/auth/auth.router")(db));
  app.use("/assets", require("./src/assets/assets.router")(db))

  app.listen(process.env.PORT || 3000, () => console.log("Server escuchando UwU"));
}).catch((err) => {
  console.log(err);
})


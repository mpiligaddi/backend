var express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const MongoDB = require("./src/db/mongo.driver");
const MongoDBSession = require("connect-mongodb-session")(session);

var app = express();

var mongo = new MongoDB();

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const tt = require("./data/dataToFirebase");


mongo
  .connect(MongoDBSession)
  .then((db) => {

    app.use(session({
      secret: "uwu de awa con sabor a iwi",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
      },
      store: db.store,
      resave: false,
      saveUninitialized: false
    }))

    app.use("/api", (req, res, next) => {
      if (!req.session.isAuth) {
        return res.send({ "code": 401, message: "No se detectó ninguna sesión" })
      }

      next();
    })

    app.use("/auth", require("./src/auth/auth.router")(db));
    app.use("/assets", require("./src/assets/assets.router")(db));
    app.use("/api", require("./src/reports/reports.router")(db));
    app.use("/api", require("./src/clients/clients.router")(db));
    app.use("/api", require("./src/branches/branches.router")(db));
    app.use("/api", require("./src/chains/chains.router")(db));

    app.listen(process.env.PORT || 3000, () => console.log("Server escuchando UwU"));
  })
  .catch((err) => {
    console.log(err);
  });

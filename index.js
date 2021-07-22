var express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const { PrismaClient } = require('@prisma/client')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

const prisma = new PrismaClient()
var app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

//const tt = require("./data/dataToFirebase");

app.use(session({
  secret: "uwu de awa con sabor a iwi",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7
  },
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,  //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  ),
  resave: false,
  saveUninitialized: false
}))

app.use("/api", (req, res, next) => {
  req.session.auth = true;
  console.log(req.session);
  /* if (!req.session.isAuth) {
    return res.send({ "code": 401, message: "No se detectó ninguna sesión" })
  } */
  next();
})

app.use("/auth", require("./src/auth/auth.router")(prisma));
app.use("/api", require("./src/comercials/comercials.router")(prisma))
/* app.use("/assets", require("./src/assets/assets.router")());
app.use("/api", require("./src/reports/reports.router")());
app.use("/api", require("./src/clients/clients.router")());
app.use("/api", require("./src/branches/branches.router")());
app.use("/api", require("./src/chains/chains.router")()); */

app.listen(process.env.PORT || 3000, () => console.log("Server escuchando UWU"));
var express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const { PrismaClient } = require('@prisma/client')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const crypto = require('crypto');

const { authMiddleware } = require("./src/middlewares/auth.utils");

const prisma = new PrismaClient();
var app = express();

app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

prisma.$connect().then(() => {
  app.use(session({
    secret: "uwu de awa con sabor a iwi",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 4
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

  app.use("/api", authMiddleware)

  app.use("/assets", require("./src/routes/assets/assets.router"))

  app.use("/auth", require("./src/routes/auth/auth.router"));
  app.use("/api", require("./src/routes/comercials/comercials.router"))
  app.use("/api", require("./src/routes/coordinators/coordinators.router"))
  app.use("/api", require("./src/routes/supervisors/supervisors.router"))
  app.use("/api", require("./src/routes/branches/branches.router"))
  app.use("/api", require("./src/routes/zones/zones.router"))
  app.use("/api", require("./src/routes/clients/clients.router"))
  app.use("/api", require("./src/routes/chains/chains.router"))
  app.use("/api", require("./src/routes/categories/categories.router"))
  app.use("/api", require("./src/routes/reports/reports.router"))
  app.use("/api", require("./src/routes/accounts/accounts.router"))
  /*app.use("/assets", require("./src/assets/assets.router")());
  app.use("/api", require("./src/reports/reports.router")());
  app.use("/api", require("./src/clients/clients.router")());
  app.use("/api", require("./src/branches/branches.router")());
  app.use("/api", require("./src/chains/chains.router")()); */

  app.listen(process.env.PORT || 3000, () => console.log("Server escuchando UWU"));
}).catch((error) => {
  console.log(error);
})


module.exports = {
  prisma
}
var express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const { Pool } = require('pg');
const { createRateLimiter } = require('./src/middlewares/limiter.middleware')
const { PrismaClient } = require('@prisma/client')
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const helmet = require('helmet')
const cors = require('cors')

const { authMiddleware } = require("./src/middlewares/auth.middleware");
const { convertQuerys } = require("./src/middlewares/validators.middleware");

var prisma = new PrismaClient();

const psql = new Pool({
  host: 'chekdb.cskgaygskqk4.sa-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'chek',
  user: 'emirchus',
  password: 'emineko1',
});


var app = express();

app.use(morgan("dev"));
app.use(cors({
  origin: '*',
  credentials: true
}))
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());
prisma.$connect().then(() => {

  createRateLimiter({
    dbName: 'chek',
    storeClient: psql,
    points: 5,
    duration: 1,
    blockDuration: 60 * 15,
    tableName: 'limiters',
    keyPrefix: 'rlp'
  })
    .then(rateLimiter => {
      app.use(session({
        secret: "papurritesteo",
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

      app.use("/api", [authMiddleware, convertQuerys])

      app.use("/assets", require("./src/routes/assets/assets.router"))

      app.use("/auth", require("./src/routes/auth/auth.router")(rateLimiter));
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


      app.listen(process.env.PORT || 3000, () => console.log("Server escuchando UWU"));
    }).catch(e => {
      console.log(e);
    })
}).catch((error) => {
  console.log(error);
})


module.exports = {
  prisma
}
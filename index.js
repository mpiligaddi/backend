var express = require("express");
const morgan = require("morgan");
const { createRateLimiter } = require("./src/middlewares/limiter.middleware");
const helmet = require("helmet");
const cors = require("cors");
const psql = require("./src/db/psql.pool");
const { prisma } = require("./src/db/prisma.client");

var app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: ["http://localhost:4000", "http://chek.vercel.app", "http://chek-fedeya.vercel.app"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(helmet());

async function init() {
  await prisma.$connect();

  var rateLimiter = await createRateLimiter({
    dbName: "chek",
    storeClient: psql,
    points: 5,
    duration: 1,
    blockDuration: 60 * 15,
    tableName: "limiters",
    keyPrefix: "rlp",
  });

  app.use(require("./src/routes/index")(rateLimiter));
}

init()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => console.log(`Server escuchando UWU en porteño ${process.env.PORT || 3000}`));
  })
  .catch(async (errr) => {
    console.log(errr);
    await prisma.$disconnect();
    process.exit(0);
  });

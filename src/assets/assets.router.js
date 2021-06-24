var express = require("express");
const fs = require("fs");
const path = require("path");
const MongoDB = require("../db/mongo.driver");
var router = express.Router();
const sharp = require("sharp");

/**
 *
 * @param {MongoDB} db
 * @returns
 */
module.exports = function (db) {

  router.get("/:folder/:id/:name", (req, res) => {
    let {folder, id, name } = req.params;

    let directory = path.join(__dirname, "files", folder, id, `${name}.png`);
    fs.stat(directory, (err, exists) => {
      if (!exists || err) {
        res.send({ code: 404, message: "No se encontró el archivo" });
        return;
      } else {
        res.type("image/png");

        const widthString = req.query.w;
        const heightString = req.query.h;

        let width, height;

        if (widthString) {
          width = parseInt(widthString);
        }
        if (heightString) {
          height = parseInt(heightString);
        }
        resize(directory, width, height).pipe(res);
      }
    });
  });

  function resize(path, width, height) {
    const readStream = fs.createReadStream(path);
    let transform = sharp();

    if (width || height) {
      transform = transform.toFormat("png").resize(width, height);
    }

    return readStream.pipe(transform);
  }

  return router;
};

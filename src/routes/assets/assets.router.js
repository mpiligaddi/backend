var express = require("express");
const fs = require("fs");
const path = require("path");

var router = express.Router();
const multer = require("multer");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const { createFile, encodeImageToBlurhash, resizeImage } = require("../../utils/images.utils");

var upload = multer({ dest: "public/temp", preservePath: false })

const path_url = "https://e.undervolt.io:3000/assets"

router.route("/:id/:name")
  .post([authMiddleware, upload.array("file")], (req, res) => {
    let { id, name } = req.params;

    if (id != req.session.user.id) {
      req.files.forEach((file) => fs.unlinkSync(file.path))
      return res.status(401).send({ code: 401, message: "No estas autorizado para subir una imagen en este directorio" })
    }

    let directory = path.join(__dirname, "../../../public", id, name);

    if (req.files.length == 0) return res.status(400).send({ code: 400, message: "No hay archivos para subir" })

    if (!fs.existsSync(path.join(__dirname, "../../../public", id)))
      fs.mkdirSync(path.join(__dirname, "../../../public", id))
    if (!fs.existsSync(directory))
      fs.mkdirSync(directory);

    const success = [];
    const errors = [];

    Promise.all(req.files.map((file) => {
      return createFile(file, directory).then((value) => {
        success.push(`${path_url}/${id}/${name}/${value}`);
      }).catch((value) => {
        errors.push(value);
      })
    })).finally(() => {
      let response = { code: 500, message: "Error de servidor" };
      if (success.length == req.files.length && errors.length <= 0) {
        response.code = 202;
        response.message = "Imagenes creadas con éxito";
        response.images = success
      } else if (success.length <= 0 && errors.length > 0) {
        response.code = 500;
        response.message = "No se pudieron subir las imagenes";
        response.errors = errors;
      } else {
        response.code = 207;
        response.message = "Hubo un error en subir algunas imagenes";
        response.success = success;
        response.errors = errors;
      }

      return res.status(response.code).send(response);
    })
  })
  .get((req, res) => {
    let { id, name } = req.params;

    let directory = path.join(__dirname, "../../../public", id, name);

    if (!fs.existsSync(directory)) {
      return res.status(204).send({ code: 204, message: "No se encontró el directorio" })
    };

    var files = fs.readdirSync(directory);

    return res.status(200).send({ code: 200, message: "Imagenes encontradas con éxito", images: files.map((image) => `${path_url}/${id}/${name}/${image}`) })
  })


router.route("/:id/:folder/:name")
  .get((req, res) => {
    let { folder, id, name } = req.params;

    let directory = path.join(__dirname, "../../../public", id, folder, `${name}`);
    fs.stat(directory, (err, exists) => {
      if (!exists || err) {
        return res.status(204).send({ code: 204, message: "No se encontro el archivo" });
      } else {

        if (req.query.blur != undefined) {
          return encodeImageToBlurhash(directory).then((hash) => {
            console.log(hash);
            return res.status(200).send({ code: 200, image: hash });
          }).catch((err) => {
            console.log(err);
            return res.status(503).send({ code: 503, message: err })
          })
        }

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
        return resizeImage(directory, width, height).pipe(res);
      }
    });
  })
  .delete(authMiddleware, (req, res) => {
    let { folder, id, name } = req.params;

    let directory = path.join(__dirname, "../../../public", id, folder, `${name}`);

    if (!fs.existsSync(directory)) {
      return res.send({ code: 204, message: "No se encontró el archivo" });
    }

    fs.unlinkSync(directory);
    return res.status(200).send({ code: 200, message: "Imagen eliminada con éxito" })
  })
  .put(
    authMiddleware,
    upload.single("file")
    , (req, res) => {
      let { folder, id, name } = req.params;

      let directory = path.join(__dirname, "../../../public", id, folder, `${name}`);

      if (!fs.existsSync(directory)) {
        fs.unlinkSync(req.file.path);
        return res.status(204).send({ code: 204, message: "No se encontró el archivo" })
      };

      fs.unlinkSync(directory);

      if (!req.file) return res.status(400).send({ code: 400, message: "Es necesario adjuntar un archivo" })
      req.file.originalname = name;

      createFile(req.file, directory, true)
        .then(() => {
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
          return resize(directory, width, height).pipe(res);
        })
        .catch((c) => {
          return res.status(500).send(c.message);
        })
    })


module.exports = router;
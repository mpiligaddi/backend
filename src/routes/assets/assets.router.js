var express = require("express");
const fs = require("fs");
const path = require("path");
var router = express.Router();
const sharp = require("sharp");

const multer = require("multer");
const { authMiddleware } = require("../../middlewares/auth.utils");
const { encode } = require("blurhash");

var upload = multer({ dest: "public/temp", preservePath: false })

const path_url = "https://e.undervolt.io:3000/assets"

router.route("/:id/:name")
  .post([authMiddleware, upload.array("file")], (req, res) => {
    let { id, name } = req.params;

    if (id != req.session.user) {
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
      return res.status(404).send({ code: 404, message: "No se encontró el directorio" })
    };

    var files = fs.readdirSync(directory);
    console.log(files);

    return res.status(200).send({ code: 200, message: "Imagenes encontradas con éxito", images: files.map((image) => `${path_url}/assets`) })

  })


router.route("/:id/:folder/:name")
  .get((req, res) => {
    let { folder, id, name } = req.params;

    let directory = path.join(__dirname, "../../../public", id, folder, `${name}`);
    fs.stat(directory, (err, exists) => {
      if (!exists || err) {
        return res.status(404).send({ code: 404, message: "No se encontro el archivo" });
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
        return resize(directory, width, height).pipe(res);
      }
    });
  })
  .delete(authMiddleware, (req, res) => {
    let { folder, id, name } = req.params;

    let directory = path.join(__dirname, "../../../public", id, folder, `${name}`);

    if (!fs.existsSync(directory)) {
      return res.send({ code: 404, message: "No se encontró el archivo" });
    }

    fs.unlinkSync(directory);
    return res.status(200).send({ code: 200, message: "Imagen eliminada con éxito" })
  })
  .put([
    authMiddleware,
    upload.single("file")
  ], (req, res) => {
    let { folder, id, name } = req.params;

    let directory = path.join(__dirname, "../../../public", id, folder, `${name}`);

    if (!fs.existsSync(directory)) {
      fs.unlinkSync(req.file.path);
      return res.status(404).send({ code: 404, message: "No se encontró el archivo" })
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

async function createFile(file, directory, override = false) {
  return new Promise((resolve, reject) => {
    let fileName = file.originalname;
    let filePathName = `${fileName}`.split(" ").join("").split(".");
    filePathName.pop();
    let filePath = path.join(directory, filePathName.join(""));

    var alreadyExist = fs.existsSync(filePath);

    if (alreadyExist && !override) {
      fs.unlinkSync(file.path);
      return reject({ message: "Ya existe el archivo", name: fileName })
    }

    var tempFile = fs.readFileSync(file.path)

    if (!tempFile) return reject({ message: "No se detectó un archivo", name: fileName })

    var encoded = tempFile.toString('base64')
    var image = Buffer.from(encoded, 'base64')

    fs.writeFile(filePath, image, (err, writeResponse) => {
      fs.unlinkSync(file.path);
      if (err) return reject({ message: "No se pudo guardar la imagen", name: fileName })
      return resolve(filePathName.join(""))
    })
  })
}



async function encodeImageToBlurhash(directory) {
  return new Promise((resolve, reject) => {
    resize(directory, 32, 32)
      .raw()
      .ensureAlpha()
      .toBuffer((err, buffer, { width, height }) => {
        if (err) return reject(err);
        return resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 3));
      });
  });
}


function resize(directory, width, height) {
  const readStream = fs.createReadStream(directory);
  let transform = sharp();

  if (width || height) {
    transform = transform.toFormat("png").resize(width, height, { fit: 'cover' });
  }

  return readStream.pipe(transform);
}

module.exports = router;
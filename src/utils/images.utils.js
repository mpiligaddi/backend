const fs = require("fs");
const path = require("path");

const sharp = require("sharp");

const { encode } = require("blurhash");

async function createFile(file, directory, override = false) {
  return new Promise((resolve, reject) => {
    let fileName = file.originalname;
    if(!file.mimetype.startsWith("image"))  return reject({ message: "Archivo incorrecto", name: fileName })
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
    resizeImage(directory, 32, 32)
      .raw()
      .ensureAlpha()
      .toBuffer((err, buffer, { width, height }) => {
        if (err) return reject(err);
        return resolve(encode(new Uint8ClampedArray(buffer), width, height, 4, 3));
      });
  });
}


function resizeImage(directory, width, height) {
  const readStream = fs.createReadStream(directory);
  let transform = sharp();

  if (width || height) {
    transform = transform.toFormat("png").resize(width, height, { fit: 'cover' });
  }

  return readStream.pipe(transform);
}

module.exports = {
  resizeImage,
  encodeImageToBlurhash,
  createFile
}
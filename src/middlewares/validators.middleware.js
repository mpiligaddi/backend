const { validationResult } = require("express-validator");
const queryString = require('query-string');

const validateBody = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).send({
      code: 400,
      message: errores.array({ onlyFirstError: true })[0].msg
    })
  }

  next();
}

const convertQuerys = (req, res, next) => {
  var toRaw = "";
  for (key in req.query) {
    if (!req.query[key] || req.query[key] == "") continue;

    toRaw += `${key}=${req.query[key]}&`
  }
  req.query = queryString.parse(toRaw, {
    parseBooleans: true,
    parseNumbers: true
  })
  next();
}

module.exports = {
  validateBody,
  convertQuerys
}
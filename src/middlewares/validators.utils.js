const { validationResult, check } = require("express-validator");

const validateBody = (req, res, next) => {
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(500).send({
      message: errores.array({onlyFirstError: true})[0].msg
    })
  }

  next();
}

module.exports = {
  validateBody
}
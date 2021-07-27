var express = require("express");
const AuthController = require("./auth.controller");
const { check } = require('express-validator');
const { validateBody } = require("../../middlewares/validators.utils");

var router = express.Router();

const controller = new AuthController();

router.post("/register", [
  check("role", "Faltó ingresar el rol").notEmpty(),
  check("name", "Faltó ingresar el nombre").notEmpty(),
  check("password", "Faltó ingresar la contraseña").notEmpty(),
  check("email", "El email es incorrecto").isEmail(),
  check("role", "El rol es incorrecto").isIn('backoffice', 'merchandiser'),
  validateBody
], (req, res) => {

  controller
    .registerAccount(req.body)
    .then((r) => res.status(r.code).send(r))
    .catch((c) => {
      console.log(c);
      res.status(c.code).send(c)
    });
});

router.put("/authenticate", (req, res) => {
  if (!req.session.isAuth) return res.status(400).send({ code: 400, message: "No se encontro ninguna sesión" })
  req.session.regenerate((err) => {
    if (err) return res.status(500).send({ code: 500, message: "Hubo un error al autenticar la sesión" });
    return res.status(200).send({ code: 200, message: "Se reautenticó la sesión con éxito!", user: req.session.user });
  })
})

router.put("/logout", (req, res) => {
  if (!req.session.isAuth) return res.status(400).send({ code: 400, message: "No se encontro ninguna sesión" })
  req.session.destroy((err) => {
    if (err) return res.status(500).send({ code: 500, message: "Hubo un error al desconectarlo de la cuenta" });
    return res.status(200).send({ code: 200, message: "Se elimino la sesión actual." });
  })
});

router.post("/login", [
  check("password", "Faltó ingresar la contraseña").notEmpty(),
  check("email", "El email es incorrecto").isEmail(),
  validateBody
], (req, res) => {
  controller
    .tryLogin(req.body)
    .then((r) => {
      req.session.isAuth = true;
      req.session.user = r.user;
      return res.status(r.code).send(r);
    })
    .catch((c) => res.status(c.code).send(c));
});


module.exports = router;
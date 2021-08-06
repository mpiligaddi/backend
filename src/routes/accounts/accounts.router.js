var express = require("express");
const { check } = require('express-validator');
const { validateBody } = require("../../middlewares/validators.middleware");
const AccountsControllers = require("./accounts.controller");

var router = express.Router();

const controller = new AccountsControllers();

router.get("/profile", (req, res) => {
  return controller.getAccount({ id: req.session.user.id, query: req.query })
    .then((r) => {
      const { user } = r;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
        supervisorId: user.supervisorId
      }
      return res.status(r.code).send(r);
    })
    .catch((c) => {
      console.log(c);
      req.session.destroy();
      return res.status(c.code).send(c);
    })
});

router.get("/profile/reports", (req, res) => {
  return controller.getReportsByUser({ id: req.session.user.id, query: req.query })
    .then((r) => {
      return res.status(r.code).send(r);
    })
    .catch((c) => {
      return res.status(c.code).send(c);
    })
})

router.route("/accounts")
  .get((req, res) => {
    if (req.session.user.role != 'superadmin') return res.status(403).send({ code: 403, message: "No tenes permisos para esta opción" })

    return controller.getAccounts({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .post([
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
        ;
        res.status(c.code).send(c)
      });
  });


router.route("/accounts/:id")
  .get((req, res) => {
    const { id } = req.params;

    if (id != req.session.user.id && req.session.user.role != 'superadmin') return res.status(403).send({ code: 403, message: "No tenes permisos para esta opción" })

    return controller.getAccount({ id: id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })


module.exports = router;
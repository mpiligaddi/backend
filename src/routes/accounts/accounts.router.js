var express = require("express");
const { check } = require('express-validator');
const { validateBody } = require("../../middlewares/validators.utils");
const AccountsControllers = require("./accounts.controller");

var router = express.Router();

const controller = new AccountsControllers();

router.route("/accounts/:id")
  .get((req, res) => {
    const { id } = req.params;

    if (id != req.session.user.id && req.session.user.role != 'superadmin') return res.status(403).send({ code: 403, message: "No tenes permisos para esta opción" })

    return controller.getAccount({id: id, query: req.query})
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))


  })


module.exports = router;
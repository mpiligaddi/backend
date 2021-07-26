const { check } = require('express-validator');
var express = require("express");
const { validateBody } = require("../../middlewares/validators.utils");
const CategoriesController = require("./categories.controller");


const router = express.Router();

const controller = new CategoriesController();

router.post("/category", [
  check("name", "Faltó ingresar el nombre").notEmpty(),
  validateBody
], (req, res) => {
  controller.createCategory(req.body)
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c))
})

router.route("/categories/:id")
  .get((req, res) => {
    controller.getCategory({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .delete((req, res) => {
    controller.deleteCategory(req.params.id)
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c))
  })
  .put([
    check("name", "Faltó ingresar el nombre").notEmpty(),
    validateBody
  ], (req, res) => {
    controller.updateCategory({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })
  .patch((req, res) => {
    controller.updateCategory({ search: req.params.id, data: req.body, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c)
      })
  })

router.get("/categories", (req, res) => {
  controller.getCategories({ query: req.query })
    .then((r) => res.status(r.code).send(r))
    .catch((c) => {
      console.log(c);
      return res.status(c.code).send(c);
    })
})


module.exports = router;
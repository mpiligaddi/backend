const { body, header } = require("express-validator");
var express = require("express");
const { validateBody } = require("../../middlewares/validators.middleware");
const ProductsController = require("./products.controller");

const router = express.Router();

const controller = new ProductsController();

router
  .route("/products")
  .post(
    [
      body("name", "Faltó ingresar el nombre").notEmpty(),
      body("chain", "Faltó ingresar la cadena").isUUID(),
      body("client", "Faltó ingresar el cliente").isUUID(),
      body("type", "El tipo de producto es incorrecto").isIn(["primary", "secondary"]),
      validateBody,
    ],
    (req, res) => {
      controller.createProduct(req.body).then((r) => res.status(r.code).send(r));
    }
  )
  .get((req, res) => {
    controller
      .getProducts({ query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        console.log(c);
        return res.status(c.code).send(c);
      });
  });

router.route("/products/chains").get(controller.getProductsChains).post(controller.createProductChain);

router.route("/products/chains/:id").put(controller.updateProductChain).delete(controller.deleteProductChain);

router
  .route("/products/:id")
  .get((req, res) => {
    controller
      .getProduct({ search: req.params.id, query: req.query })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => res.status(c.code).send(c));
  })
  .put(
    [
      body("name", "Faltó ingresar el nombre").notEmpty(),
      body("chain", "Faltó ingresar la cadena").isUUID(),
      body("client", "Faltó ingresar el cliente").isUUID(),
      body("type", "El tipo de producto es incorrecto").isIn(["primary", "secondary"]),
      validateBody,
    ],
    (req, res) => {
      controller
        .updateClient({ search: req.params.id, data: req.body })
        .then((r) => res.status(r.code).send(r))
        .catch((c) => {
          return res.status(c.code).send(c);
        });
    }
  )
  .patch((req, res) => {
    controller
      .updateProduct({ search: req.params.id, data: req.body })
      .then((r) => res.status(r.code).send(r))
      .catch((c) => {
        return res.status(c.code).send(c);
      });
  });

router.route("/products/:id/:chainId").delete((req, res) => {
  controller
    .deleteProduct(req.params.id, req.params.chainId)
    .then((r) => res.status(r.code).send(r))
    .catch((c) => res.status(c.code).send(c));
});

module.exports = router;

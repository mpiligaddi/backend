var express = require("express");
const ChainsController = require("./chains.controller");
var router = express.Router();

module.exports = function () {

  const controller = new ChainsController();

  router.post("/chains/get", (req, res) => {

    if (req.body.id == null) return res.send({ code: 503, message: "Falta un identificador" });

    return controller.getChain(req.body)
      .then((r) => res.send(r))
      .catch(c => res.send(c));
  })

  router.post("/chains/all", (req, res) => {

    return controller.getChains(req.body)
      .then((r) => res.send(r))
      .catch(c => res.send(c));
  })


  router.post("/chains/create", (req, res) => {
    const _defaultParams = ["clientId", "OFC", "OQC", "OPC", "name"];

    if (!["admin", "superadmin", "god"].includes(req.session.account.role)) return res.send({ code: 503, message: "No tenes los permisos para hacer esta acción" });

    var params = _defaultParams.filter((value) => !Object.keys(req.body).includes(value));

    if (params.length != 0) {
      return res.send({ code: 206, message: `Faltan parametros: ${params.join(", ")}` });
    }

    return controller.createChain(req.body)
      .then(r => res.send(r))
      .catch(c => res.send(c));
  })

  router.post("/chains/update", (req, res) => {
    if(req.body.id == null) return res.send({code: 503, message: "Falta un identificador"})

    return controller.updateChain(req.body)
      .then(r => res.send(r))
      .catch(c => res.send(c));
  })

  return router;
};

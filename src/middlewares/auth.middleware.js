const { user_role } = require('@prisma/client')
const { prisma } = require('../db/prisma.client')
const { endpointsRoles } = require('../utils/endpoints.utils')

const authMiddleware = async (req, res, next) => {
  if (!req.session.isAuth) {
    return res.status(401).send({ "code": 401, message: "No se detectó ninguna sesión" })
  }
  if (["POST", "GET", "UPDATE", "PATCH", "PUT"].includes(req.method)) {
    const userFetch = await prisma.user.findFirst({
      where: {
        id: req.session.user.id
      },
      select: {
        client:{
          select: {
            name: true,
            displayName: true,
            cuit: true
          }
        }
      }
    });

    if (!userFetch)
      return res.status(500).send({ "code": 500, message: "Hubo un error al buscar la sesión" })

    req.user = userFetch;
  }
  next()
}

const csrfMiddleware = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  return res.status(403).send({ "code": 403, message: "Esta acción no está permitida" })
}

const permissionMiddleware = (req, res, next) => {
  var endpoint = req.url.split("?")[0].split("/");
  if(!req.user) return res.status(500).send({code: 500, message: "Hubo un error al buscar la sesión"});

  if (req.user.role == user_role.superadmin) return next();

  endpoint.shift();
  const role = endpointsRoles[req.user.role];
  const method = role[req.method];

  let uuid = "\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b";

  if (method != null && method.find((request) => {
    return endpoint.join("/").match(RegExp(request.replace(":id", uuid), "gi"));
  })) return next();

  return res.status(401).send({ "code": 401, message: "Permisos insuficientes" })
}

module.exports = {
  authMiddleware,
  csrfMiddleware,
  permissionMiddleware
}
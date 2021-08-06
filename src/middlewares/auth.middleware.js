const { user_role } = require('@prisma/client')
const { prisma } = require('../db/prisma.client')
const { endpointsRoles } = require('../utils/endpoints.utils')

const authMiddleware = async (req, res, next) => {
  if (!req.session.isAuth) {
    return res.status(401).send({ "code": 401, message: "No se detectó ninguna sesión" })
  }
  if (["POST", "GET", "UPDATE", "PATCH"].includes(req.method)) {
    const userFetch = await prisma.user.findFirst({
      where: {
        id: req.session.user.id
      },
      include: {
        clients: {
          take: 2,
          select: {
            id: true
          }
        }
      }
    });

    if (!userFetch)
      return res.status(500).send({ "code": 500, message: "Hubo un error al buscar la sesión" })

    let { clients, ...user } = userFetch;

    let finalUser = user

    if (user.role == user_role.client) finalUser.client = clients[0].id;

    req.user = finalUser;
  }

  next()
}

const csrfMiddleware = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  return res.status(403).send({ "code": 403, message: "Esta acción no está permitida" })

}

const permissionMiddleware = (req, res, next) => {
  var endpoint = req.url.split("?")[0].split("/");

  if (req.user.role == user_role.superadmin) return next();

  endpoint.shift();
  const role = endpointsRoles[req.user.role];
  const method = role[req.method];
  if (method != null && method.find((request) => request.test(endpoint.join("/")))) return next();

  return res.status(401).send({ "code": 401, message: "Permisos insuficientes" })
}

module.exports = {
  authMiddleware,
  csrfMiddleware,
  permissionMiddleware
}
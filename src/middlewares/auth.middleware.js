const { user_role } = require('@prisma/client')
const { prisma } = require('../..')
const { endpointsRoles } = require('../utils/endpoints.utils')

const authMiddleware = (req, res, next) => {
  if (!req.session.isAuth) {
    return res.status(401).send({ "code": 401, message: "No se detectó ninguna sesión" })
  }
  prisma.user.findFirst({
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
  }).then(({ clients, ...user }) => {
    let finalUser = user
    if (user.role == user_role.client) {
      finalUser.client = clients[0].id;
    }
    req.user = user;
    next()
  }).catch((err) => {
    return res.status(500).send({ "code": 500, message: "Hubo un error al buscar la sesión" })
  })
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
  if (method != null && method.includes(endpoint.map((end, index) => index == endpoint.length - 1 && endpoint.length > 1 ? ":id" : end).join("/"))) return next();

  return res.status(401).send({ "code": 401, message: "Permisos insuficientes" })
}

module.exports = {
  authMiddleware,
  csrfMiddleware,
  permissionMiddleware
}
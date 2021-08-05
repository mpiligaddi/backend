const { user_role } = require('@prisma/client')

const authMiddleware = (req, res, next) => {
  if (!req.session.isAuth) {
    return res.status(401).send({ "code": 401, message: "No se detectó ninguna sesión" })
  }
  next();
}

const csrfMiddleware = (err, req, res, next) => {
  console.log(err);
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  return res.status(403).send({ "code": 403, message: "Esta acción no está permitida" })

}

const permissionMiddleware = (req, res, next) => {
  var endpoint = req.url.split("/")[1];

  if (req.session.user.role == user_role.superadmin) return next();

  if (/(client|merchandiser)/gi.test(req.session.user.role) &&
    (/(reports)/gi.test(endpoint.split("?")[0]) && (req.method == "POST" && req.session.user.role == user_role.merchandiser || req.method == "GET" && req.session.user.role == user_role.client))
    || (/(clients|chains|branches|profile)/i.test(endpoint.split("?")[0]) && !(/reports/i.test(endpoint)) && req.method == "GET")) {
    return next();
  } else if (req.session.user.role === user_role.backoffice &&
    (/(reports|reports\?)/gi.test(endpoint.split("?")[0])
      || (/(clients|chains|branches|profile)/i.test(endpoint.split("?")[0]) && req.method == "GET"))) {
    console.log(req.session.user.role == user_role.backoffice);
    return next();
  }
  return res.status(401).send({ "code": 401, message: "Permisos insuficientes" })
}

module.exports = {
  authMiddleware,
  csrfMiddleware,
  permissionMiddleware
}
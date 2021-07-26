const authMiddleware = (req, res, next) => {
  if (!req.session.isAuth) {
    return res.status(403).send({ "code": 401, message: "No se detectó ninguna sesión" })
  }
  next();
}

module.exports = {
  authMiddleware
}
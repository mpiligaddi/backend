const { user_role } = require("@prisma/client");
const bcrypt = require("bcrypt-nodejs");
const { prisma } = require("../../db/prisma.client");

class AuthController {
  constructor() {
    /* this.accounts = db.accounts;
    this.users = db.users; */
    this.account = prisma.account;
    this.user = prisma.user;
  }

  async tryLogin({ email, password }) {
    return new Promise((resolve, reject) => {
      this.account.findUnique({
        where: {
          email: email
        },
        include: {
          user: true,
        }
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró la cuenta." })

        var hasPassword = bcrypt.compareSync(password, result.password)

        if (!hasPassword) return reject({ code: 401, message: "La contraseña es incorrecta" })

        return resolve({ code: 202, message: "Sesión creada con éxito", user: result.user });
      }).catch((reason) => {
        console.log(reason);
        return reject({ code: 500, message: "Hubo un error al buscar la cuenta." })
      })
    });
  }


}

module.exports = AuthController;

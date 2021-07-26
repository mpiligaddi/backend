const { user_role } = require("@prisma/client");
const bcrypt = require("bcrypt-nodejs");
const { prisma } = require("../../..");

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
        if (!result) return reject({ code: 404, message: "No se encontró la cuenta." })

        var hasPassword = bcrypt.compareSync(password, result.password)

        if (!hasPassword) return reject({ code: 401, message: "La contraseña es incorrecta" })

        return resolve({ code: 202, message: "Sesión creada con éxito", user: result.user });
      }).catch((reason) => {
        console.log(reason);
        return reject({ code: 500, message: "Hubo un error al buscar la cuenta." })
      })
    });
  }

  async registerAccount(model) {
    return new Promise((resolve, reject) => {
      const { email, password } = model;

      const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync());

      if (model.role == user_role.merchandiser && !model.supervisor) return reject({ code: 400, message: "Falta indicar el supervisor" })

      this.account.create({
        data: {
          email: email,
          password: passwordHash,
          user: {
            create: {
              email: email,
              name: model.name,
              role: user_role[model.role],
              supervisor: model.role == user_role.merchandiser ? {
                connect: {
                  id: model.supervisor
                }
              } : undefined,
            }
          }
        },
        include: {
          user: true
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se pudo crear la cuenta." })
        return resolve({ code: 202, message: "Cuenta creada con éxito!", user: result.user });
      }).catch((reason) => {
        if (reason.code && reason.code == 'P2002') {
          return reject({ code: 400, message: "El correo ya existe" })
        }
        return reject({ code: 500, message: "Hubo un error al crear la cuenta." })
      })
    });
  }
}

module.exports = AuthController;

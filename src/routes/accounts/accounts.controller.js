const { user_role } = require("@prisma/client");
const bcrypt = require("bcrypt-nodejs");
const { prisma } = require("../../..");

class AccountsControllers {
  constructor() {
    /* this.accounts = db.accounts;
    this.users = db.users; */
    this.account = prisma.account;
    this.user = prisma.user;
  }

  async getAccount({ id, query }) {
    return new Promise((resolve, reject) => {
      this.user.findUnique({
        where: {
          id: id
        },
        include: {
          account: {
            select: {
              id: true,
              email: true
            }
          },
          clients: query.clients ? {
            select: {
              id: true,
              name: true,
              displayName: true,
              cuit: true,
              coverages: true
            }
          } : false,
          reports: query.reports ?? false,
          supervisor: query.supervisor ?? false
        }
      }).then((user) => {
        if (!user) return reject({ code: 404, message: "No se encontró ningún usuario" })
        return resolve({ code: 200, message: "Usuario encontrado.", user })
      }).catch((error) => {
        return reject({ code: 503, message: "Hubo un error al intentar buscar la cuenta" })
      })
    })
  }

  async getAccounts({ query }) {
    return new Promise((resolve, reject) => {
      this.account.findMany({
        orderBy: {
          email: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: +query.start || 0,
        take: +query.end || 10,

        include: {
          account: {
            select: {
              id: true,
              email: true
            }
          },
          clients: query.clients ? {
            select: {
              id: true,
              name: true,
              displayName: true,
              cuit: true,
              coverages: true
            }
          } : false,
          reports: query.reports ?? false,
          supervisor: query.supervisor ?? false
        }
      }).then((result) => {
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron cuentas." });
        return resolve({ code: 200, message: "Cuentas encontrados con éxito", accounts: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las cuentas." })
      })
    })
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

module.exports = AccountsControllers;

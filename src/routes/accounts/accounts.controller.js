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
        if(!user) return reject({code: 404, message: "No se encontró al usuario con ese id"})
        return resolve({ code: 200, message: "Usuario encontrado.", user })
      }).catch((error) => {
        return reject({code: 503, message: "Hubo un error al intentar buscar la cuenta"})
      })
    })
  }



}

module.exports = AccountsControllers;

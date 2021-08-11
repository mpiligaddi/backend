const { user_role } = require("@prisma/client");
const { prisma } = require("../../db/prisma.client");


class UsersController {
  constructor() {
    this.users = prisma.user;
  }

  async updateUser({ search, data }) {
    return new Promise((resolve, reject) => {
      this.users.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          email: data.email,
        }
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró al usuario." });
        return resolve({ code: 200, message: "Se actualizó al usuario con éxito", user: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al usuario" })
      })
    })
  }

  async getUser({ search }) {
    return new Promise(async (resolve, reject) => {
      const result = await this.users.findUnique({
        where: {
          id: search
        }
      }).then(async (result) => {
        return resolve({ code: 200, message: "Usuario encontrado con éxito", user: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar all usuario." })
      })
    })
  }

  async getUsers({ query }) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.users.findMany({
          orderBy: {
            name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
          },
          where: {
            role: {
              equals: user_role[query.role] ?? user_role.backoffice
            }
          },
          skip: query.start,
          take: query.end
        })
        const maxCount = await this.users.count();
        return resolve({ code: 200, message: result.length == 0 ? "No se encontraron usuarios." : "Usuarios encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, user: result });
      } catch (error) {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar los usuarios." })
      }
    })
  }

}

module.exports = UsersController;
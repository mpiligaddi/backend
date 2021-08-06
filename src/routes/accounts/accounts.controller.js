const { user_role, report_types } = require("@prisma/client");
const bcrypt = require("bcrypt-nodejs");
const { prisma } = require("../../..");

class AccountsController {
  constructor() {
    /* this.accounts = db.accounts;
    this.users = db.users; */
    this.account = prisma.account;
    this.user = prisma.user;
    this.reports = prisma.report;
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
              coverages: query.coverages ?? false
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
        skip: query.start,
        take: query.end,
        include: {
          user: query.user ? {
            select: {
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

                }
              } : false,
              reports: query.reports ?? false,
              supervisor: query.supervisor ?? false
            }
          } : false
        }
      }).then(async (result) => {
        const maxCount = await this.account.count();
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron cuentas.", accounts: [] });
        return resolve({ code: 200, message: "Cuentas encontradas con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, accounts: result });
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

  async getReportsByUser({ id, query }) {
    return new Promise((resolve, reject) => {

      let reportFilter = {};

      switch (query.type) {
        case report_types.photographic:
          reportFilter.photos = {
            select: {
              images: {
                select: {
                  name: true,
                  id: true,
                  comment: true,
                  delete: true,
                  type: true,
                }
              }
            }
          }
          break;

        default:
          break;
      }

      this.reports.findMany({
        where: {
          creatorId: {
            equals: id
          },
          type: {
            equals: report_types[query.type ?? "photographic"] ?? report_types.photographic
          }
        },
        orderBy: {
          createdAt: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: query.start,
        take: query.end,
        include: {
          branch: query.branch ? {
            select: {
              id: true,
              displayName: true,
              name: true
            },
          } : false,
          categories: query.categories ? {
            select: {
              category: {
                select: {
                  name: true,
                  id: true,
                }
              },
              badCategory: true,
              withoutStock: true,
              ...reportFilter
            }
          } : false,
          chain: query.chain ? {
            select: {
              id: true,
              name: true,
            }
          } : false,
          client: query.client ? {
            select: {
              displayName: true,
              id: true,
              name: true
            }
          } : false
        }
      }).then(async (result) => {
        const maxCount = await this.reports.count({
          where: {
            creatorId: {
              equals: id
            },
            type: {
              equals: report_types[query.type ?? "photographic"] ?? report_types.photographic
            }
          }
        });
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron las reportes para este usuario.", reports: [] });
        return resolve({ code: 200, message: "Reportes encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, reports: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las reportes." })
      })
    })
  }
}

module.exports = AccountsController;

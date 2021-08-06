const { prisma } = require("../../..");


class ClientsController {
  constructor() {
    this.clients = prisma.client;
    this.periods = prisma.clientPeriodReport;
    this.categories = prisma.clientCategory;
    this.reports = prisma.report;
  }

  async createClient({ name, displayname, address, cuit, admin, comercial }) {
    return new Promise(async (resolve, reject) => {
      this.clients.create({
        data: {
          name,
          displayName: displayname,
          address,
          cuit,
          admin: {
            connect: {
              id: admin
            }
          },
          comercial: {
            connect: {
              id: comercial
            }
          }
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Cliente creado con éxito!", client: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear al cliente" })
      })
    })
  }

  async updateClient({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.clients.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          displayName: data.displayname,
          address: data.address,
          cuit: data.cuit,
          adminId: data.admin,
          comercialId: data.comercial
        },
        include: {
          admin: query.admin ? {
            select: {
              id: true,
              name: true,
              email: true
            }
          } : false,
          categories: query.categories ? {
            select: {
              id: true,
              category: {
                include: {
                  products: true
                }
              }
            }
          } : false,
          comercial: query.comercial ?? false,
          coverages: query.coverages ? {
            select: {
              branch: {
                select: {
                  id: true,
                  displayName: true,
                  chain: true,
                  address: true
                }
              },
              clientId: false,
              frecuency: true,
              intensity: true,
              id: true
            }
          } : false,
          periods: query.periods ? {
            select: {
              period: {
                select: {
                  name: true,
                  alias: true,
                  type: true
                }
              },
              id: true
            }
          } : false,
          reports: query.reports ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al cliente" })
        return resolve({ code: 200, message: "Se actualizó al cliente con éxito", client: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al cliente" })
      })
    })
  }

  async getClient({ search, query }) {
    return new Promise((resolve, reject) => {

      this.clients.findUnique({
        where: {
          id: search
        },
        include: {
          admin: query.admin ? {
            select: {
              id: true,
              name: true,
              email: true
            }
          } : false,
          categories: query.categories ? {
            select: {
              id: true,
              category: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          } : false,
          comercial: query.comercial ?? false,
          coverages: query.coverages ? {
            select: {
              branch: {
                select: {
                  id: true,
                  displayName: true,
                  chain: true,
                  address: true
                }
              },
              clientId: false,
              frecuency: true,
              intensity: true,
              id: true
            }
          } : false,
          periods: query.periods ? {
            select: {
              period: {
                select: {
                  name: true,
                  alias: true,
                  type: true
                }
              },
              id: true
            }
          } : false,
          reports: query.reports ? {
            include: {
              categories: {
                include: {
                  category: {
                    select: {
                      name: true,
                      id: true,
                    }
                  },
                  photos: {
                    include: {
                      images: true
                    }
                  }
                }
              }
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al cliente" })
        return resolve({ code: 200, message: "Cliente encontrado con éxito.", client: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al cliente" })
      })
    })
  }

  async deleteClient(id) {
    return new Promise((resolve, reject) => {
      this.clients.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino al cliente con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar al cliente" })
      })
    })
  }

  async getClients({ query }) {
    return new Promise((resolve, reject) => {
      let filters = {
        NOT: {},
        AND: {
          NOT: {}
        }
      };
      if (query.coverages == "only") {
        filters.NOT.coverages = {
          none: {}
        }
      }

      if (query.products) {
        let value = filters[query.coverages == "only" ? "AND" : "NOT"];
        if (query.coverages != "only") {
          value.categories = {
            every: {
              NOT: {
                category: {
                  NOT: {
                    products: {
                      none: {}
                    }
                  }
                }
              }
            }
          }
        } else {
          value.NOT.categories = {
            every: {
              NOT: {
                category: {
                  NOT: {
                    products: {
                      none: {}
                    }
                  }
                }
              }
            }
          }
        }
      }
      this.clients.findMany({
        orderBy: {
          displayName: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        where: filters,
        skip: query.start,
        take: query.end,
        include: {
          admin: query.admin ? {
            select: {
              id: true,
              name: true,
              email: true
            }
          } : false,
          categories: query.categories ? {
            select: {
              id: true,
              category: {
                select: {
                  name: true,
                  id: true
                }
              }
            }
          } : false,
          comercial: query.comercial ?? false,
          coverages: query.coverages ? {
            select: {
              branch: {
                select: {
                  id: true,
                  displayName: true,
                  chain: true,
                  address: true
                }
              },
              clientId: false,
              frecuency: true,
              intensity: true,
              id: true
            }
          } : false,
          periods: query.periods ? {
            select: {
              period: {
                select: {
                  id: true,
                  name: true,
                  alias: true,
                  type: true
                }
              },
              id: true
            }
          } : false,
          reports: query.reports ? {
            include: {
              categories: {
                include: {
                  category: {
                    select: {
                      name: true,
                      id: true,
                    }
                  },
                  photos: {
                    include: {
                      images: true
                    }
                  }
                }
              }
            }
          } : false
        }
      }).then(async (result) => {
        const maxCount = await this.clients.count({
          where: filters
        });
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron clientes.", clients: [] });
        return resolve({ code: 200, message: "Clientes encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, clients: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar los clientes." })
      })
    })
  }

}

module.exports = ClientsController;
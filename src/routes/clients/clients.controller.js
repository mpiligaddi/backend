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
                select:{
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
        skip: +query.start || 0,
        take: +query.end || 10,
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
                select:{
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
      }).then((result) => {
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron clientes." });
        return resolve({ code: 200, clients: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar los clientes." })
      })
    })
  }

  async getPeriods({ client, query }) {
    return new Promise((resolve, reject) => {
      this.periods.findMany({
        where: {
          clientId: {
            equals: client
          }
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        include: {
          client: query.client ? {
            select: {
              id: true,
              cuit: true,
              name: true,
              displayName: true
            }
          } : false,
          period: query.period ? {
            select: {
              name: true,
              alias: true,
              type: {
                select: {
                  name: true,
                  alias: true
                }
              }
            }
          } : false
        }
      }).then((result) => {
        console.log(result);
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron periodos." });
        return resolve({ code: 200, periods: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar los periodos." })
      })
    })

  }

  async createPeriod({ client, periods }) {
    return new Promise(async (resolve, reject) => {
      this.clients.update({
        where: {
          id: client
        },
        data: {
          periods: {
            createMany: {
              data: periods.map((period) => {
                return {
                  periodId: period
                }
              })
            }
          }
        },
        select: {
          periods: {
            select: {
              id: true,
              period: {
                select: {
                  name: true,
                  alias: true,
                  type: true
                }
              }
            }
          }
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Periodos añadidos con éxito!", periods: result.periods })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear los periodos" })
      })
    })
  }

  async getCategories({ client, query }) {
    return new Promise((resolve, reject) => {
      this.categories.findMany({
        where: {
          clientId: client
        },
        select: {
          category: {
            select: {
              name: true,
              id: true,
              products: query.products ? {
                select: {
                  name: true,
                  type: true,
                  id: true
                }
              } : false
            }
          }
        }
      }).then((result) => {
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron categorias para el cliente." });
        return resolve({ code: 200, categories: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las categorias para el cliente." })
      })
    })
  }


  async getReports({ client, query }) {
    return new Promise((resolve, reject) => {
      this.reports.findMany({
        where: {
          clientId: {
            equals: client
          }
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        include: {
          branch: query.branch ? {
            select: {
              address: true,
              displayName: true,
              name: true,
              id: true
            }
          } : false,
          chain: query.chain ? {
            select: {
              format: true,
              id: true,
              name: true,
            }
          } : false,
          client: query.client ? {
            select: {
              displayName: true,
              name: true,
              id: true,
              cuit: true
            }
          } : false,
          categories: query.categories ? {
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
          } : false,
          creator: query.creator ? {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          } : false,
          location: query.location
        }
      }).then((result) => {
        console.log(result);
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron reportes." });
        return resolve({ code: 200, reports: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar los reportes." })
      })
    })

  }
}

module.exports = ClientsController;
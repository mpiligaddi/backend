const { prisma } = require("../../..");


class ChainsController {
  constructor() {
    this.chains = prisma.chain;
    this.branches = prisma.branch;
  }

  async createChain({ name }) {
    return new Promise(async (resolve, reject) => {
      this.chains.create({
        data: {
          name
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Cadena creada con éxito!", chain: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear la cadena" })
      })
    })
  }

  async updateChain({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.chains.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
        },
        include: {
          branches: query.branches ? {
            select: {
              id: true,
              displayName: true,
              address: true,
              coverages: {
                select: {
                  clientId: true
                }
              }
            }
          } : false,
          products: query.products ? {
            select: {
              product: {
                select: {
                  id: true,
                  category: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  name: true,
                  type: true,
                }
              }
            },
          } : false,
          reports: query.reports ? {
            select: {
              id: true
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la cadena" })
        return resolve({ code: 200, message: "Se actualizó la cadena con éxito", chain: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la cadena" })
      })
    })
  }

  async getChain({ search, query }) {
    return new Promise((resolve, reject) => {

      this.chains.findUnique({
        where: {
          id: search,
        },
        include: {
          branches: query.branches ? {
            select: {
              id: true,
              displayName: true,
              address: true,
              coverages: {
                select: {
                  clientId: true
                }
              }
            }
          } : false,
          products: query.products ? {
            select: {
              product: {
                select: {
                  id: true,
                  category: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  name: true,
                  type: true,
                }
              }
            },
          } : false,
          reports: query.reports ? {
            select: {
              id: true
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la cadena" })
        return resolve({ code: 200, message: "Cadena encontrada con éxito.", chain: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la cadena" })
      })
    })
  }

  async deleteChain(id) {
    return new Promise((resolve, reject) => {
      this.chains.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino la cadena con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar la cadena" })
      })
    })
  }

  async getChains({ query }) {
    return new Promise((resolve, reject) => {

      let filter = {
        NOT: {}
      };

      if (query.byclient) {
        filter.branches = {
          some: {
            coverages: {
              some: {
                clientId: {
                  equals: query.byclient
                }
              }
            }
          }
        }
      }

      if (query.products) {
        filter.NOT.products = {
          none: {}
        }
      }

      if (query.reports == "revised") {
        filter.reports = {
          every: {
            revised: true
          }
        }
      }

      this.chains.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        where: {
          ...filter,

        },
        include: {
          branches: query.branches ? {
            skip: +query.bstart || 0,
            take: +query.bend || 10,
            select: {
              id: true,
              displayName: true,
              address: true,
              coverages: {
                select: {
                  clientId: true
                }
              }
            }
          } : false,
          products: {
            select: {
              product: {
                select: {
                  id: true,
                  category: {
                    select: {
                      id: true,
                      name: true
                    }
                  },
                  name: true,
                  type: true,
                }
              }
            }
          },
          reports: query.reports ? {
            select: {
              id: true
            }
          } : false
        }
      }).then((result) => {
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron sucursales." });
        return resolve({ code: 200, chains: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las sucursales." })
      })
    })
  }


}

module.exports = ChainsController;
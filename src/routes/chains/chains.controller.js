const { prisma } = require("../../db/prisma.client");


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
        if (!result) return reject({ code: 200, message: "No se encontró la cadena" })
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
        if (!result) return reject({ code: 200, message: "No se encontró la cadena" })
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
        NOT: {},
        AND: {}
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

      if (query.reports == "only") {
        filter.NOT.reports = {
          none: {}
        }
      } else if (query.reports == "revised") {
        filter.reports = {
          every: {
            revised: true
          }
        }
      }

      if (query.format) {
        filter.format = {
          name: {
            equals: query.format
          }
        }
      }

      if (query.products == "only") {
        filter.AND = {
          NOT: {
            products: {
              none: {}
            }
          }
        }
      }


      this.chains.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: query.start,
        take: query.end,
        where: filter,
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
            }
          } : false,
          reports: query.reports ? {
            select: {
              id: true
            }
          } : false
        }
      }).then(async (result) => {
        const maxCount = await this.chains.count({
          where: filter
        });

        return resolve({ code: 200, message: result.length == 0 ? "No se encontraron cadenas." : "Cadenas encontradas con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, chains: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las sucursales." })
      })
    })
  }


}

module.exports = ChainsController;
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
        return resolve({ code: 201, message: "Sucursal creada con éxito!", chain: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear la sucursal" })
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
              category: {
                select: {
                  name: true,
                  id: true
                },
              },
              name: true
            },
          } : false,
          reports: query.reports ? {
            select: {
              id: true
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la sucursal" })
        return resolve({ code: 200, message: "Se actualizó la sucursal con éxito", chain: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la sucursal" })
      })
    })
  }

  async getChain({ search, query }) {
    return new Promise((resolve, reject) => {

      this.chains.findUnique({
        where: {
          id: search
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
              category: {
                select: {
                  name: true,
                  id: true
                },
              },
              name: true
            },
          } : false,
          reports: query.reports ? {
            select: {
              id: true
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la sucursal" })
        return resolve({ code: 200, message: "Sucursal encontrada con éxito.", chain: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la sucursal" })
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
        return resolve({ code: 200, message: "Se elimino la sucursal con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar la sucursal" })
      })
    })
  }

  async getChains({ query }) {
    return new Promise((resolve, reject) => {

      let filter = {};

      if (query.byclient) {
        filter.branches = {
          every: {
            coverages: {
              every: {
                clientId: {
                  equals: query.byclient
                }
              }
            }
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
          ...filter
        },
        include: {
          branches: query.branches ? {
            skip: +query.bstart  || 0,
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
              category: {
                select: {
                  name: true,
                  id: true
                },
              },
              name: true
            },
          } : false,
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

  async getBranches({ chain, query }) {
    let filter = {}

    if (query.client) {
      filter.coverages = {
        every: {
          clientId: {
            equals: query.clientId
          }
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.branches.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        where: {
          chainId: {
            equals: chain
          }
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        select: {
          name: true,
          displayName: true,
          locality: true,
          id: true
        }
      }).then((result) => {
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron sucursales." });
        return resolve({ code: 200, branches: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las sucursales." })
      })
    })
  }

}

module.exports = ChainsController;
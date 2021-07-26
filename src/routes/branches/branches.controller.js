const { prisma } = require("../../..");


class BranchesController {
  constructor() {
    this.branches = prisma.branch;
  }

  async createBranch({ name, locality, address, zone, chain, displayname }) {
    return new Promise(async (resolve, reject) => {
      this.branches.create({
        data: {
          name,
          locality,
          address,
          displayName: displayname,
          chain: {
            connect: {
              id: chain
            }
          },
          zone: {
            connect: {
              id: zone
            }
          }
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Sucursal creado con éxito!", branch: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear la cadena" })
      })
    })
  }

  async updateBranch({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.branches.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          locality: data.locality,
          address: data.address,
          displayName: data.displayname,
          chainId: data.chain,
          zoneId: data.zone
        },
        include: {
          chain: query.chain ?? false,
          coverages: query.coverages ? {
            include: {
              client: {
                select: {
                  id: true,
                  displayName: true,
                  cuit: true
                }
              },
              branch: {
                select: {
                  id: true,
                  displayName: true,
                  address: true,
                }
              }
            }
          } : false,
          reports: query.reports ?? false,
          zone: query.zone ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la sucursal." });
        return resolve({ code: 200, message: "Se actualizó la sucursal con éxito", branch: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la sucursal" })
      })
    })
  }

  async getBranch({ search, query }) {
    return new Promise((resolve, reject) => {

      this.branches.findUnique({
        where: {
          id: search
        },
        include: {
          chain: query.chain ?? false,
          coverages: query.coverages ? {
            include: {
              client: {
                select: {
                  id: true,
                  displayName: true,
                  cuit: true
                }
              },
              branch: {
                select: {
                  id: true,
                  displayName: true,
                  address: true,
                }
              }
            }
          } : false,
          reports: query.reports ?? false,
          zone: query.zone ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la sucursal" })
        return resolve({ code: 200, message: "Sucursal encontrada con éxito.", sucursal: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la sucursal" })
      })
    })
  }

  async deleteBranch(id) {
    return new Promise((resolve, reject) => {
      this.branches.delete({
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

  async getBranches({ query }) {
    return new Promise((resolve, reject) => {
      this.branches.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: +query.start || 0,
        take: +query.end || 5,
        include: {
          chain: query.chain ?? false,
          coverages: query.coverages ? {
            include: {
              client: {
                select: {
                  id: true,
                  displayName: true,
                  cuit: true
                }
              },
              branch: {
                select: {
                  id: true,
                  displayName: true,
                  address: true,
                }
              }
            }
          } : false,
          reports: query.reports ?? false,
          zone: query.zone ?? false
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

module.exports = BranchesController;
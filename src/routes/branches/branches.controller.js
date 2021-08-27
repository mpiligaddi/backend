const { report_types } = require(".prisma/client");
const { prisma } = require("../../db/prisma.client");


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
      this.branches.upsert({
        where: {
          id: search
        },
        update: {
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
        if (!result) return reject({ code: 200, message: "No se encontró la sucursal." });
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
        if (!result) return reject({ code: 200, message: "No se encontró la sucursal" })
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

    let filter = {
      NOT: { },
      AND: {
        NOT: {
          coverages: query.coverages ? {
            none: { }
          } : { }
        }
      },
    }

    if (query.search) {
      filter.name = {
        contains: query.search,
        mode: 'insensitive'
      };
    }

    if (query.bychain) {
      filter.chain = {
        id: {
          equals: query.bychain
        }
      }
    }

    if (query.byclient) {
      filter.coverages = {
        some: {
          clientId: {
            equals: query.byclient
          }
        }
      }
    }

    if (query.reports == "only") {
      filter.NOT.reports = {
        none: { },
      }
    } else if (query.reports == "revised") {
      filter.NOT.reports = {
        none: { },
        some: {
          revised: {
            not: false
          }
        }
      }
    }

    if (query.byzone) {
      filter.zone = {
        name: query.byzone
      }
    }

    if (query.reportstype) {
      filter.reportTypes = {
        has: report_types[query.reportstype]
      }
      if (query.reports != undefined) {
        filter.reports = {
          some: {
            type: report_types[query.reportstype] ?? report_types.photographic,
            categories: (query.reportstype && query.reportstype == report_types.photographic) ? {
              some: {
                photos: {
                  some: {
                    delete: query.reportsdeleted || false
                  }
                }
              }
            } : undefined
          }
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.branches.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        where: filter,
        skip: query.start,
        take: query.end,
        include: {
          chain: query.chain ?? false,
          coverages: query.coverages ? {
            where: {
              clientId: {
                equals: query.byclient
              }
            },
            include: {
              client: {
                select: {
                  id: true,
                  displayName: true,
                  cuit: true
                }
              },
            }
          } : false,
          reports: query.reports ? {
            where: {
              type: report_types[query.reportstype],
              categories: (query.reportstype && query.reportstype == report_types.photographic) ? {
                some: {
                  photos: {
                    some: {
                      delete: query.reportsdeleted || false
                    }
                  }
                }
              } : undefined
            }
          } : false,
          zone: query.zone ?? false
        }
      }).then(async (result) => {
        const maxCount = await this.branches.count({ where: filter });
        return resolve({ code: 200, message: result.length == 0 ? "No se encontraron sucursales." : "Sucursales encontradas con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, branches: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las sucursales." })
      })
    })
  }

}

module.exports = BranchesController;
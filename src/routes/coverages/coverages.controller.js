const { prisma } = require("../../db/prisma.client");

class CoveragesController {
  constructor() {
    this.coverages = prisma.coverage;
  }

  async createCoverage({ branch, client, intensity, frecuency }) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.coverages.create({
          data: {
            branch: {
              connect: {
                id: branch
              }
            },
            client: {
              connect: {
                id: client
              }
            },
            frecuency: frecuency,
            intensity: intensity,
          }
        })
        return resolve({ code: 201, message: "Anexo creado con éxito!", coverage: result })
      } catch (error) {
        return reject({ code: 500, message: "Hubo un error al crear el anexo" })
      }
    })
  }

  async updateCoverage({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.coverages.update({
        where: {
          id: search
        },
        data: {
          frecuency: frecuency,
          intensity: intensity,
        },
        include: {
          client: query.client ? {
            select: {
              id: true,
              displayName: true,
              name: true
            }
          } : false,
          branch: query.branch ? {
            select: {
              id: true,
              displayName: true,
              name: true
            }
          } : false,
        }
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró el anexo" })
        return resolve({ code: 200, message: "Se actualizó al anexo con éxito", coverage: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar el anexo" })
      })
    })
  }

  async getCoverage({ search, query }) {
    return new Promise((resolve, reject) => {

      this.coverages.findUnique({
        where: {
          id: search
        },
        include: {
          client: query.client ? {
            select: {
              id: true,
              displayName: true,
              name: true
            }
          } : false,
          branch: query.branch ? {
            select: {
              id: true,
              displayName: true,
              name: true
            }
          } : false,
        }
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró el anexo" })
        return resolve({ code: 200, message: "Anexo encontrado con éxito.", coverage: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar el anexo" })
      })
    })
  }

  async deleteCoverage(id) {
    return new Promise((resolve, reject) => {
      this.coverages.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino el anexo con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar el anexo" })
      })
    })
  }

  async getCoverages({ query }) {
    return new Promise((resolve, reject) => {
      let filters = {};

      if (query.byclient) {
        filter.clientId = {
          equals: query.byclient
        }
      }

      if (query.bybranch) {
        filter.branchId = {
          equals: query.bybranch
        }
      }

      this.coverages.findMany({
        orderBy: {
          frecuency: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        where: filters,
        skip: query.start,
        take: query.end,
        include: {
          client: query.client ? {
            select: {
              id: true,
              displayName: true,
              name: true
            }
          } : false,
          branch: query.branch ? {
            select: {
              id: true,
              displayName: true,
              name: true
            }
          } : false,
        }
      }).then(async (result) => {
        const maxCount = await this.coverages.count({
          where: filters
        });
        return resolve({ code: 200, message: result.length == 0 ? "No se encontraron anexos." : "Anexos encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, coverages: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar los anexos." })
      })
    })
  }

}

module.exports = CoveragesController;
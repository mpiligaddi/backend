const { stock_type, report_types } = require("@prisma/client");
const { prisma } = require("../../..");


class ReportsController {
  constructor() {
    this.reports = prisma.report;
    this.types = prisma.reportType;

    this.imageReport = prisma.imageReport;
    this.pricingReport = prisma.pricingReport;


    this.periodReport = prisma.periodReport;

    this.categoryReport = prisma.categoryReport;


    this.productPerReport = prisma.productPReport;
    this.photoPerReport = prisma.photoReport;

    this.location = prisma.location;

  }

  async createReportType({ name, alias }) {
    return new Promise(async (resolve, reject) => {
      this.types.create({
        data: {
          name,
          alias
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Tipo de reporte creado con éxito!", type: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear el tipo de reporte" })
      })
    })
  }

  async updateReportType({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.types.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          alias: data.alias
        },
        include: {
          periods: query.periods ? {
            select: {
              id: true,
              alias: true,
              name: true,
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró el tipo de reporte" })
        return resolve({ code: 200, message: "Se actualizó el tipo de reporte con éxito", type: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar el tipo de reporte" })
      })
    })
  }

  async getReportType({ search, query }) {
    return new Promise((resolve, reject) => {

      this.types.findUnique({
        where: {
          id: search
        },
        include: {
          periods: query.periods ? {
            select: {
              id: true,
              alias: true,
              name: true,
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró el tipo de reporte" })
        return resolve({ code: 200, message: "Tipo de reporte encontrado con éxito.", type: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar el tipo de reporte" })
      })
    })
  }

  async deleteReportType(id) {
    return new Promise((resolve, reject) => {
      this.types.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino el tipo de reporte con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar el tipo de reporte" })
      })
    })
  }

  async getReportTypes({ query }) {
    return new Promise((resolve, reject) => {
      this.types.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        include: {
          periods: query.periods ? {
            select: {
              id: true,
              alias: true,
              name: true,
            }
          } : false
        }
      }).then((result) => {
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron los tipos de reporte" });
        return resolve({ code: 200, types: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar los tipos de reporte" })
      })
    })
  }

  async createReport(userId, { branchId, clientId, chainId, categories, createAt, isComplete, location, type }) {
    return new Promise((resolve, reject) => {
      this.reports.create({
        data: {
          createAt,
          isComplete,
          type,
          creator: {
            connect: {
              id: userId,
            }
          },
          branch: {
            connect: {
              id: branchId
            }
          },
          client: {
            connect: {
              id: clientId
            }
          },
          chain: {
            connect: {
              id: chainId
            }
          },
          location: {
            create: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          },
          categories: {
            create: categories.map((cat) => {
              let current = {}

              if (type == report_types.photographic) {
                current = {
                  photos: {
                    create: {
                      images: {
                        create: [].map((image) => {
                          return {
                            name: image.name,
                            comment: image.name,
                            type: stock_type[image.type],
                            uri: image.uri,
                          }
                        })
                      }
                    }
                  }
                }
              }

              return {
                category: {
                  connect: {
                    id: cat.category,
                  }
                },
                ...current
              }
            })
          }
        }
      })
        .then((result) => {
          return resolve({ code: 201, message: "Reporte creado con éxito!", report: result })
        }).catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al crear el reporte" })
        })
    })
  }

}

module.exports = ReportsController;
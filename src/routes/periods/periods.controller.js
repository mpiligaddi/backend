const { prisma } = require("../../..");


class PeriodsController {
  constructor() {
    this.periods = prisma.clientPeriodReport;
  }

  async createPeriod({ client, periods }) {
    return new Promise(async (resolve, reject) => {
      this.periods.createMany({
        data: {
          clientId: client,
          periodId: periods
        },
        skipDuplicates: true
      }).then((result) => {
        return resolve({ code: 201, message: "Periodos añadidos con éxito!"})
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear al periodo" })
      })
    })
  }

  async updatePeriod({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.periods.update({
        where: {
          id: search
        },
        data: {
          clientId: data.client,
          periodId: data.period
        },
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
        if (!result) return reject({ code: 404, message: "No se encontró al periodo" })
        return resolve({ code: 200, message: "Se actualizó al periodo con éxito", period: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al periodo" })
      })
    })
  }

  async getPeriod({ search, query }) {
    return new Promise((resolve, reject) => {
      this.periods.findUnique({
        where: {
          id: search
        },
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
        if (!result) return reject({ code: 404, message: "No se encontró al periodo" })
        return resolve({ code: 200, message: "Periodo encontrado con éxito.", period: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al periodo" })
      })
    })
  }

  async deletePeriod(id) {
    return new Promise((resolve, reject) => {
      this.periods.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino al periodo con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar al periodo" })
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

}

module.exports = PeriodsController;
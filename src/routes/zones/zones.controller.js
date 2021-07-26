const { prisma } = require("../../..");


class ZonesController {
  constructor() {
    this.zones = prisma.zone;
  }

  async createZone({ name, region, supervisor }) {
    return new Promise(async (resolve, reject) => {
      this.zones.create({
        data: {
          name,
          region,
          supervisor: {
            connect: {
              id: supervisor
            }
          }
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Zona creada con éxito!", zone: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear la zona" })
      })
    })
  }

  async updateZone({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.zones.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          region: data.region,
          supervisorId: data.supervisor,
        },
        include: {
          branches: query.branches ? {
            select: {
              id: true,
              displayName: true,
              address: true,
              locality: true
            }
          } : false,
          supervisor: query.supervisor ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la zona" })
        return resolve({ code: 200, message: "Se actualizó la zona con éxito", branch: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la zona" })
      })
    })
  }

  async getZone({ search, query }) {
    return new Promise((resolve, reject) => {

      this.zones.findUnique({
        where: {
          id: search
        },
        include: {
          branches: query.branches ? {
            select: {
              id: true,
              displayName: true,
              address: true,
              locality: true
            }
          } : false,
          supervisor: query.supervisor ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró la zona" })
        return resolve({ code: 200, message: "Zona encontrada con éxito.", zone: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la zona" })
      })
    })
  }

  async deleteZone(id) {
    return new Promise((resolve, reject) => {
      this.zones.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino la zona con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar la zona" })
      })
    })
  }

  async getZones({ query }) {
    return new Promise((resolve, reject) => {
      this.zones.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        include: {
          branches: query.branches ? {
            select: {
              id: true,
              displayName: true,
              address: true,
              locality: true
            }
          } : false,
          supervisor: query.supervisor ?? false
        }
      }).then((result) => {
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron las zonas." });
        return resolve({ code: 200, zones: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las zonas." })
      })
    })
  }

}

module.exports = ZonesController;
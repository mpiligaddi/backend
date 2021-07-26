const { prisma } = require("../../..");


class CoordinatorsController {
  constructor() {
    this.coordinator = prisma.coordinator;
  }

  async createCoordinator({ name, email }) {
    return new Promise(async (resolve, reject) => {
      this.coordinator.create({
        data: {
          email,
          name,
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Coordinador creado con éxito!", coordinator: result })
      }).catch((error) => {
        return reject({ code: 500, message: "Hubo un error al crear al coordinador" })
      })
    })
  }

  async updateCoordinator({search, data, query}) {
    return new Promise((resolve, reject) => {
      this.coordinator.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          email: data.email
        },
        include: {
          supervisors: query.supervisors ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al coordinador." });
        return resolve({ code: 200, message: "Se actualizó al coordinador con éxito", coordinator: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al coordinador" })
      })
    })
  }

  async getCoordinator({ search, query }) {
    return new Promise((resolve, reject) => {

      this.coordinator.findUnique({
        where: {
          id: search
        },
        include: {
          supervisors: query.supervisors ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al coordinador." });
        return resolve({ code: 200, message: "Coordinador encontrado con éxito.", coordinador: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al coordinador" })
      })
    })
  }

  async deleteCoordinator(id) {
    return new Promise((resolve, reject) => {
      this.coordinator.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino al coordinador con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "No se pudo eliminar al coordinador" })
      })
    })
  }

  async getCoordinators({ query }) {
    return new Promise((resolve, reject) => {
      this.coordinator.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        where:{
          supervisors: {
            some: {
              id: {
                equals: query.supervisor
              }
            }
          }
        },
        include: {
          supervisors: query.supervisors ?? false
        }
      }).then((result) => {
        if (!result || result.length == 0) return reject({ code: 404, message: "No se encontraron coordinadores." });
        return resolve({ code: 200, coordinadors: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar indexar los coordinadores." })
      })
    })
  }

}

module.exports = CoordinatorsController;
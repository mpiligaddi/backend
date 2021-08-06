const { prisma } = require("../../..");


class SupervisorsController {
  constructor() {
    this.supervisors = prisma.supervisor;
  }

  async createSupervisor({ name, email, coordinator }) {
    return new Promise(async (resolve, reject) => {
      this.supervisors.create({
        data: {
          email,
          name,
          coordinator: {
            connect: {
              id: coordinator
            }
          }
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Supervisor creado con éxito!", supervisor: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear al supervisor" })
      })
    })
  }

  async updateSupervisor({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.supervisors.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          email: data.email,
          coordinatorId: data.coordinator
        },
        include: {
          coordinator: query.coordinator ?? false,
          users: query.users ? {
            select: {
              name: true,
              email: true,
              id: true
            }
          } : false,
          zones: query.zones ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al supervisor" })
        return resolve({ code: 200, message: "Se actualizó al supervisor con éxito", supervisor: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al supervisor" })
      })
    })
  }

  async getSupervisor({ search, query }) {
    return new Promise((resolve, reject) => {

      this.supervisors.findUnique({
        where: {
          id: search
        },
        include: {
          coordinator: query.coordinator ?? false,
          users: query.users ? {
            select: {
              name: true,
              email: true,
              id: true
            }
          } : false,
          zones: query.zones ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al supervisor" })
        return resolve({ code: 200, message: "Supervisor encontrado con éxito.", supervisor: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al supervisor" })
      })
    })
  }

  async deleteSupervisor(id) {
    return new Promise((resolve, reject) => {
      this.supervisors.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino al supervisor con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar al supervisor" })
      })
    })
  }

  async getSupervisors({ query }) {
    return new Promise((resolve, reject) => {
      this.supervisors.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: query.start,
        take: query.end,
        include: {
          coordinator: query.coordinator ?? false,
          users: query.users ? {
            select: {
              name: true,
              email: true,
              id: true
            }
          } : false,
          zones: query.zones ?? false
        }
      }).then(async (result) => {
        const maxCount = await this.supervisors.count();
        if (result.length == 0) return reject({ code: 404, message: "No se encontraron supervisores.", supervisors: [] });
        return resolve({ code: 200, message: "Supervisores encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, supervisors: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar indexar los supervisores." })
      })
    })
  }

}

module.exports = SupervisorsController;
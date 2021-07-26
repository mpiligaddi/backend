const { prisma } = require("../../..");


class ComercialsController {
  constructor() {
    this.comercials = prisma.comercial;
  }

  async createComercial({ name, email }) {
    return new Promise(async (resolve, reject) => {
      this.comercials.create({
        data: {
          email,
          name,
        }
      }).then((comercial) => {
        return resolve({ code: 201, message: "Comercial creado con éxito!", comercial })
      }).catch((error) => {
        return reject({ code: 500, message: "Hubo un error al crear al comercial" })
      })
    })
  }

  async updateComercial({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.comercials.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
          email: data.email,
        },
        include: {
          clients: query.clients ? {
            select: {
              displayName: true,
              name: true,
              id: true,
              cuit: true
            },
          } : false,
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al comercial." });
        return resolve({ code: 200, message: "Se actualizó al comercial con éxito", comercial: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al comercial" })
      })
    })
  }

  async getComercial({ search, query }) {
    return new Promise((resolve, reject) => {

      this.comercials.findUnique({
        where: {
          id: search
        },
        include: {
          clients: query.clients ? {
            select: {
              displayName: true,
              name: true,
              id: true,
              cuit: true
            },
          } : false,
        }
      }).then((result) => {
        if (!result) return reject({ code: 404, message: "No se encontró al comercial." });
        return resolve({ code: 200, message: "Comercial encontrado con éxito.", comercial: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar al comercial" })
      })
    })
  }

  async deleteComerical(id) {
    return new Promise((resolve, reject) => {
      this.comercials.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino al comercial con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "No se pudo eliminar al comercial" })
      })
    })
  }

  async getComercials({ query }) {
    return new Promise((resolve, reject) => {
      this.comercials.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: +query.start || 0,
        take: +query.end || 10,
        include: {
          clients: query.clients ? {
            select: {
              displayName: true,
              name: true,
              id: true,
              cuit: true
            }
          } : false,
        }
      }).then((result) => {
        if (!result || result.length == 0) return reject({ code: 404, message: "No se encontraron comerciales." });
        return resolve({ code: 200, comercials: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar indexar los comerciales." })
      })
    })
  }

}

module.exports = ComercialsController;
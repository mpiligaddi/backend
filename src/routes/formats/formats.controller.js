const { prisma } = require("../../db/prisma.client");

class FormatsController {
  constructor() {
    this.formats = prisma.format;
  }

  async createFormat({ name }) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await this.formats.create({
          data: {
            name
          }
        })
        return resolve({ code: 201, message: "Formato creado con éxito!", format: result })
      } catch (error) {
        return reject({ code: 500, message: "Hubo un error al crear el formato" })
      }
    })
  }

  async updateFormat({ search, name }) {
    return new Promise((resolve, reject) => {
      this.formats.update({
        where: {
          id: search
        },
        data: {
          name
        },
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró el formato" })
        return resolve({ code: 200, message: "Se actualizó el formato con éxito", format: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar el formato" })
      })
    })
  }

  async getFormat({ search, query }) {
    return new Promise((resolve, reject) => {

      this.formats.findUnique({
        where: {
          id: search
        },
        include: {
          chains: query.chains ? {
            select: {
              id: true,
              name: true
            }
          } : false
        }
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró el formato" })
        return resolve({ code: 200, message: "Formato encontrado con éxito.", format: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar el formato" })
      })
    })
  }

  async deleteFormat(id) {
    return new Promise((resolve, reject) => {
      this.formats.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino el formato con éxito" });
      }).catch((error) => {
        return reject({ code: 500, message: "Hubo un error al intentar borrar el formato" })
      })
    })
  }

  async getFormats({ query }) {
    return new Promise((resolve, reject) => {
      let filters = {};
      this.formats.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: query.start,
        take: query.end,
        include: {
          chains: query.chains ? {
            select: {
              id: true,
              name: true
            }
          } : false
        }
      }).then(async (result) => {
        const maxCount = await this.formats.count({
          where: filters
        });
        return resolve({ code: 200, message: result.length == 0 ? "No se encontraron formatos." : "Formatos encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, formats: result });
      }).catch((error) => {
        return reject({ code: 500, message: "Hubo un error al intentar buscar los formatos." })
      })
    })
  }

}

module.exports = FormatsController;
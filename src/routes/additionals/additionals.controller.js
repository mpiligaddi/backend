const { prisma } = require("../../db/prisma.client");

class AdditionalsController {
  constructor() {
    this.additionals = prisma.additional;
  }

  async createAdditional({ name }) {
    try {
      const result = await this.additionals.create({
        data: {
          name: name,
        }
      })

      return { code: 200, message: "Opción adicional creada con éxito", additional: result }
    } catch (error) {
      throw new Error('Error al crear la opción adicional')
    }
  }

  async getAdditional({ search }) {

    try {
      const result = await this.additionals.findUnique({
        where: {
          id: search
        },
      })
      if (result) return { code: 200, message: "Opción adicional encontrada con éxito.", additional: result };
      return { code: 404, message: "No se encontró la opción adicional" }
    } catch (error) {
      throw new Error('Error al buscar la opción adicional')
    }


  }

  async updateAdditional({ id, name }) {
    try {
      const result = await this.additionals.update({
        where: {
          id: id
        },
        data: {
          name: name
        }
      })
      if (result) return { code: 200, message: "Opción adicional actualizada con éxito.", additional: result };
      return { code: 404, message: "No se encontró la opción adicional" }
    } catch (error) {
      throw new Error('Error al actualizar la opción adicional')
    }


  }

  async getAdditionals({ query }) {

    try {
      const result = await this.additionals.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: query.start,
        take: query.end,
      });

      const maxCount = await this.additionals.count();
      return { code: 200, message: result.length == 0 ? "No se encontraron opciones adicionales." : "Opciones adicionales encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, additionals: result };
    } catch (error) {
      throw new Error('Error al buscar opciones adicionales')
    }

  }


}

module.exports = AdditionalsController;
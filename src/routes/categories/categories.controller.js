const { prisma } = require("../../db/prisma.client");


class CategoriesController {
  constructor() {
    this.categories = prisma.category;
  }

  async createCategory({ name }) {
    return new Promise(async (resolve, reject) => {
      this.categories.create({
        data: {
          name
        }
      }).then((result) => {
        return resolve({ code: 201, message: "Categoria creada con éxito!", category: result })
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al crear la categoria" })
      })
    })
  }

  async updateCategory({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.categories.update({
        where: {
          id: search
        },
        data: {
          name: data.name,
        },
        include: {
          clients: query.clients ? {
            select: {
              client: {
                select: {
                  displayName: true,
                  name: true,
                  id: true,
                  cuit: true
                }
              }
            }
          } : false,
          products: query.products ?? false,
          reports: query.reports ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró la categoria" })
        return resolve({ code: 200, message: "Se actualizó la categoria con éxito", category: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la categoria" })
      })
    })
  }

  async getCategory({ search, query }) {
    return new Promise((resolve, reject) => {

      this.categories.findUnique({
        where: {
          id: search
        },
        include: {
          clients: query.clients ? {
            select: {
              client: {
                select: {
                  displayName: true,
                  name: true,
                  id: true,
                  cuit: true
                }
              }
            }
          } : false,
          products: query.products ?? false,
          reports: query.reports ?? false
        }
      }).then((result) => {
        if (!result) return reject({ code: 200, message: "No se encontró la categoria" })
        return resolve({ code: 200, message: "Categoria encontrada con éxito.", category: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar la categoria" })
      })
    })
  }

  async deleteCategory(id) {
    return new Promise((resolve, reject) => {
      this.categories.delete({
        where: {
          id: id
        }
      }).then((result) => {
        return resolve({ code: 200, message: "Se elimino la categoria con éxito" });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar borrar la categoria" })
      })
    })
  }

  async getCategories({ query }) {
    return new Promise((resolve, reject) => {
      let filters = {};

      if (query.byclient) {
        filters.clients = {
          every: {
            clientId: query.byclient
          }
        }
      }

      this.categories.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        where: filters,
        skip: query.start,
        take: query.end,
        include: {
          clients: query.clients ? {
            select: {
              client: {
                select: {
                  displayName: true,
                  name: true,
                  id: true,
                  cuit: true
                }
              }
            }
          } : false,
          products: query.products ?? false,
          reports: query.reports ?? false
        }
      }).then(async (result) => {
        const maxCount = await this.categories.count({
          where: filters
        });
        if (result.length == 0) return reject({ code: 200, message: "No se encontraron categorias.", categories: [] });
        return resolve({ code: 200, message: "Categorias encontradas con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, categories: result });
      }).catch((error) => {
        console.log(error);
        return reject({ code: 500, message: "Hubo un error al intentar buscar las categorias." })
      })
    })
  }

}

module.exports = CategoriesController;
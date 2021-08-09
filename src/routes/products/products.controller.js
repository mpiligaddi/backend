const { stock_type } = require("@prisma/client");
const { prisma } = require("../../db/prisma.client");


class ProductsController {
  constructor() {
    this.products = prisma.product;
  }

  async createProduct({ chain, client, category, name, type }) {
    return new Promise(async (resolve, reject) => {
      const result = await this.products.create({
        data: {
          chains: {
            connect: {
              id: chain
            }
          },
          clients: {
            connect: {
              id: client
            }
          },
          name: name,
          category: {
            connect: {
              id: category
            }
          },
          type: stock_type[type] ?? stock_type.primary
        },
        select: {
          category: {
            select: {
              name: true,
              id: true
            }
          },
          id: true,
          name: true,
          type: true
        }
      })
      if (result)
        return resolve({ code: 201, message: "Producto creado con éxito!", product: result.product })
      return reject({ code: 500, message: "Hubo un error al crear el producto" })
    })
  }

  async getProducts({ query }) {
    return new Promise(async (resolve, reject) => {

      const filters = {
        chains: {
          some: {

          }
        }
      };

      if (query.byclient) {
        filters.chains.some.clientId = {
          equals: query.byclient
        }
      }

      if (query.bychain) {
        filters.chains.some.chainId = {
          equals: query.bychain
        }
      }

      if (query.bycategory) {
        filters.categoryId = {
          equals: query.bycategory
        }
      }

      if (query.bytype) {
        filters.type = {
          equals: stock_type[query.bytype] ?? undefined
        }
      }

      const result = await this.products.findMany({
        where: filters,
        skip: query.start,
        take: query.end,
        select: {
          id: true,
          name: true,
          type: true,
          clients: query.clients ? {
            select: {
              client: {
                select: {
                  id: true,
                  name: true,
                  displayName: true
                }
              }
            }
          } : false,
          chains: query.chains ? {
            select: {
              chain: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          } : false,
          category: query.category ? {
            select: {
              id: true,
              name: true
            }
          } : false,
        }
      })
      if (result) {
        const maxCount = await this.products.count({
          where: filters
        });

        return resolve({ code: 200, message: result.length == 0 ? "No se encontraron productos." : "Productos encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, products: result });
      }
      return reject({ code: 500, message: "Hubo un error al intentar buscar los productos." })
    })
  }

  async getProduct({ search, query }) {
    return new Promise(async (resolve, reject) => {
      const result = await this.products.findUnique({
        where: {
          id: search
        },
        select: {
          category: query.category ? {
            select: {
              name: true,
              id: true
            }
          } : false,
          id: true,
          name: true,
          type: true,
          chains: query.chains ? {
            select: {
              chain: {
                select: {
                  id: true,
                  name: true,
                  format: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          } : false,
          clients: query.clients ? {
            select: {
              client: {
                select: {
                  id: true,
                  displayName: true,
                  name: true,
                  cuit: true,
                }
              }
            }
          } : false,
        }
      })

      if (result)
        return resolve({ code: 200, message: "Producto encontrado con éxito", product: result });
      else
        return reject({ code: 500, message: "No se encontro ningún producto" })
    })
  }

  async deleteProduct(id) {
    return new Promise(async (resolve, reject) => {
      let result = await this.products.delete({
        where: {
          id: id
        },
      })
      if (result) {
        return resolve({ code: 200, message: "Producto eliminado con éxito" })
      } else {
        return reject({ code: 500, message: "Error al intentar eliminar el producto" })
      }
    });
  }

  async updateProduct({ id, data }) {
    const result = await this.products.update({
      where: {
        id: id
      },
      data: {
        name: data.name,
        type: data.type,
      }
    })

    if (result)
      return resolve({ code: 200, message: "Producto actualizado con éxito", product: result });
    else
      return reject({ code: 500, message: "No se encontro ningún producto" })

  }

}

module.exports = ProductsController;
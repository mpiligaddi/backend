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
              id: chain,
            },
          },
          clients: {
            connect: {
              id: client,
            },
          },
          name: name,
          category: {
            connect: {
              id: category,
            },
          },
          type: stock_type[type] ?? stock_type.primary,
        },
        select: {
          category: {
            select: {
              name: true,
              id: true,
            },
          },
          sku: true,
          id: true,
          name: true,
          type: true,
        },
      });
      if (result) return resolve({ code: 201, message: "Producto creado con éxito!", product: result.product });
      return reject({ code: 500, message: "Hubo un error al crear el producto" });
    });
  }

  async getProducts({ query }) {
    return new Promise(async (resolve, reject) => {
      const filters = {
        chains: {
          some: {},
        },
      };

      if (query.byclient) {
        filters.chains.some.clientId = {
          equals: query.byclient,
        };
      }

      if (query.bychain) {
        filters.chains.some.chainId = {
          equals: query.bychain,
        };
      }

      if (query.bycategory) {
        filters.categoryId = {
          equals: query.bycategory,
        };
      }

      if (query.bytype) {
        filters.type = {
          equals: stock_type[query.bytype] ?? undefined,
        };
      }

      const result = await this.products.findMany({
        where: filters,
        skip: query.start,
        take: query.end,
        select: {
          id: true,
          name: true,
          type: true,
          sku: true,
          secondarys: query.secondarys ? {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          } : false,
          clients: query.clients
            ? {
              select: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
              },
            }
            : false,
          chains: query.chains
            ? {
              select: {
                chain: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            }
            : false,
          category: query.category
            ? {
              select: {
                id: true,
                name: true,
              },
            }
            : false,
        },
      });
      if (result) {
        const maxCount = await this.products.count({
          where: filters,
        });

        return resolve({
          code: 200,
          message: result.length == 0 ? "No se encontraron productos." : "Productos encontrados con éxito",
          total: maxCount,
          hasMore: (query.start || 0) + (query.end || maxCount) < maxCount,
          products: result,
        });
      }
      return reject({ code: 500, message: "Hubo un error al intentar buscar los productos." });
    });
  }

  async getProduct({ search, query }) {
    return new Promise(async (resolve, reject) => {
      const result = await this.products.findUnique({
        where: {
          id: search,
        },
        select: {
          category: query.category
            ? {
              select: {
                name: true,
                id: true,
              },
            }
            : false,
          id: true,
          name: true,
          type: true,
          sku: true,
          secondarys: query.secondarys ? {
            select: {
              id: true,
              name: true,
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          } : false,
          chains: query.chains
            ? {
              select: {
                chain: {
                  select: {
                    id: true,
                    name: true,
                    format: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            }
            : false,
          clients: query.clients
            ? {
              select: {
                client: {
                  select: {
                    id: true,
                    displayName: true,
                    name: true,
                    cuit: true,
                  },
                },
              },
            }
            : false,
        },
      });

      if (result) return resolve({ code: 200, message: "Producto encontrado con éxito", product: result });
      else return reject({ code: 500, message: "No se encontro ningún producto" });
    });
  }

  async deleteProduct(id, chainId) {
    return new Promise(async (resolve, reject) => {
      let result = await this.products.update({
        where: {
          id,
        },
        data: {
          chains: {
            disconnect: {
              id: chainId,
            },
          },
        },
      });
      if (result) {
        return resolve({ code: 200, message: "Producto eliminado de la cadena con éxito" });
      } else {
        return reject({ code: 500, message: "Error al intentar eliminar el producto" });
      }
    });
  }

  async updateProduct({ id, data }) {
    const result = await this.products.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        type: data.type,
        sku: data.sku,
      },
    });

    if (result) return resolve({ code: 200, message: "Producto actualizado con éxito", product: result });
    else return reject({ code: 500, message: "No se encontro ningún producto" });
  }

  async getProductsChains(req, res) {
    try {
      const products = await prisma.productChain.findMany({
        include: {
          product: {
            select: {
              name: true,
              category: {
                select: {
                  id: true,
                },
              },
              secondarys: req.query.secondarys
            },
          },
        },
      });

      const total = await prisma.productChain.count();

      res.status(200).json({ code: 200, total, products });
    } catch (err) {
      console.log(err);
      res.status(500).json({ code: 500, message: "Error al obtener los productos" });
    }
  }

  async updateProductChain(req, res) {
    const { chainId, name, categoryId } = req.body;

    try {
      const product = await prisma.productChain.update({
        where: {
          id: req.params.id,
        },
        data: {
          chain: {
            connect: {
              id: chainId,
            },
          },
          product: {
            update: {
              name,
              category: {
                connect: {
                  id: categoryId,
                },
              },
            },
          },
        },
      });

      console.log(product);

      res.status(200).json({ code: 200, product });
    } catch (err) {
      console.log(err);
      res.status(500).json({ code: 500, message: "Error al actualizar el producto" });
    }
  }

  async deleteProductChain(req, res) {
    try {
      const product = await prisma.productChain.delete({
        where: {
          id: req.params.id,
        },
      });

      res.status(200).json({ code: 200, product });
    } catch (err) {
      res.status(500).json({ code: 500, message: "Error al borrar el producto" });
    }
  }

  async createProductChain(req, res) {
    const { name, chainId, categoryId } = req.body;

    try {
      const product = await prisma.productChain.create({
        data: {
          chain: {
            connect: {
              id: chainId,
            },
          },
          product: {
            create: {
              name,
              category: {
                connect: {
                  id: categoryId,
                },
              },
            },
          },
        },
      });

      res.status(200).json({ code: 200, product });
    } catch (err) {
      res.status(500).json({ code: 500, message: "Error al borrar el producto" });
    }
  }
}

module.exports = ProductsController;

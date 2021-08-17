
const { prisma } = require("../../db/prisma.client");

class ProductsController {
  constructor() {
    this.products = prisma.product;
  }

  async createProduct({ chain, client, category, name }) {
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
          }
        },
        select: {
          category: {
            select: {
              name: true,
              id: true,
            },
          },
          id: true,
          name: true
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

      const result = await this.products.findMany({
        where: filters,
        skip: query.start,
        take: query.end,
        select: {
          id: true,
          name: true,
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

  async createSecondaryProduct(req, res) {
    let { category, name, primary } = req.body;
    try {
      const result = await prisma.productSecondary.create({
        data: {
          name: name,
          Product: {
            connect: {
              id: primary
            }
          },
          category: {
            connect: {
              id: category
            }
          }
        }
      });
      return res.status(201).send({ code: 201, product: result });
    } catch (error) {
      res.status(500).send({ code: 500, message: "Error al crear el producto secundario" });
    }
  }

  async getSecondarysProducts(req, res) {
    try {
      const products = await prisma.productSecondary.findMany({
        include: {
          Product: req.query.product ? {
            select: {
              id: true,
              name: true,
            }
          } : false,
          category: req.query.category ? {
            select: {
              id: true,
              name: true
            }
          } : false
        },
      });

      const total = await prisma.productSecondary.count();

      res.status(200).json({ code: 200, total, products });
    } catch (err) {
      console.log(err);
      res.status(500).json({ code: 500, message: "Error al obtener los productos" });
    }
  }

  async getSecondaryProduct(req, res) {
    try {
      const product = await prisma.productSecondary.findUnique({
        where: {
          id: req.params.id
        },
        include: {
          Product: req.query.product ? {
            select: {
              id: true,
              name: true,
            }
          } : false,
          category: req.query.category ? {
            select: {
              id: true,
              name: true
            }
          } : false
        },
      });

      res.status(200).json({ code: 200, product });
    } catch (err) {
      console.log(err);
      res.status(500).json({ code: 500, message: "Error al obtener el producto" });
    }
  }

  async updateSecondaryProduct(req, res) {
    let { id, name, category, product } = req.body;

    try {
      const result = await prisma.productSecondary.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          category: category ? {
            connect: {
              id: category
            }
          } : null,
          Product: product ? {
            connect: {
              id: product
            }
          } : false
        },
      });

      res.status(200).json({ code: 200, result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ code: 500, message: "Error al crear producto" });
    }
  }

  async deleteSecondaryProduct(req, res) {
    try {
      const product = await prisma.productSecondary.delete({
        where: {
          id: req.params.id,
        },
      });

      res.status(200).json({ code: 200, product });
    } catch (err) {
      res.status(500).json({ code: 500, message: "Error al borrar el producto" });
    }
  }

}

module.exports = ProductsController;

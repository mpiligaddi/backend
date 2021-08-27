const { report_types } = require(".prisma/client");
const { prisma } = require("../../db/prisma.client");

class ChainsController {
  constructor() {
    this.chains = prisma.chain;
    this.branches = prisma.branch;
  }

  async createChain({ name, format }) {
    return new Promise(async (resolve, reject) => {
      this.chains
        .create({
          data: {
            name,
            format: {
              connect: {
                id: format,
              },
            },
          },
        })
        .then((result) => {
          return resolve({ code: 201, message: "Cadena creada con éxito!", chain: result });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al crear la cadena" });
        });
    });
  }

  async updateChain({ search, data, query }) {
    return new Promise((resolve, reject) => {
      this.chains
        .update({
          where: {
            id: search,
          },
          data: {
            name: data.name,
            format: {
              connect: {
                id: data.id,
              },
            },
          },
          include: {
            branches: query.branches
              ? {
                select: {
                  id: true,
                  displayName: true,
                  address: true,
                  coverages: {
                    select: {
                      clientId: true,
                    },
                  },
                },
              }
              : false,
            products: query.products
              ? {
                select: {
                  product: {
                    select: {
                      id: true,
                      category: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                      name: true,
                      secondarys: query.secondarys
                        ? {
                          select: {
                            id: true,
                            name: true,
                          },
                        }
                        : false,
                    },
                  },
                },
              }
              : false,
            reports: query.reports
              ? {
                select: {
                  id: true,
                },
              }
              : false,
          },
        })
        .then((result) => {
          if (!result) return reject({ code: 200, message: "No se encontró la cadena" });
          return resolve({ code: 200, message: "Se actualizó la cadena con éxito", chain: result });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al intentar buscar la cadena" });
        });
    });
  }

  async getChain({ search, query }) {
    return new Promise((resolve, reject) => {
      this.chains
        .findUnique({
          where: {
            id: search,
          },
          include: {
            branches: query.branches
              ? {
                select: {
                  id: true,
                  displayName: true,
                  address: true,
                  coverages: {
                    select: {
                      clientId: true,
                    },
                  },
                },
              }
              : false,
            products: query.products
              ? {
                select: {
                  product: {
                    select: {
                      id: true,
                      category: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                      name: true,
                      secondarys: query.secondarys
                        ? {
                          select: {
                            id: true,
                            name: true,
                          },
                        }
                        : false,
                    },
                  },
                },
              }
              : false,
            reports: query.reports
              ? {
                select: {
                  id: true,
                },
              }
              : false,
          },
        })
        .then((result) => {
          if (!result) return reject({ code: 200, message: "No se encontró la cadena" });
          return resolve({ code: 200, message: "Cadena encontrada con éxito.", chain: result });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al intentar buscar la cadena" });
        });
    });
  }

  async deleteChain(id) {
    this.chains
      .delete({
        where: {
          id: id,
        },
      })
      .then((result) => {
        return Promise.resolve({ code: 200, message: "Se elimino la cadena con éxito" });
      })
      .catch((error) => {
        console.log(error);
        return Promise.reject({ code: 500, message: "Hubo un error al intentar borrar la cadena" });
      });
  }

  async changeFormat(req, res) {
    try {
      const chain = await prisma.chain.update({
        where: {
          id: req.params.id,
        },
        data: {
          format: {
            connect: {
              id: req.body.format,
            },
          },
        },
      });

      console.log(chain);

      res.status(200).json({ code: 200, chain });
    } catch (err) {
      console.log(err);

      res.status(500).json({ code: 500, message: "Error al cambiar el formato" });
    }
  }

  async getChains({ query }) {
    return new Promise((resolve, reject) => {
      let filter = {
        NOT: { },
        AND: { },
      };

      if (query.search) {
        filter.name = {
          contains: query.search,
          mode: 'insensitive'
        };
      }

      if (query.byclient) {
        filter.branches = {
          some: {
            coverages: {
              some: {
                clientId: {
                  equals: query.byclient,
                },
              },
            },
          },
        };
      }

      if (query.reports) {
        filter.NOT.reports = {
          none: { }
        }
      }

      if (query.byformat) {
        filter.format = {
          name: {
            equals: query.byformat,
          },
        };
      }

      if (query.products == "only") {
        filter.AND = {
          NOT: {
            products: {
              none: { },
            },
          },
        };
      }

      if (query.reports != undefined)
        filter.reports = {
          some: {
            type: report_types[query.reportstype] ?? report_types.photographic,
            categories: {
              some: {
                photos: {
                  some: {
                    delete: query.reportsdeleted || false
                  }
                }
              }
            }
          }
        }

      this.chains.findMany({
        orderBy: {
          name: ["asc", "desc"].find((order) => order == query.orderby) || "asc",
        },
        skip: query.start,
        take: query.end,
        where: filter,
        include: {
          format: query.format,
          branches: query.branches
            ? {
              skip: +query.bstart || 0,
              take: +query.bend || 10,
              select: {
                id: true,
                displayName: true,
                address: true,
                coverages: {
                  select: {
                    clientId: true,
                  },
                },
              },
            }
            : false,
          products: query.products
            ? {
              select: {
                product: {
                  select: {
                    id: true,
                    category: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                    name: true,
                    secondarys: query.secondarys
                      ? {
                        select: {
                          categoryId: true,
                          id: true,
                          name: true,
                        },
                      }
                      : false,
                  },
                },
              },
            }
            : false,
          reports: query.reports
            ? {
              where: {
                type: report_types[query.reportstype],
                categories: {
                  some: {
                    photos: {
                      some: {
                        delete: query.reportsdeleted || false
                      }
                    }
                  }
                }
              },
              select: {
                id: true,
                revised: true,
                type: true
              },
            }
            : false,
        },
      })
        .then(async (result) => {
          const maxCount = await this.chains.count({
            where: filter,
          });

          return resolve({
            code: 200,
            message: result.length == 0 ? "No se encontraron cadenas." : "Cadenas encontradas con éxito",
            total: maxCount,
            hasMore: (query.start || 0) + (query.end || maxCount) < maxCount,
            chains: result,
          });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al intentar buscar las sucursales." });
        });
    });
  }
}

module.exports = ChainsController;

const { stock_type, report_types } = require("@prisma/client");
const { prisma } = require("../../db/prisma.client");

class ReportsController {
  constructor() {
    this.reports = prisma.report;
    this.types = prisma.reportType;

    this.imageReport = prisma.imageReport;
    this.pricingReport = prisma.pricingReport;

    this.periodReport = prisma.periodReport;

    this.categoryReport = prisma.categoryReport;

    this.productPerReport = prisma.productPReport;
    this.photoPerReport = prisma.photoReport;

    this.location = prisma.location;
  }

  async createReport(userId, { branchId, clientId, chainId, categories, createdAt, isComplete, location, type }) {
    return new Promise((resolve, reject) => {
      this.reports
        .create({
          data: {
            createdAt: new Date(createdAt),
            isComplete,
            type,
            creator: {
              connect: {
                id: userId,
              },
            },
            branch: {
              connect: {
                id: branchId,
              },
            },
            client: {
              connect: {
                id: clientId,
              },
            },
            chain: {
              connect: {
                id: chainId,
              },
            },
            location: {
              create: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
            },
            categories: {
              create: categories.map((cat) => {
                let current = { };

                if (type == report_types.photographic) {
                  current = {
                    badCategory: cat.badCategory,
                    withoutStock: cat.withoutStock,
                    photos: {
                      create: cat.images.map((image) => {
                        return {
                          name: image.name,
                          comment: image.comment,
                          type: stock_type[image.type],
                          uri: image.name,
                        };
                      }),
                    },
                  };
                } else if (type == report_types.breakeven) {
                  current = {
                    breakevens: {
                      create: cat.breakevens.map((breakeven) => {
                        return {
                          product: {
                            connect: {
                              id: breakeven.product,
                            },
                          },
                          status: breakeven.status,
                        };
                      }),
                    },
                  };
                } else {
                  current = {
                    pricings: {
                      create: cat.pricings.map((pricing) => {
                        return {
                          product: {
                            connect: {
                              id: pricing.product,
                            },
                          },
                          pricing: pricing.price > 0 ? pricing.price : undefined,
                        };
                      }),
                    },
                  };
                }

                return {
                  category: {
                    connect: {
                      id: cat.category,
                    },
                  },
                  ...current,
                };
              }),
            },
          },
        })
        .then((result) => {
          return resolve({ code: 201, message: "Reporte creado con éxito!", report: result });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al crear el reporte" });
        });
    });
  }

  async getReports({ query }) {
    return new Promise((resolve, reject) => {


      let filter = {
        type: {
          equals: query.type,
        },
        revised: {
          equals: query.revised
        },
        clientId: {
          equals: query.byclient
        },
        branch: {
          zone: {
            region: query.byregion ? {
              equals: query.byregion,
              mode: 'insensitive'
            } : undefined
          }
        },
        categories: (query.reporttype && query.reporttype == report_types.photographic) ? {
          some: {
            photos: {
              some: {
                delete: query.reportsdeleted || false
              }
            }
          }
        } : undefined
      };

      if (query.after) {
        filter.createdAt = {
          gte: new Date(query.after ?? Date.now())
        }
      } else if (query.before) {
        filter.createdAt = {
          lt: new Date(query.before ?? Date.now())
        }
      }

      this.reports
        .findMany({
          where: filter,
          orderBy: {
            createdAt: "desc",
          },
          skip: query.start,
          take: query.end,
          select: {
            id: true,
            type: true,
            revised: true,
            isComplete: true,
            createdAt: true,
            branchId: !query.branch,
            chainId: !query.chain,
            clientId: !query.client,
            creatorId: !query.creator,
            branch: query.branch
              ? {
                select: {
                  zone: true,
                  id: true,
                },
              }
              : false,
            chain: query.chain
              ? {
                select: {
                  format: true,
                  id: true,
                  name: true,
                },
              }
              : false,
            client: query.client
              ? {
                select: {
                  displayName: true,
                  id: true,
                },
              }
              : false,
            categories: query.categories
              ? {
                select: {
                  id: true,
                  badCategory: query.type == "photographic",
                  withoutStock: query.type == "photographic",
                  category: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                  photos: query.type == "photographic"
                    ? {
                      where: {
                        delete: query.reportsdeleted,
                      },
                    }
                    : false,
                  breakevens:
                    query.type == "breakeven"
                      ? {
                        select: {
                          product: true,
                          status: true,
                        },
                      }
                      : false,
                },
              }
              : false,
            creator: query.creator
              ? {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              }
              : false,
            location: {
              select: {
                latitude: true,
                longitude: true,
              },
            },
          },
        })
        .then(async (result) => {
          const maxCount = await this.reports.count({
            where: filter,
          });

          return resolve({
            code: 200,
            message: result.length == 0 ? "No se encontraron reportes." : "Reportes encontradas con éxito",
            total: maxCount,
            hasMore: (query.start || 0) + (query.end || maxCount) < maxCount,
            reports: result,
          });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al intentar buscar los reportes." });
        });
    });
  }

  async getReport({ report, query }) {
    return new Promise((resolve, reject) => {
      this.reports
        .findUnique({
          where: {
            id: report,
          },
          select: {
            id: true,
            type: true,
            revised: true,
            isComplete: true,
            createdAt: true,
            branchId: !query.branch,
            chainId: !query.chain,
            clientId: !query.client,
            creatorId: !query.creator,
            branch: query.branch
              ? {
                select: {
                  address: true,
                  displayName: true,
                  name: true,
                  id: true,
                },
              }
              : false,
            chain: query.chain
              ? {
                select: {
                  format: true,
                  id: true,
                  name: true,
                },
              }
              : false,
            client: query.client
              ? {
                select: {
                  displayName: true,
                  name: true,
                  id: true,
                  cuit: true,
                },
              }
              : false,
            categories: query.categories
              ? {
                select: {
                  badCategory: true,
                  withoutStock: true,
                  category: {
                    select: {
                      name: true,
                      id: true,

                    },
                  },
                  photos: true,
                  breakevens: {
                    select: {
                      product: true,
                      status: true,
                    },
                  },
                },
              }
              : false,
            creator: query.creator
              ? {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              }
              : false,
            location: {
              select: {
                latitude: true,
                longitude: true,
              },
            },
          },
        })
        .then((result) => {
          if (result.length == 0) return reject({ code: 200, message: "No se encontraron reportes." });
          return resolve({ code: 200, reports: result });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al intentar buscar los reportes." });
        });
    });
  }

  async updateReport({ report, data, query }) {
    return new Promise((resolve, reject) => {
      this.reports
        .update({
          where: {
            id: report,
          },
          data: { },
          select: {
            id: true,
            type: true,
            revised: true,
            isComplete: true,
            createdAt: true,
            branchId: !query.branch,
            chainId: !query.chain,
            clientId: !query.client,
            creatorId: !query.creator,
            branch: query.branch
              ? {
                select: {
                  address: true,
                  displayName: true,
                  name: true,
                  id: true,
                },
              }
              : false,
            chain: query.chain
              ? {
                select: {
                  format: true,
                  id: true,
                  name: true,
                },
              }
              : false,
            client: query.client
              ? {
                select: {
                  displayName: true,
                  name: true,
                  id: true,
                  cuit: true,
                },
              }
              : false,
            categories: query.categories
              ? {
                select: {
                  badCategory: query.type == "photographic",
                  withoutStock: query.type == "photographic",
                  category: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                  photos: query.type == "photographic",
                  breakevens:
                    query.type == "breakeven"
                      ? {
                        select: {
                          product: true,
                          status: true,
                        },
                      }
                      : false,
                },
              }
              : false,
            creator: query.creator
              ? {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              }
              : false,
            location: {
              select: {
                latitude: true,
                longitude: true,
              },
            },
          },
        })
        .then((result) => {
          if (!result) return reject({ code: 200, message: "No se encontró el reporte" });
          return resolve({ code: 200, message: "Se actualizó el reporte con éxito", report: result });
        })
        .catch((error) => {
          console.log(error);
          return reject({ code: 500, message: "Hubo un error al intentar buscar el reporte" });
        });
    });
  }

  async favoriteReport({ id, favorite }) {
    return new Promise(async (resolve, reject) => {
      const result = await this.imageReport.update({
        where: {
          id: id,
        },
        data: {
          favorite: favorite,
        },
        select: {
          id: true,
          favorite: true,
          name: true,
        },
      });

      if (result) {
        return resolve({ code: 200, message: "Imagen actualizado con éxito", image: result });
      } else {
        return reject({ code: 500, message: "No se encontro la imagen" });
      }
    });
  }

  async revisedReport({ id, revised }) {
    return new Promise(async (resolve, reject) => {
      const result = await this.reports.update({
        where: {
          id: id,
        },
        data: {
          revised: revised,
        },
        select: {
          id: true,
          revised: true,
        },
      });

      if (result) {
        return resolve({ code: 200, message: "Reporte actualizado con éxito", report: result });
      } else {
        return reject({ code: 500, message: "No se encontro el reporte" });
      }
    });
  }

  async deleteImage({ id, reason, soft }) {
    try {
      const result = await this.imageReport.update({
        where: {
          id: id,
        },
        data: {
          delete: reason.delete,
          deleteReason: reason.reason,
        },
        select: {
          id: true,
          delete: true,
          deleteReason: true,
        },
      });

      if (result)
        return { code: 200, message: "Imagen actualizado con éxito", image: result };
    } catch (error) {
      throw new Error("No se encontro la imagen")
    }
  }

  async deleteReport({ id }) {
    try {
      let result = await this.reports.delete({
        where: {
          id: id
        },
      })
      return { code: 200, message: "Reporte eliminado correctamente" };
    } catch (error) {
      return { code: 400, message: "No se pudo eliminar el reporte" };
    }
  }
}

module.exports = ReportsController;

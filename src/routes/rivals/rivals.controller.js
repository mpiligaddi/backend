const { prisma } = require("../../db/prisma.client");

class RivalsController {
  constructor() {
    this.rivals = prisma.rival;
  }

  async createRival({ name, categories, clients }) {
    try {
      const result = await this.rivals.create({
        data: {
          name: name,
          categories: {
            create: categories.map(cat => {
              return {
                category: {
                  connect: {
                    id: cat
                  }
                }
              }
            })
          },
          clients: {
            create: clients.map(client => {
              return {
                client: {
                  connect: {
                    id: client
                  }
                }
              }
            })
          },
        }
      })

      if (result) return { code: 200, message: "Competidor creado con éxito", rival: result }
    } catch (error) {
      throw new Error('Error al crear al competidor')
    }
  }

  async getRival({ search, query }) {

    try {
      const result = await this.rivals.findUnique({
        where: {
          id: search
        },
        include: {
          categories: query.categories ? {
            select: {
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          } : false,
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
          } : false
        }
      })
      if (result) return { code: 200, message: "Competidor encontrado con éxito.", rival: result };
      return { code: 404, message: "No se encontró al competidor" }
    } catch (error) {
      throw new Error('Error al buscar al competidor')
    }


  }

  async updateRival({ id, name }) {
    try {
      const result = await this.rivals.update({
        where: {
          id: id
        },
        data: {
          name: name
        }
      })
      if (result) return { code: 200, message: "Competidor actualizado con éxito.", rival: result };
      return { code: 404, message: "No se encontró al competidor" }
    } catch (error) {
      throw new Error('Error al actualizar al competidor')
    }


  }

  async getRivals({ query }) {

    const filter = { };

    if (query.byclient) {
      filter.clients = {
        some: {
          clientId: {
            equals: query.byclient
          }
        }
      };
    }

    if (query.bycategory) {
      filter.categories = {
        some: {
          categoryId: {
            equals: query.bycategory
          }
        }
      }
    }

    try {
      const result = await this.rivals.findMany({
        orderBy: {
          name: ['asc', 'desc'].find((order) => order == query.orderby) || 'asc'
        },
        skip: query.start,
        take: query.end,
        include: {
          categories: query.categories ? {
            where: (query.bycategory || query.byclient) ? {
              category: {
                id: {
                  equals: query.bycategory
                },
                clients: {
                  some: {
                    clientId: query.byclient
                  }
                }
              }
            } : { },
            select: {
              category: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          } : false,
          clients: query.clients ? {
            where: query.byclient ? {
              clientId: {
                equals: query.byclient
              }
            } : { },
            select: {
              client: {
                select: {
                  id: true,
                  name: true,
                  displayName: true
                }
              }
            }
          } : false
        }
      });

      const maxCount = await this.rivals.count();
      return { code: 200, message: result.length == 0 ? "No se encontraron competidores." : "Competidores encontrados con éxito", total: maxCount, hasMore: (query.start || 0) + (query.end || maxCount) < maxCount, rivals: result };
    } catch (error) {
      throw new Error('No se encontraron competidores')
    }

  }

  async addClient({ rival, client }) {
    try {
      const result = await this.rivals.update({
        where: {
          id: rival
        },
        data: {
          clients: {
            create: {
              client: {
                connect: {
                  id: client
                }
              }
            }
          }
        },
        include: {
          clients: {
            where: {
              clientId: client
            }
          }
        }
      })
      if (result) return { code: 200, message: "Cliente añadido con éxito al competidor", rival: result }

      return { code: 404, message: "No se encontró al competidor" }
    } catch (error) {
      throw new Error('Error al actualizar al competidor')
    }
  }

  async deleteClient({ rival, client }) {
    try {
      const result = await this.rivals.update({
        where: {
          id: rival
        },
        data: {
          clients: {
            delete: {
              id: client
            }
          }
        },
        include: {
          clients: true
        }
      })

      if (result) return { code: 200, message: "Cliente eliminado con éxito del competidor", rival: result }

      return { code: 404, message: "No se encontró al competidor" }
    } catch (error) {
      throw new Error('Error al actualizar al competidor')
    }
  }

  async addCategory({ rival, category }) {
    try {
      const result = await this.rivals.update({
        where: {
          id: rival
        },
        data: {
          categories: {
            create: {
              category: {
                connect: {
                  id: category
                }
              }
            }
          }
        },
        include: {
          categories: {
            where: {
              categoryId: category
            }
          }
        }
      })

      if (result) return { code: 200, message: "Categoria añadida con éxito al competidor", rival: result }
      return { code: 404, message: "No se encontró al competidor" }
    } catch (error) {
      console.log(error);
      throw new Error('Error al actualizar al competidor')
    }
  }

  async deleteCategory({ rival, category }) {
    try {
      const result = await this.rivals.update({
        where: {
          id: rival
        },
        data: {
          categories: {
            delete: {
              id: category
            }
          }
        },
        include: {
          categories: true
        }
      })

      if (result) return { code: 200, message: "Categoria eliminada con éxito del competidor", rival: result }
      return { code: 404, message: "No se encontró al competidor" }
    } catch (error) {
      throw new Error('Error al actualizar al competidor')
    }
  }
}

module.exports = RivalsController;
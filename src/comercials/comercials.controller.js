const { PrismaClient } = require("@prisma/client");


class ComercialsController {
  /**
   *
   * @param {PrismaClient} prisma
   * @returns
  */
  constructor(prisma) {
    /* this.accounts = db.accounts;
    this.users = db.users; */
    this.prisma = prisma;
    this.comercials = this.prisma.comercial;
  }

  createComercial({ name, email }) {
    return new Promise(async (resolve, reject) => {
      this.comercials.create({
        data: {
          email,
          name,
        },
        include: {
          client: false
        }
      }).then((comercial) => {
        if (comercial) return resolve({ message: "Comercial creado con éxito!", comercial })
        else reject({ message: "No se pudo crear al comercial" })
      })
    })
  }

}

module.exports = ComercialsController;

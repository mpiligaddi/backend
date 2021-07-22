const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt-nodejs");


class AuthController {
  /**
   *
   * @param {PrismaClient} prisma
   * @returns
  */
  constructor(prisma) {
    /* this.accounts = db.accounts;
    this.users = db.users; */
    this.prisma = prisma;
    this.account = prisma.account;
    this.user = prisma.user;
  }

  async tryLogin({ email, password, id }) {
    return new Promise((resolve, reject) => {




      /*
      this.accounts.findOne({ email: email }, (error, _account) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar al usuario, volve a intentar" });
        if (!_account) return reject({ code: 404, message: "No se encontró al usuario" });

        let validPassword = bcrypt.compareSync(password, _account.password);

        if (!validPassword) return reject({ code: 401, message: "La contraseña ingresada es incorrecta, corregila y volve a intentar" });


        const userResult = {
          displayName: _account.displayName,
          email: email,
          role: _account.role,
          id: _account._id,
        };

        return resolve({ code: 201, message: "Sesión creada con éxito", user: userResult });
      }); */
    });
  }

  async registerAccount(model) {
    const { email, password } = model;

    return new Promise((resolve, reject) => {
      const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

      this.account.create({
        data: {
          email: email,
          password: passwordHash,
          user: {
            connectOrCreate: {
              create: {

              }
            }
          }
        }
      })


      /* this.accounts.findOne({ email: email }, (error, _account) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar al usuario, volve a intentar" });
        if (_account) return reject({ code: 404, message: "El correo ya está en uso" });

        const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
        console.log(passwordHash);

        var account = {
          ...model,
          password: passwordHash,
        };

        this.accounts.insertOne(account, (error, _account) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar crear la cuenta, volve a intentar" });
          if (!_account) return reject({ code: 404, message: "No se encontró la cuenta" });

          return resolve({ code: 200, message: "Cuenta creada con éxito!" });
        });
      }); */
    });
  }

  async tryLogout(session) {
    return new Promise((resolve, reject) => {
      session.destroy((err) => {
        if (err) return reject({ code: 500, message: "Hubo un error al desconectarlo de la cuenta" });
        return resolve({ code: 200, message: "Se elimino la sesión actual." });
      })
    })
  }

  async userByToken({ token }) {
    return new Promise((resolve, reject) => {
      this.users.aggregate(
        [
          {
            $match: {
              token: token,
            },
          },
          {
            $lookup: {
              from: "accounts",
              localField: "user",
              foreignField: "_id",
              as: "account",
            },
          },
          {
            $unwind: {
              path: "$account",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $project: {
              _id: 0,
              displayName: "$account.displayName",
              email: "$account.email",
              role: "$account.role",
            },
          },
        ],
        async (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar o crear la sesión, volve a intentar" });
          const account = (await result.toArray())[0];
          if (!account) return reject({ code: 500, message: "No se encontró la sesión" });

          return resolve({ code: 200, message: "Sesión recuperada con éxito", user: account });
        }
      );
    });
  }

  generateToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  }
}

module.exports = AuthController;

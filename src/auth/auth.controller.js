const MongoDB = require("../db/mongo.driver");
const bcrypt = require("bcrypt-nodejs");
const { ObjectId } = require("mongodb");

class AuthController {
  /**
   *
   * @param {MongoDB} db
   */
  constructor(db) {
    this.accounts = db.accounts;
    this.users = db.users;
  }

  async tryLogin({ email, password }) {
    return new Promise((resolve, reject) => {
      this.accounts.findOne({ email: email }, (error, _account) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar al usuario, volve a intentar" });
        if (!_account) return reject({ code: 404, message: "No se encontró al usuario" });

        let validPassword = bcrypt.compareSync(password, _account.password);

        if (!validPassword) return reject({ code: 401, message: "La contraseña ingresada es incorrecta, corregila y volve a intentar" });

        let newToken = this.generateToken();

        this.users.findOneAndUpdate({ user: _account._id }, { $set: { token: newToken, timestamp: Date.now() } }, (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar o crear la sesión, volve a intentar" });

          if (result.value) return resolve({ code: 200, message: "Sesión recuperada con éxito", user: { ...result.value, token: newToken, } });

          const userResult = {
            displayName: _account.displayName,
            email: email,
            role: _account.role,
            id: _account._id,
            timestamp: Date.now(),
            token: newToken,
          };

          this.users.insertOne(
            {
              timestamp: Date.now(),
              user: new ObjectId(_account._id),
              token: newToken,
            },
            (error, _) => {
              if (error) return reject({ code: 500, message: "Hubo un error al intentar crear la sesión, volve a intentar" });
              return resolve({ code: 201, message: "Sesión creada con éxito", user: userResult });
            }
          );
        });
      });
    });
  }

  async authenticateToken({ token, timestamp }) {
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
              id: "$account._id",
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

          this.users.findOneAndUpdate({ token: token }, { $set: { timestamp: timestamp } }, (error, result) => {
            if (error || !result.value) return reject({ code: 500, message: "Hubo un error al intentar buscar o crear la sesión, volve a intentar" });
            if (result.value) return resolve({ code: 200, message: "Sesión recuperada con éxito", user: account });
          });
        }
      );
    });
  }

  async registerAccount(model) {
    const { email, password } = model;

    return new Promise((resolve, reject) => {
      this.accounts.findOne({ email: email }, (error, _account) => {
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
      });
    });
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

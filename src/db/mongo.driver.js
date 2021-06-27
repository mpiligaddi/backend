const { MongoClient, ObjectId } = require("mongodb");
const properties = require("./mongo.properties");
const bcrypt = require("bcrypt-nodejs");

class MongoDB {
  async connect() {
    return new Promise(async (resolve, reject) => {
      var url = `mongodb://${properties.data.user}:${properties.data.pass}@${properties.data.ip}:27017?authSource=admin&retryWrites=true&w=majority`;

      const client = new MongoClient(url, { useUnifiedTopology: true });

      var connection = await client.connect();
      const db = connection.db(properties.data.database);
      let props = properties.collections;

      this.breakevensReports = db.collection(props.reports.breakevens);
      this.pricingssReports = db.collection(props.reports.pricing);
      this.photosReports = db.collection(props.reports.photo);
      this.accounts = db.collection(props.users.accounts);
      this.users = db.collection(props.users.security);
      this.contacts = db.collection(props.users.contacts);
      this.supervisors = db.collection(props.users.supervisors);
      this.categories = db.collection(props.categories);
      this.coverages = db.collection(props.coverages);
      this.products = db.collection(props.products);
      this.branches = db.collection(props.branches);
      this.clients = db.collection(props.clients);
      this.chains = db.collection(props.chains);
      this.zones = db.collection(props.zones);

      resolve(this);
    });
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
          if (result.value) return resolve({ code: 200, message: "Sesión recuperada con éxito", user: result.value });

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
              token: 1,
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
      this.users.findOne({ token: token }, (error, result) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar la sesión, volve a intentar" });
        if (!result) return reject({ code: 403, message: "La sesión no fue encontrada, revisa el token y volve a intentar" });
        return resolve(result);
      });
    });
  }

  async getReport({ filter, type }) {
    return new Promise((resolve, reject) => {
      const collection = this.getReportColl(type);
      if (!collection) return reject({ code: 404, message: "No se encontró ninguna colección para el reporte" });

      if (filter._id) filter._id = new ObjectId(filter._id);

      collection.aggregate().findOne(filter, (error, _report) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar el reporte, volve a intentar" });
        if (!_report) return reject({ code: 404, message: "No se pudo encontrar ningún reporte." });

        return resolve({ code: 200, message: "Reporte encontrado con éxito!", report: _report });
      });
    });
  }

  async getReports({ start, end, filter, type }) {
    return new Promise((resolve, reject) => {
      const collection = this.getReportColl(type);
      if (!collection) return reject({ code: 404, message: "No se encontró ninguna colección para el reporte" });

      var isPaging = `${start}`.length < 10 || `${end}`.length < 10;

      if (!isPaging && this.isDate(start ?? Date.now()) && this.isDate(end ?? Date.now())) {
        var sDate = new Date(start ?? Date.now());
        var eDate = new Date(end ?? Date.now());

        if (sDate - eDate >= 0) return reject({ code: 404, message: "Las fechas ingresadas son incorrectas" });

        filter = {
          ...filter,
          createdAt: {
            $gte: sDate.getTime(),
            $lte: eDate.getTime(),
          },
        };
      }

      let paginationOptions = {
        limit: end ?? 10,
        skip: start ?? 0,
      };

      collection
        .find(filter, isPaging ? paginationOptions : {})
        .toArray()
        .then((reports) => resolve({ code: 200, message: "Reportes obtenidos con éxito", reports: reports }))
        .catch((c) => reject({ code: 500, message: "Hubo un error al buscar reportes." }));
    });
  }

  async createReport(report) {
    const { type, branchId, chainId, clientId, createdAt, createdBy, isComplete, location, categories } = report;
    return new Promise((resolve, reject) => {
      const collection = this.getReportColl(type);

      if (!collection) return reject({ code: 404, message: "No se encontró ninguna colección para el reporte" });

      collection.insertOne(
        {
          branchId: new ObjectId(branchId),
          chainId: new ObjectId(chainId),
          clientId: new ObjectId(clientId),
          createdAt,
          createdBy: new ObjectId(createdBy),
          isComplete,
          location,
          categories: categories.map((category) => ({
            ID: new ObjectId(category.ID),
            ...category,
          })),
        },
        (error, _report) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el reporte, volve a intentar" });
          if (!_report) return reject({ code: 404, message: "No se pudo crear ningún reporte." });

          return resolve({ code: 200, message: "Reporte creado con éxito!", report: _report.insertedId });
        }
      );
    });
  }

  async createBranch(branch) {
    const { chainId, name, address, zoneId, locality, region } = branch;
    return new Promise((resolve, reject) => {
      this.branches.insertOne(
        {
          chainId: new ObjectId(chainId),
          name: name,
          address: address,
          zoneId: new ObjectId(zoneId),
          locality: locality,
          region: region,
        },
        (error, result) => {
          if (error) return reject(ID.hexEncode());
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar la sucursal, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ninguna sucursal." });

          return resolve({ code: 200, message: "Sucursal creada con éxito!", branch: result.insertedId });
        }
      );
    });
  }

  async createChain(chain) {
    const { name, clientId } = chain;
    return new Promise((resolve, reject) => {
      this.chains.insertOne(
        {
          clientId: new ObjectId(clientId),
          name: name,
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar la cadena, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ninguna cadena." });

          return resolve({ code: 200, message: "Cadena creada con éxito!", chain: result.insertedId });
        }
      );
    });
  }

  async createClient(client) {
    const { companyName, name, adminId, comercialId, address, CUIT, contactName, periodReportId, control } = client;
    return new Promise((resolve, reject) => {
      this.branches.insertOne(
        {
          adminId: new ObjectId(adminId),
          comercialId: new ObjectId(comercialId),
          address,
          CUIT,
          contactName,
          periodReportId,
          control,
          companyName,
          name,
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el cliente, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ningún cliente." });

          return resolve({ code: 200, message: "Cliente creado con éxito!", client: result.insertedId });
        }
      );
    });
  }

  async createCategory(category) {
    const { clientId, name } = category;
    return new Promise((resolve, reject) => {
      this.branches.insertOne(
        {
          clientId: new ObjectId(clientId),
          name: name,
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar la categoria, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ninguna categoria." });

          return resolve({ code: 200, message: "Categoria creada con éxito!", category: result.insertedId });
        }
      );
    });
  }

  async createProduct(product) {
    const { catId, chainId, name, type, skuId, primary } = product;
    return new Promise((resolve, reject) => {
      this.branches.insertOne(
        {
          catId: new ObjectId(catId),
          chainId: new ObjectId(chainId),
          type,
          skuId,
          primary,
          name,
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el producto, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ningún producto." });

          return resolve({ code: 200, message: "Producto creado con éxito!", product: result.insertedId });
        }
      );
    });
  }

  async createContact(contact) {
    return new Promise((resolve, reject) => {
      this.contacts.insertOne(contact, (error, result) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el contacto, volve a intentar" });
        if (!result) return reject({ code: 404, message: "No se pudo crear ningún contacto." });

        return resolve({ code: 200, message: "Contacto creado con éxito!", contact: result.insertedId });
      });
    });
  }

  async createSupervisor(supervisor) {
    const { coordinatorId } = supervisor;
    return new Promise((resolve, reject) => {
      this.supervisors.insertOne(
        {
          ...supervisor,
          coordinatorId: new ObjectId(coordinatorId),
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el supervisor, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ningún supervisor." });

          return resolve({ code: 200, message: "Supervisor creado con éxito!", supervisor: result.insertedId });
        }
      );
    });
  }

  async createZone(zone) {
    const { supervisorId } = zone;
    return new Promise((resolve, reject) => {
      console.log(supervisorId);
      this.zones.insertOne(
        {
          ...zone,
          supervisorId: new ObjectId(supervisorId),
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar la zona, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ninguna zona." });

          return resolve({ code: 200, message: "Zona creada con éxito!", zone: result.insertedId });
        }
      );
    });
  }

  isDate(date) {
    return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
  }

  getReportColl(type) {
    switch (type.toLowerCase()) {
      case "breakeven":
        return this.breakevensReports;
      case "pricing":
        return this.pricingssReports;
      case "photo":
        return this.photosReports;
      default:
        return undefined;
    }
  }

  generateToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  }
}

String.prototype.hexEncode = function () {
  var hex, i;

  var result = "";
  for (i = 0; i < this.length; i++) {
    hex = this.charCodeAt(i).toString(24);
    result += ("000" + hex).slice(-4);
  }

  return result;
};

module.exports = MongoDB;

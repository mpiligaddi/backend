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

        this.users.findOneAndUpdate({ email: email }, { $set: { token: newToken, timestamp: Date.now() } }, (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar o crear la sesión, volve a intentar" });
          if (result.value) return resolve({ code: 200, message: "Sesión recuperada con éxito", user: result.value });

          const userResult = {
            username: _account.username,
            name: _account.name,
            lastname: _account.lastname,
            email: email,
            role: _account.role,
            id: _account._id,
            timestamp: Date.now(),
            token: this.generateToken(),
          };

          this.users.insertOne(userResult, (error, _) => {
            if (error) return reject({ code: 500, message: "Hubo un error al intentar crear la sesión, volve a intentar" });
            return resolve({ code: 201, message: "Sesión creada con éxito", user: userResult });
          });
        });
      });
    });
  }

  async authenticateToken({ token, timestamp }) {
    return new Promise((resolve, reject) => {
      this.users.findOneAndUpdate({ token: token }, { $set: { timestamp: timestamp } }, (error, result) => {
        if (error || !result.value) return reject({ code: 500, message: "Hubo un error al intentar buscar o crear la sesión, volve a intentar" });
        if (result.value) return resolve({ code: 200, message: "Sesión recuperada con éxito", user: result.value });
      });
    });
  }

  async registerAccount(model) {
    const { email, password } = model;

    return new Promise((resolve, reject) => {
      this.accounts.findOne({ email: email }, (error, _account) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar buscar al usuario, volve a intentar" });
        if (_account) return reject({ code: 404, message: "El correo ya está en uso" });

        const passwordHash = bcrypt.hash(password, bcrypt.genSaltSync(8));

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

      collection.findOne(filter, (error, _report) => {
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
        var sDate = new Date(start ?? Date.now())
        var eDate = new Date(end ?? Date.now())

        if((sDate - eDate) >= 0) return reject({ code: 404, message: "Las fechas ingresadas son incorrectas" })

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

  async createReport(model) {
    const { type } = model;
    return new Promise((resolve, reject) => {
      const collection = this.getReportColl(type);

      if (!collection) return reject({ code: 404, message: "No se encontró ninguna colección para el reporte" });

      collection.insertOne(model, (error, _report) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el reporte, volve a intentar" });
        if (!_report) return reject({ code: 404, message: "No se pudo crear ningún reporte." });

        return resolve({ code: 200, message: "Reporte creado con éxito!", report: _report.insertedId });
      });
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

module.exports = MongoDB;

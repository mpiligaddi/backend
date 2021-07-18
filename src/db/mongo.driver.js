const { MongoClient, ObjectId } = require("mongodb");
const properties = require("./mongo.properties");
class MongoDB {
  async connect(session) {
    return new Promise((resolve, reject) => {
      var url = `mongodb://${properties.data.user}:${properties.data.pass}@${properties.data.ip}:27017?authSource=admin&retryWrites=true&w=majority`;

      const client = new MongoClient(url, { useUnifiedTopology: true });
      client
        .connect()
        .then((connection) => {
          const db = connection.db(properties.data.database);
          let props = properties.collections;

          this.store = new session({ uri: url, databaseName: properties.data.database, collection: props.users.security })

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
        })
        .catch((error) => reject("Error al conectar a la base de datos."));
    });
  }


  /** Categories */

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

  /** Products */

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

  /** Contacts */

  async createContact(contact) {
    return new Promise((resolve, reject) => {
      this.contacts.insertOne(contact, (error, result) => {
        if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el contacto, volve a intentar" });
        if (!result) return reject({ code: 404, message: "No se pudo crear ningún contacto." });

        return resolve({ code: 200, message: "Contacto creado con éxito!", contact: result.insertedId });
      });
    });
  }

  /** Supervisors */
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

  /** Zone */
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

  /** QUERY */
  clientsQuery(query) {
    return this.clients.aggregate([
      ...this.accountLookup({ local: "adminId", asField: "admin" }),
      {
        $lookup: {
          from: "contacts",
          localField: "comercialId",
          foreignField: "_id",
          as: "comercial",
        },
      },
      {
        $unwind: "$comercial",
      },
      {
        $project: {
          "admin.password": 0,
          "admin._id": 0,
          "admin.uuids": 0,
          "comercial._id": 0,
          "comercial.role": 0,
        },
      },

      ...(query ?? []),
    ]);
  }

  branchesQuery(query) {
    return this.branches.aggregate([
      ...this.chainLookup(),
      ...this.zoneLookup(),
      ...this.clientLookup({ local: "chain.clientId", asField: "chain.client" }),
      {
        $project: {
          chainId: 0,
          zoneId: 0,
          "zone.supervisorId": 0,
          "zone.supervisor.coordinatorId": 0,
          "chain.client.adminId": 0,
          "chain.client.comercialId": 0,
        },
      },
      ...(query ?? []),
    ]);
  }

  reportsQuery(collection, query) {
    return collection.aggregate([
      ...(query ?? []),
      ...this.chainLookup(),
      ...this.clientLookup(),
      ...this.branchLookup(),
      ...this.accountLookup({ local: "createdBy", asField: "creator" }),
      {
        $project: {
          "creator.password": 0,
          "creator.uuids": 0,
          "branch.chainId": 0,
          "branch.zoneId": 0,
          "branch.zone.supervisorId": 0,
          "chain.clientId": 0,
          "client.adminId": 0,
          "client.comercialId": 0,
          "client.CUIT": 0,
          "client.periodReportId": 0,
          "client.control": 0,
          "client.periodReportId": 0,
          branchId: 0,
          chainId: 0,
          clientId: 0,
          createdBy: 0,
        },
      },
    ]);
  }

  chainsQuery(query) {
    return this.chains.aggregate([
      ...(query ?? []),
      ...this.clientLookup(),
      {
        $project: {
          "client._id": 0,
          "client.adminId": 0,
          "client.comercialId": 0,
          "client.CUIT": 0,
          "client.periodReportId": 0,
          "client.control": 0,
          "client.periodReportId": 0,
        }
      }
    ]);
  }

  /** LOOKUPS */

  chainLookup({ local = "chainId", foreign = "_id", asField = "chain" } = {}) {
    return this.easyLookup("chains", local, foreign, asField);
  }

  clientLookup({ local = "clientId", foreign = "_id", asField = "client" } = {}) {
    return this.easyLookup("clients", local, foreign, asField);
  }

  easyLookup(from, local, foreign, asField) {
    return [
      {
        $lookup: {
          from: `${from}`,
          localField: `${local}`,
          foreignField: `${foreign}`,
          as: `${asField}`,
        },
      },
      {
        $unwind: `$${asField}`,
      },
    ];
  }

  pipelineLookup(from, local, foreign, asField) {
    return [
      {
        $lookup: {
          from: `${from}`,
          let: {
            sid: `$${local}`,
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$sid", `$${foreign}`],
                },
              },
            },
          ],
          as: `${asField}`,
        },
      },
      {
        $unwind: `$${asField}`,
      },
    ];
  }

  zoneLookup({ local = "zoneId", foreign = "_id", asField = "zone" } = {}) {
    return this.easyLookup("zones", local, foreign, asField);
  }

  branchLookup({ local = "branchId", foreign = "_id", asField = "branch" } = {}) {
    return [
      ...this.easyLookup("branches", local, foreign, asField),
      ...this.zoneLookup({ local: `${asField}.zoneId`, asField: `${asField}.zone` })
    ];
  }

  accountLookup({ local = "userId", foreign = "_id", asField = "account" } = {}) {
    return this.easyLookup("accounts", local, foreign, asField)
  }

  parseIds(list){
    for (const key in list) {
      if (Object.hasOwnProperty.call(list, key)) {
        const element = list[key];
        if (element.isID()) list[key] = new ObjectId(element)
      }
    }

    return list;
  }
}

String.prototype.isID = function () {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

  return this.length === 12 || (this.length === 24 && checkForHexRegExp.test(this));
};

module.exports = MongoDB;

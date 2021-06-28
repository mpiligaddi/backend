const { MongoClient, ObjectId } = require("mongodb");
const properties = require("./mongo.properties");

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

  /** Chains */

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

  clientsQuery(query) {
    return this.clients.aggregate([
      {
        $lookup: {
          from: "accounts",
          localField: "adminId",
          foreignField: "_id",
          as: "admin",
        },
      },
      {
        $unwind: "$admin",
      },
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
      {
        $lookup: {
          from: "chains",
          localField: "chainId",
          foreignField: "_id",
          as: "chain",
        },
      },
      {
        $unwind: "$chain",
      },
      {
        $lookup: {
          from: "zones",
          localField: "zoneId",
          foreignField: "_id",
          as: "zone",
        },
      },
      {
        $unwind: "$zone",
      },
      {
        $lookup: {
          from: "supervisors",
          let: {
            sid: "$zone.supervisorId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$sid", "$_id"],
                },
              },
            },
          ],
          as: "zone.supervisor",
        },
      },
      {
        $unwind: "$zone.supervisor",
      },
      {
        $lookup: {
          from: "contacts",
          let: {
            sid: "$zone.supervisor.coordinatorId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$sid", "$_id"],
                },
              },
            },
          ],
          as: "zone.supervisor.coordinator",
        },
      },
      {
        $unwind: "$zone.supervisor.coordinator",
      },
      {
        $lookup: {
          from: "clients",
          let: {
            sid: "$chain.clientId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$$sid", "$_id"],
                },
              },
            },
          ],
          as: "chain.client",
        },
      },
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
      {
        $unwind: "$chain.client",
      },
      ...(query ?? []),
    ]);
  }

}

String.prototype.isID = function () {
  var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");

  return this.length === 12 || (this.length === 24 && checkForHexRegExp.test(this));
};

module.exports = MongoDB;

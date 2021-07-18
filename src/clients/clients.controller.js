const { ObjectId } = require("mongodb");
const MongoDB = require("../db/mongo.driver");

class ClientsController {
  /**
   *
   * @param {MongoDB} db
   */
  constructor(db) {
    this.db = db;
    this.clients = db.clients;
  }


  async getClients({ start, end, filter }) {
    return new Promise((resolve, reject) => {

      filter = this.db.parseIds(filter);

      this.db
        .clientsQuery([
          {
            $match: filter ?? {},
          },
          {
            $skip: start ?? 0,
          },
          {
            $limit: end ?? 10,
          },
        ])
        .toArray()
        .then((result) => {
          if (!result || result.length == 0) return reject({ code: 404, message: "No se encontraron clientes." });
          return resolve({ code: 200, message: `Se encontraron ${result.length} cliente(s)`, clients: result });
        })
        .catch((c) => reject({ code: 500, message: "Ocurrió un error al buscar los clientes" }));
    });
  }

  async getClientById({ filter }) {
    return new Promise((resolve, reject) => {

      filter = this.db.parseIds(filter);

      this.db.clientsQuery([
        {
          $match: filter
        },
        {
          $limit: 1
        }
      ]).toArray().then((result) => {
        console.log(result);
        if (!result || result.length == 0) return reject({ code: 404, message: "No se pudo encontrar ningún cliente." });
        return resolve({ code: 200, message: "Cliente encontrado con éxito!", client: result[0] });
      }).catch((c) => reject({ code: 500, message: "Hubo un error al intentar buscar el cliente." }));
    });
  }

  async createClient(client) {
    return new Promise((resolve, reject) => {

      const { companyName, name, adminId, comercialId, address, CUIT, contactName, periodReportId, control } = client;

      if (!adminId.isID() || !comercialId.isID()) reject({ code: 403, message: "Uno de los id's ingresados no es válido" });

      this.clients.insertOne(
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
}

module.exports = ClientsController;

class ChainsController {
  constructor(db) {
    /* this.db = db;
    this.chains = db.chains;
    this.default = ["clientId", "OFC", "OQC", "OPC", "name"];
    this.PRA = ["V", "S", "Q", "M"]; */
  }

  async getChain({ id }) {
    return new Promise((resolve, reject) => {
      if (!id.isID()) reject({ code: 500, message: "El identificador es incorrecto" })
      this.db.chainsQuery([
        {
          $match: {
            "_id": new ObjectId(id)
          }
        },
        {
          $limit: 1
        }
      ]).toArray().then((result) => {
        if (!result || result.length == 0) return reject({ code: 404, message: "No se pudo encontrar ningúna sucursal." });
        return resolve({ code: 200, message: "Sucursal encontrado con éxito!", client: result[0] });
      }).catch((c) => reject({ code: 500, message: "Hubo un error al buscar la sucursal." }));
    })
  }

  async getChains({ start, end, filter }) {
    return new Promise((resolve, reject) => {
      filter = this.db.parseIds(filter ?? {});

      this.db
        .chainsQuery([
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
          if (!result || result.length == 0) return reject({ code: 404, message: "No se encontraron sucursales." });
          return resolve({ code: 200, message: `Sucursales encontradas con éxito`, chains: result });
        })
        .catch((c) => reject({ code: 500, message: "Ocurrió un error al buscar las sucursales" }));
    });
  }

  async updateChain(model) {
    return new Promise((resolve, reject) => {

      if (!model.id.isID()) return reject({ code: 500, message: "El identificador no es válido" })

      let id = model.id;

      if (model.clientId && model.clientId.isID()) model.clientId = new ObjectId(model.clientId)
      else if (model.clientId && !model.clientId.isID()) return reject({ code: 500, message: "El identificador de cliente no es correcto" })

      model = this.justChain(model);

      if(["OFC", "OQC", "OPC"].includes(model)) return reject({ code: 500, message: `El ${model} es incorrecto, proba con algunos de estos ${this.PRA.join(", ")}` })

      this.chains.updateOne({ _id: new ObjectId(id) }, { $set: model }, (err, result) => {
        if (err) return reject({ code: 500, message: "Error al intentar actualizar la sucursal" });
        return resolve({ code: 200, message: "Sucursal actualizada con éxito!" })
      })


    })
  }

  async createChain(chain) {
    return new Promise((resolve, reject) => {
      const { clientId, } = chain;
      if (!clientId.isID()) return reject({ code: 500, message: "El identificador del cliente es incorrecto" })

      chain = this.justChain(chain)

      if(["OFC", "OQC", "OPC"].includes(chain)) return reject({ code: 500, message: `El ${chain} es incorrecto, proba con algunos de estos ${this.PRA.join(", ")}` })

      this.chains.insertOne(
        {
          ...chain,
          clientId: new ObjectId(clientId),
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar la cadena, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ninguna cadena." });

          return resolve({ code: 200, message: "Cadena creada con éxito!", chain: result.insertedId });
        }
      );
    });
  }

  justChain(model) {
    for (const key in model) {
      if (Object.hasOwnProperty.call(model, key)) {
        if (!this.default.includes(key)) delete model[key];
        if (["OFC", "OQC", "OPC"].includes(key) && !this.PRA.includes(model[key])) return key;
      }
    }

    return model;
  }
}

module.exports = ChainsController;

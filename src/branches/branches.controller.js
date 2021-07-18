const { ObjectId } = require("mongodb");
const MongoDB = require("../db/mongo.driver");

class BranchesController {
  /**
   *
   * @param {MongoDB} db
   */
  constructor(db) {
    this.db = db;
    this.branches = db.branches;
  }

  async createBranch(branch) {
    const { chainId, name, address, zoneId, locality } = branch;
    return new Promise((resolve, reject) => {
      if(!chainId.isID() || !zoneId.isID()) return reject({code: 400, message: "Uno de los id's ingresados es inválido"})
      this.branches.insertOne(
        {
          chainId: new ObjectId(chainId),
          name: name,
          address: address,
          zoneId: new ObjectId(zoneId),
          locality: locality,
        },
        (error, result) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar la sucursal, volve a intentar" });
          if (!result) return reject({ code: 404, message: "No se pudo crear ninguna sucursal." });

          return resolve({ code: 200, message: "Sucursal creada con éxito!", branch: result.insertedId });
        }
      );
    });
  }

  async getBranches({ start, end, filter }) {
    return new Promise((resolve, reject) => {
      this.db
        .branchesQuery([
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
          return resolve({ code: 200, message: `Se encontraron ${result.length} sucursar(les)`, branches: result });
        })
        .catch((c) => reject({ code: 500, message: "Ocurrió un error al buscar sucursales." }));
    });
  }
}

module.exports = BranchesController;

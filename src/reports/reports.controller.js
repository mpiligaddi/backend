class ReportsController {

  constructor() {
   /*  this.db = db;
    this.breakevensReports = db.breakevensReports;
    this.pricingssReports = db.pricingssReports;
    this.photosReports = db.photosReports; */
  }

  async getReport({ id, type }) {
    return new Promise((resolve, reject) => {
      const collection = this.getReportColl(type);
      if (!collection) return reject({ code: 404, message: "No se encontró ninguna colección para el reporte" });

      if (!id.isID()) return reject({ code: 403, message: "El id ingresado es inválido" });

      this.db
        .reportsQuery(collection, [
          {
            $match: {
              _id: new ObjectId(id),
            },
          },
          {
            $limit: 1
          }
        ])
        .toArray()
        .then((result) => {
          console.log(result);
          const report = result[0];
          if (!report || !report) return reject({ code: 404, message: "No se pudo encontrar ningún reporte." });
          return resolve({ code: 200, message: "Reporte encontrado con éxito!", report: report });
        })
        .catch((c) => {
          console.log(c);
          reject({ code: 500, message: "Hubo un error al intentar buscar el reporte, volve a intentar" })
        });
    });
  }

  async getReports({ start, end, filter, type }) {
    return new Promise((resolve, reject) => {
      const collection = this.getReportColl(type);

      if (!collection) return reject({ code: 404, message: "No se encontró ninguna colección para el reporte" });

      this.db.reportsQuery(collection, [
        {
          $match: filter ?? {},
        },
        {
          $skip: start ?? 0,
        },
        {
          $limit: end ?? 10,
        },
      ]).toArray().then((reports) => {
        console.log(reports);
        if (!reports || !reports.length > 0) return reject({ code: 404, message: "No se pudo encontrar ningún reporte." });
        return resolve({ code: 200, message: "Reportes obtenidos con éxito!", reports });
      })
        .catch((c) => {
          console.log(c);
          reject({ code: 500, message: "Hubo un error al intentar buscar reportes, volve a intentar" })
        });

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
          categories: (categories ?? {}).map((category) => {
            if (!category.id.isID()) reject({ code: 500, message: `${category.id} no es un identificador correcto` });
            return {
              id: new ObjectId(category.id),
              ...category,
            };
          }),
        },
        (error, _report) => {
          if (error) return reject({ code: 500, message: "Hubo un error al intentar insertar el reporte, volve a intentar" });
          if (!_report) return reject({ code: 404, message: "No se pudo crear ningún reporte." });

          return resolve({ code: 200, message: "Reporte creado con éxito!", report: _report.insertedId });
        }
      );
    });
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
}

module.exports = ReportsController;

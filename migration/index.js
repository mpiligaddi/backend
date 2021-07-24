const { PrismaClient, user_role, stock_type } = require('@prisma/client')
const BACKOFFICE = require("./js/BACKOFFICE.csv.json")
const BRANCHES = require("./js/BRANCHES.csv.json")
const CATEGORIES = require("./js/CATEGORIES.csv.json")
const CHAINS = require("./js/CHAINS.csv.json")
const COMERCIAL = require("./js/COMERCIAL.csv.json")
const CLIENTS = require("./js/CLIENTS.csv.json")
const CONTRATOREPORTS = require("./js/CONTRATOREPORTS.csv.json")
const MERCHANDISER = require("./js/MERCHANDISER.csv.json")
const COORDINATORS = require("./js/COORDINATORS.csv.json")
const PERIODS = require("./js/PERIODS.csv.json")
const SUPERVISORS = require("./js/SUPERVISORS.csv.json")
const REPORTSCLIENTS = require("./js/REPORTSCLIENTS.csv.json")
const ZONES = require("./js/ZONES.csv.json");
const categoriesxclient = require("./js/categoriesxclient.csv.json")
const report_types = require("./js/report_types.json")

const prisma = new PrismaClient()
const bcrypt = require('bcrypt-nodejs');

async function main() {
  await client();

}

async function migrate() {
  await comercials();
  await backoffice();
  await coordinators();
  await supervisors();
  await merch();
  await zones();
  await reportsTypes();
  await chains();
  await branches();
  await category();
}

async function coverages() {
  for (const coverage of CONTRATOREPORTS) {

    const branch = BRANCHES.find((b) => b['ID LOCAL'] == coverage.BOCA);

    const client = CLIENTS.find(c => c.ID == coverage.CLIENTE);

    if (branch == null || client == null) {
      console.log(branch == null ? "NB" : "noc");
      continue;
    };

    const branchDB = await prisma.branch.findFirst({
      where: {
        address: {
          equals: branch.DIRECCION
        }
      }
    })

    const clientDB = await prisma.client.findFirst({
      where: {
        cuit: client.CUIIT
      }
    })

    if (clientDB == null || branchDB == null) {
      console.log(branch == null ? "NdB" : "nodc");
      continue;
    };


    const result = await prisma.coverage.create({
      data: {
        branch: {
          connect: {
            id: branchDB.id
          }
        },
        client: {
          connect: {
            id: clientDB.id
          }
        },
        frecuency: coverage.FRECUENCIASEMANAL,
        intensity: coverage.INTENSIDADXFRECUENCIA
      }
    })
    console.table(result)
  }
}

async function periodReports() {
  for (const period of PERIODS) {
    const result = await prisma.periodReport.create({
      data: {
        alias: period.ID,
        name: period.NOMBRE,
        reportType: {
          connect: {
            alias: period.ID[0]
          }
        }
      },
      include: {
        reportType: true
      }
    })

    console.table(result)
  }
}

async function reportsTypes() {
  const result = await prisma.reportType.createMany({
    data: report_types.map((rt) => {
      return {
        name: rt.nombre,
        alias: rt.id
      }
    })
  })

  console.log(result.count);
}

async function category() {
  const result = await prisma.category.createMany({
    data: CATEGORIES.map((category) => {
      return {
        name: category.NOMBRE
      }
    })
  })

  console.log(result.count)
}

async function client() {
  var errors = [];

  for (const client of CLIENTS) {
    const backoffice = BACKOFFICE.find(b => b.ID == client.BO);
    const comercial = COMERCIAL.find(c => c.ID == client.COMERCIAL);
    const categoriesFromClient = categoriesxclient.filter((cxc) => cxc['ID CLIENTE'] == client.ID).map((cfc) => cfc.NOMBRE);
    const category = CATEGORIES.filter((c) => categoriesFromClient.includes(c['ID CAT']));

    const periodOfClient = REPORTSCLIENTS.filter((rc) => rc.CLIENTE == client.ID);

    if (backoffice == null || comercial == null || periodOfClient.length == 0) {
      errors.push({
        id: client.ID,
        value: backoffice == null ? client.BO : periodOfClient.length == 0 ? "0" : client.COMERCIAL
      })

      continue;
    }

    if (client['RAZON SOCIAL'] == null) {
      console.log(client);
      continue;
    }

    try {

      const result = await prisma.client.create({
        data: {
          displayName: client['RAZON SOCIAL'],
          name: client['NOMBRE COMERCIAL'],
          address: client.DIRECCION,
          cuit: client.CUIIT,
          admin: {
            connect: {
              email: backoffice['DIRECCION DE CORREO']
            }
          },
          comercial: {
            connect: {
              email: comercial['DIRECCION DE CORREO']
            }
          },
          categories: {
            create: category.map((cat) => {
              return {
                category: {
                  connect: {
                    name: cat.NOMBRE
                  }
                }
              }
            })
          },
          periods: {
            create: periodOfClient.map((pfc) => {
              return {
                period: {
                  connect: {
                    alias: pfc.REPORTE
                  }
                }
              }
            })
          }
        },
        include: {
          periods: {
            where: {
              id: {
                not: "PEP"
              }
            }
          }
        }
      })
    } catch (error) {
      console.log(client);

      console.log("");
    }
  }

  console.table(errors)
}

async function branches() {
  var errors = [];

  for (const branch of BRANCHES) {

    const chain = CHAINS.find(c => c.ID == branch['ID CADENA']);
    const zone = ZONES.find(z => z.ID == branch.ZONA)

    if (chain == null || zone == null) {
      errors.push({
        id: branch['ID LOCAL'],
        nulled: (chain ?? zone).ID
      })

      continue;
    }

    const chainDB = await prisma.chain.findFirst({
      where: {
        name: {
          equals: chain.NOMBRE
        }
      }
    })

    const zoneDB = await prisma.zone.findFirst({
      where: {
        name: {
          equals: zone.NOMBRE
        }
      }
    })

    if (chainDB == null || zoneDB == null) {
      errors.push({
        id: branch['ID LOCAL'],
        nulled: (chain ?? zone).ID
      })

      continue;
    }

    const result = await prisma.branch.create({
      data: {
        name: `${branch['ID CADENA']}-${branch.DIRECCION}`,
        displayName: branch.NOMBRE,
        address: branch.DIRECCION,
        locality: branch.Localidad,
        zone: {
          connect: {
            id: zoneDB.id
          }
        },
        chain: {
          connect: {
            id: chainDB.id
          }
        }
      }
    })

    console.log(result);
  }
  console.table(errors);
}

async function chains() {
  const result = await prisma.chain.createMany({
    data: CHAINS.map((chain) => {
      return {
        name: chain.NOMBRE
      }
    }),
    skipDuplicates: true
  })

  console.log(result.count);
}

async function zones() {
  var errors = [];
  for (const zone of ZONES) {
    const supervisor = SUPERVISORS.find(s => s.ID == zone['RESPONSABLE ZONA']);

    if (!supervisor) {
      errors.push({
        id: zone.ID,
        sup: zone['RESPONSABLE ZONA']
      })
      continue;
    }

    const result = await prisma.zone.create({
      data: {
        name: zone.NOMBRE,
        region: zone.REGION,
        supervisor: {
          connect: {
            email: supervisor['DIRECCION CORREO']
          }
        }
      }
    })

    console.log(result);
  }


  console.table(errors);
}

async function merch() {
  var errors = [];
  for (const bo of MERCHANDISER) {
    const salt = bcrypt.genSaltSync();
    const supervisor = SUPERVISORS.find(s => s.ID == bo.SUPERVISOR)

    if (!supervisor) {
      errors.push({
        id: bo.ID,
        sup: bo.SUPERVISOR
      })
      continue;
    }
    const result = await prisma.account.create({
      data: {
        password: bcrypt.hashSync(`chek-${(Math.random() * Date.now()).toString(36).replace(/[^a-z]+/g, '').substr(0, 2)}`, salt),
        email: bo.EMAIL,
        user: {
          connectOrCreate: {
            create: {
              email: bo.EMAIL,
              name: bo.NOMBRE,
              role: user_role.merchandiser,
              supervisor: {
                connect: {
                  email: supervisor['DIRECCION CORREO']
                }
              }
            },
            where: {
              email: bo.EMAIL
            }
          },
        },
      },
      include: {
        user: true
      }
    })

    console.log(result);
  }

  console.table(errors);
}

async function supervisors() {
  for (const supervisor of SUPERVISORS) {
    const coord = COORDINATORS.find(c => c.ID == supervisor['COORDINADOR A CARGO'])

    const sv = await prisma.supervisor.create({
      data: {
        email: supervisor['DIRECCION CORREO'],
        name: supervisor.NOMBRE,
        coordinator: {
          connect: {
            email: coord['DIRECCION DE CORREO']
          }
        }
      }
    })

    console.log(sv);
  }
}

async function backoffice() {
  for (const bo of BACKOFFICE) {
    const salt = bcrypt.genSaltSync();
    const result = await prisma.account.create({
      data: {
        password: bcrypt.hashSync(`chek-${bo.ID.toLowerCase()}`, salt),
        email: bo['DIRECCION DE CORREO'],
        user: {
          connectOrCreate: {
            create: {
              email: bo['DIRECCION DE CORREO'],
              name: bo.NOMBRE,
              role: user_role.backoffice
            },
            where: {
              email: bo['DIRECCION DE CORREO']
            }
          },
        },
      },
      include: {
        user: true
      }
    })
    console.log(result);
  }
}

async function comercials() {
  const result = await prisma.comercial.createMany({
    data: COMERCIAL.map((e) => {
      return {
        name: e.NOMBRE,
        email: e['DIRECCION DE CORREO']
      }
    }),
    skipDuplicates: true
  })
  console.log(result.count);
}

async function coordinators() {
  const result = await prisma.coordinator.createMany({
    data: COORDINATORS.map((e) => {
      return {
        name: e.NOMBRE,
        email: e['DIRECCION DE CORREO']
      }
    }),
    skipDuplicates: true
  })
  console.log(result.count);
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

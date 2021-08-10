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
const products = require('./js/SURTIDO PARA PRUEBA SAN IGNACIO NORMALIZADO.csv.json')
const FORMATOS = require("./js/TABLA FORMATO (1).csv.json")

const prisma = new PrismaClient()
const bcrypt = require('bcrypt-nodejs');

String.prototype.capitalize = function () {
  return this.split(" ").map((text) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()).join(" ");
};

async function main() {
  await migrate();

  await prisma.account.create({
    data: {
      email: "clopez@dgroupsa.com.ar",
      password: bcrypt.hashSync("chek-clopez", bcrypt.genSaltSync()),
      user: {
        create: {
          email: "clopez@dgroupsa.com.ar",
          name: "Christian López",
          role: user_role.superadmin,
        }
      }
    }
  })

  await prisma.account.create({
    data: {
      email: "sanignacio@gmail.com",
      password: bcrypt.hashSync("chek-sanignacio", bcrypt.genSaltSync()),
      user: {
        create: {
          email: "sanignacio@gmail.com",
          name: "San Ignacio",
          role: user_role.client,
          clients: {
            connect: {
              cuit: "30-55945309-5"
            }
          }
        }
      }
    }
  })
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
  await periodReports();
  await client();
  await coverages();
  await productsUpload()
}

async function productsUpload() {
  for (const product of products) {

    try {
      const result = await prisma.product.create({
        data: {
          name: product.NOMBRE.capitalize(),
          category: {
            connect: {
              name: CATEGORIES.find((cat) => cat['ID CAT'] == product.CATEGORIA).NOMBRE.capitalize(),
            }
          },
          chains: {
            create: {
              chain: {
                connect: {
                  name: CHAINS.find((chain) => chain.ID == product.CADENA).NOMBRE.capitalize()
                }
              }
            }
          },
          clients: {
            create: {
              client: {
                connect: {
                  cuit: "30-55945309-5"
                }
              }
            }
          },
          type: product.CONDICION == 1 ? stock_type.primary : stock_type.secondary,
        }
      })

      console.log(result.id);

    } catch (error) {
      console.log(error);
      continue;
    }
  }
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
          equals: branch.DIRECCION.capitalize()
        }
      }
    })


    const clientDB = await prisma.client.findFirst({
      where: {
        cuit: client.CUIIT
      }
    })

    if (clientDB == null || branchDB == null) {
      console.log(client['NOMBRE COMERCIAL']);
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
        frecuency: parseInt(coverage.FRECUENCIASEMANAL),
        intensity: parseInt(coverage.INTENSIDADXFRECUENCIA)
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
        name: period.NOMBRE.capitalize(),
        type: {
          connect: {
            alias: period.ID[0]
          }
        }
      }
    })

    console.table(result)
  }
}

async function reportsTypes() {
  const result = await prisma.reportType.createMany({
    data: report_types.map((rt) => {
      return {
        name: rt.nombre.capitalize(),
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
        name: category.NOMBRE.capitalize()
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
          displayName: client['RAZON SOCIAL'].capitalize(),
          name: client['NOMBRE COMERCIAL'].capitalize(),
          address: client.DIRECCION.capitalize(),
          cuit: client.CUIIT,
          admin: {
            connect: {
              email: backoffice['DIRECCION DE CORREO']
            }
          },
          comercial: {
            connect: {
              name: comercial.NOMBRE.capitalize()
            }
          },
          categories: {
            create: category.map((cat) => {
              return {
                category: {
                  connect: {
                    name: cat.NOMBRE.capitalize()
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
      })
    } catch (error) {
      console.log(client);

      console.log(error);
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
          equals: chain.NOMBRE.capitalize()
        }
      }
    })

    const zoneDB = await prisma.zone.findFirst({
      where: {
        name: {
          equals: zone.NOMBRE.capitalize()
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
        name: `${branch.BOCA}`.capitalize(),
        displayName: branch.NOMBRE.capitalize(),
        address: branch.DIRECCION.capitalize(),
        locality: branch.Localidad.capitalize(),
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
  for (const chain of CHAINS) {
    const format = FORMATOS.find((f) => f['CADENA ASOCIADA'] == chain.NOMBRE);

    const result = await prisma.chain.create({
      data: {
        name: chain.NOMBRE.capitalize(),
        format: {
          connectOrCreate: {
            create: {
              name: format.NOMBRE.capitalize()
            },
            where: {
              name: format.NOMBRE.capitalize()
            }
          }
        }
      }
    })
    console.log(result);
  }

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
        name: zone.NOMBRE.capitalize(),
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
        password: bcrypt.hashSync(`chek-repo`, salt),
        email: bo.EMAIL,
        user: {
          connectOrCreate: {
            create: {
              email: bo.EMAIL,
              name: bo.NOMBRE.capitalize(),
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
        name: supervisor.NOMBRE.capitalize(),
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
              name: bo.NOMBRE.capitalize(),
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
        name: e.NOMBRE.capitalize(),
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
        name: e.NOMBRE.capitalize(),
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


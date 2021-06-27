// import zones from '../data/zones'
// import admins from '../data/admins'
// import categories from './categories'
// import chains from '../data/chains'
// import clients from '../data/clients'
// import supervisors from '../data/supervisors'
// import coordinators from '../data/coordinators'
// import comercials from '../data/comercials'
// import coverages from '../data/coverage'
// import merchandisers from '../data/merchandisers'
// //import catxchains from '../data/catxchain'

const MongoDB = require("../src/db/mongo.driver");
const branches = require("./branches/index");
const chains = require("./chains");
const coordinators = require("./coordinators");
const supervisors = require("./supervisors");
const users = require("./users/users");
const zones = require("./zones");

class DataToDB {
  /**
   *
   * @param {MongoDB} db
   */
  constructor(db) {
    this.db = db;
  }

  uploadData() {
    //zones.forEach(e => this.db.createZone(e))
    console.log(zones.length);
  }
}

module.exports = DataToDB;


/**

  { name: "San Juan", region: "San Juan", supervisorId: "RV" },
  { name: "San Luis", region: "San Luis", supervisorId: "RV" },
  { name: "Cordoba", region: "Cordoba", supervisorId: "RV" },
  { name: "Rio Cuarto", region: "Cordoba", supervisorId: "RV" },
  { name: "Villa Maria", region: "Cordoba", supervisorId: "RV" },
  { name: "Mendoza", region: "Mendoza", supervisorId: "RV" },
  { name: " San Rafael", region: "Mendoza", supervisorId: "RV" },
  { name: "Tunuyan", region: "Mendoza", supervisorId: "RV" },
  {
    name: "Villa Mercedes",
    region: "San Luis",
    supervisorId: "RV",
  },
  {
    name: "Santiago Del Estero",
    region: "Santiago Del Estero",
    supervisorId: "RV",
  },
  { name: "Tucuman", region: "Tucuman", supervisorId: "RV" },


 */
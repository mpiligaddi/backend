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

  async uploadData() {
  }
}

module.exports = DataToDB;


/**




 */
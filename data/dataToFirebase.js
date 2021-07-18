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
const chains = require("./chains");
const coordinators = require("./coordinators");
const supervisors = require("./supervisors");
const users = require("./users/users");
const zones = require("./zones");
const con = require("../src/chains/chains.controller");

const dd = require("./branches/dd");
const branches = require("./branches/index");
const parsers = require("./branches/parser");

const bcontroller = require("../src/branches/branches.controller")
class DataToDB {
  /**
   *
   * @param {MongoDB} db
   */
  constructor(db) {
    this.db = db;
  }

  async uploadData() {
    /*for (const iterator of chains) {
      await new con(this.db).createChain(iterator)
      console.log(iterator.name);
    }*/
    let con = new bcontroller(this.db);

    for (const bgit of dd) {

      const obranch = branches.find(e => e.name == bgit.name);

      let mid = parsers.find(e => e.name == bgit.chainName);

      console.log(bgit.chainName, obranch.name);

      obranch.chainId = mid._id.$oid;

      await con.createBranch(obranch);


      console.log(obranch.name);
    }

  }
}

module.exports = DataToDB;


/**




 */
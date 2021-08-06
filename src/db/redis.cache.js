const cache = require('express-redis-cache');

const cacheRedis = cache({
  host: "chek-cache.tbawjh.ng.0001.sae1.cache.amazonaws.com"
})

module.exports = {
  cacheRedis
}
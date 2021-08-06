const cache = require('express-redis-cache');

const cacheRedis = cache({
  client: require('redis').createClient({
    host: 'chek-cache-001.tbawjh.0001.sae1.cache.amazonaws.com'
  })
})

module.exports = {
  cacheRedis
}
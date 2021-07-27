const { RateLimiterPostgres } = require('rate-limiter-flexible');

/**
 *
 * @param {IRateLimiterStoreOptions} opts
 * @returns
 */
async function createRateLimiter(opts) {
  return new Promise((resolve, reject) => {
    let rateLimiter
    const ready = (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(rateLimiter)
      }
    }

    rateLimiter = new RateLimiterPostgres(opts, ready)
  })
}

module.exports = {
  createRateLimiter
}
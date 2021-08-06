const { Pool } = require('pg');

const psql = new Pool({
  host: 'chekdb.cskgaygskqk4.sa-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'chek',
  user: 'emirchus',
  password: 'emineko1',
});

module.exports = psql;
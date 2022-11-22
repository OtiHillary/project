// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  production: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      database: 'cathay',
      user:'postgres',
      port:5432,
      password: 'HillaryOdezy123'
    },
  },
};

const admin_key = "admin123"
const SESSION_KEY = process.env.SESSION_KEY || 'RD1H233B4DW038HXS21CXGXBJX1N1IP4232N2WBX2G3C4DXW4C';
const KNEX_CONFIG = 
(process.env.environment === 'production')?
{}
:
{
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        database: 'cathay',//
        port: 5432,
        user: 'postgres',
        password: 'HillaryOdezy123'
    }
};

// const ADMIN_KEY = process.env.ADMIN_KEY || 'development_key';

module.exports = {
    SESSION_KEY,
    KNEX_CONFIG,
    admin_key
}
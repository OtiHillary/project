const admin_key = "admin123"
const admin_alt_key = "admin000"
const SESSION_KEY = process.env.SESSION_KEY || 'RD1H233B4DW038HXS21CXGXBJX1N1IP4232N2WBX2G3C4DXW4C';
const KNEX_CONFIG = 
(process.env.environment === 'production')?
{  
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
}
:
// {
//     client: 'pg',
//     connection: {
//         host: '127.0.0.1',
//         // host: '0.0.0.0',
//         database: 'cathay',//
//         port: 5432,
//         user: 'postgres',
//         password: 'HillaryOdezy123'
//     }
// };
{  
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
};

function create_payments(index, obj_array, account_no) {
    for (let i = 0; i < index; i++) {
        let obj = {},  
            receivers = ['Oil rig commission', 'Water works commission', 'Brandon Smith', 'lauren Martinez', 'Fiona Garcia', 'Andrew Garcia', 'DRILL DESPATCH'],
            swift_codes = ['DREgbBCh123', 'huj1bhgd736', 'hf121ikld712', '87hwtud572', '928u3v9wyu', '828jdhvbc029', '24zcvc59alp'],
            years = [2018, 2019, 2020, 2021, 2022, 2023],
            iban_prefix = ['wlu', 'blE', 'ydx', 'deR', 'Xld', 'HSS', 'qsx', 'Lop', 'JSK'],
            percentage = i/index,
            randotron = Math.random()

        obj.amount = Math.floor(randotron*2000)*100;
        obj.cr_dr = randotron > 0.5?'credit':'debit';
        obj.swift = swift_codes[Math.floor( randotron*(swift_codes.length-1) )];
        obj.iban = ` ${ iban_prefix[Math.floor( randotron*(iban_prefix.length-1) )] }${Math.floor(Math.random(10)*2000000000000000000)} `;
        obj.person = receivers[Math.floor( randotron*(receivers.length-1) )]
        obj.time_stamp = `${ years[Math.floor( percentage*(years.length-1) )] }-${ Math.floor(randotron*12) }-${ Math.floor(randotron*28) }`
        obj.user_id = account_no

        obj_array.push(obj)       
    }
}

module.exports = {
    SESSION_KEY,
    KNEX_CONFIG,
    admin_key,
    admin_alt_key,
    create_payments
}
const {PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD} = process.env;

const dbSettings = {
    host: PG_HOST,
    port: Number(PG_PORT),
    database: PG_DATABASE,
    user: PG_USER,
    password: PG_PASSWORD,
};

export {dbSettings}

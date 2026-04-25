import 'dotenv/config';

export const PORT = process.env.PORT || 3000;
export const DB = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
};
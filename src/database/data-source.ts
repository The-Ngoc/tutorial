import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'medium',
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
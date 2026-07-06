import { Sequelize } from "sequelize"
import config from "./config.js";

export const sequelize = new Sequelize(
    config.db_name,          // DB name
    config.db_username,         // User
    config.db_password,      // Password
    {
        host: config.db_host,
        dialect: 'mysql',
        logging: false,
        port: config.db_port
    }
)

export default sequelize
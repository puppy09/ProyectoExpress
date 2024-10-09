import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
    process.env.DATABASE as string,
    process.env.USER as string,
    process.env.PASSWORD as string,{
        host: 'localhost',
        dialect: 'mysql'
    }
)
const checkConnection = async() => {
    try{
        await sequelize.authenticate();
        console.log("conexion exitosa");
    }catch(error){
        console.log("no hay conexion", error);
    }
}
checkConnection();
export { sequelize, checkConnection };
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface userAttributes {
    ID: number,
    nombre: string,
    apellidos: string,
    email:string,
    contra:string,
    ingresos_mensules:number
}

interface userCreationAttributes extends Optional<userAttributes, 'ID'>{}

class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
    public ID!:number;
    public nombre!:string;
    public apellidos!: string;
    public email!:string;
    public contra!:string;
    ingresos_mensules!:number;
}

user.init({
    ID:{
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    nombre:{
        type: DataTypes.STRING(100),
        allowNull:false
    },
    apellidos:{
        type: DataTypes.STRING(100),
        allowNull:false
    },
    email:{
        type: DataTypes.STRING(100),
        allowNull:false
    },
    contra:{
        type: DataTypes.STRING(100),
        allowNull:false
    },
    ingresos_mensules:{
        type:DataTypes.FLOAT
    }
}, {
    sequelize,
    tableName:'tb_users',
    timestamps:false,
});

export { user };
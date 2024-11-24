import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import {user} from "../models/user.model";
import { estatus } from "./estatus.model";
import { miembros } from "./miembros_grupos.model";

interface gruposAttributes{
    id_grupo: number,
    nombre: string,
    descripcion: string,
    id_creador: number,
    fondos: number,
    token: string
}

interface gruposCreationAttributes extends Optional<gruposAttributes, 'id_grupo'>{}

class grupos extends Model<gruposAttributes, gruposCreationAttributes> implements gruposAttributes{
    public id_grupo!: number;
    public nombre!: string;
    public descripcion!: string;
    public id_creador!: number;
    public fondos!: number;
    public token!: string;
}

grupos.init({
    id_grupo:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    nombre:{
        type:DataTypes.STRING(50),
        allowNull: false
    },
    descripcion:{
        type:DataTypes.STRING(100),
        allowNull:false
    },
    id_creador:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: user,
            key: 'ID'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    fondos:{
        type:DataTypes.FLOAT,
        allowNull:false,
    },
    token:{
        type:DataTypes.STRING(12),
        allowNull:false,
        primaryKey: true
    }
},{
    sequelize,
    tableName:'tb_grupos',
    timestamps:false,
});
grupos.belongsTo(user, {foreignKey:'id_creador', as: 'creadorDetail'});

export { grupos };
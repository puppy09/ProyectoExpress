import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import {user} from "../models/user.model";
import { estatus } from "./estatus.model";
import { grupos } from "./grupos.model";

interface miembrosAttributes{
    id:number
    id_grupo: number,
    id_usuario: number,
    id_estatus: number,
    tipo_usuario: string
}

interface miembrosCreationAttributes extends Optional<miembrosAttributes, 'id'>{}

class miembros extends Model<miembrosAttributes, miembrosCreationAttributes> implements miembrosAttributes{
    public id!: number;
    public id_grupo!: number;
    public id_usuario!: number;
    public id_estatus!: number;
    public tipo_usuario!: string;
}

miembros.init({
    id:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_grupo:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: grupos,
            key:'id_grupo'
        }
    },
    id_usuario:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: user,
            key: 'ID'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    id_estatus:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: estatus,
            key:'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    tipo_usuario:{
        type:DataTypes.STRING,
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_miembrosgrupos',
    timestamps:false,
});
miembros.belongsTo(grupos,{ foreignKey: 'id_grupo', as:'grupoDetail'});
miembros.belongsTo(estatus,{foreignKey: 'id_estatus', as:'estatusDetail'});
export { miembros };
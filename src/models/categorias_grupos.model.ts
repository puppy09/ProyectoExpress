import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import {user} from "../models/user.model";
import { estatus } from "./estatus.model";

interface categoriagrupalAttributes{
    id_categoria: number,
    id_grupo: number,
    categoria: string,
    id_creador: number
}

interface categoriagrupalCreationAttributes extends Optional<categoriagrupalAttributes, 'id_categoria'>{}

class categoriagrupal extends Model<categoriagrupalAttributes, categoriagrupalCreationAttributes> implements categoriagrupalAttributes{
    public id_categoria!: number;
    public id_grupo!: number;
    public categoria!: string;
    public id_creador!: number;
}

categoriagrupal.init({
    id_categoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_grupo:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false
    },
    categoria:{
        type:DataTypes.STRING(50),
        allowNull: false
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
    }
},{
    sequelize,
    tableName:'tb_categoriasgrupo',
    timestamps:false,
});
export { categoriagrupal };
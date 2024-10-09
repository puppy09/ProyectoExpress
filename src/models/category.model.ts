import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import {user} from "../models/user.model";
import { estatus } from "./estatus.model";

interface categoryAttributes{
    ID: number,
    nombre: string,
    presupuesto: number,
    id_user: number,
    estatus: number
}

interface categoryCreationAttributes extends Optional<categoryAttributes, 'ID'>{}

class category extends Model<categoryAttributes, categoryCreationAttributes> implements categoryAttributes{
    public ID!: number;
    public nombre!: string;
    public presupuesto!: number;
    public id_user!: number;
    public estatus!: number;
}

category.init({
    ID:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    nombre:{
        type:DataTypes.STRING(40),
        allowNull: false
    },
    presupuesto:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    id_user:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: user,
            key: 'ID'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    estatus:{
        type:DataTypes.INTEGER,
        allowNull:false,
        references:{
            model:estatus,
            key:'id'
        }
    }
},{
    sequelize,
    tableName:'tb_categorias',
    timestamps:false,
});
category.belongsTo(estatus, { foreignKey: 'estatus', as: 'estatusDetail'});
export { category };
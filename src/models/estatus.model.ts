import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
interface estatusAttributes{
    id: number,
    estatus: string
}

interface estatusCreationAttributes extends Optional<estatusAttributes, 'id'>{}

class estatus extends Model<estatusAttributes, estatusCreationAttributes> implements estatusAttributes{
    public id!: number;
    public estatus!: string;
}

estatus.init({
    id:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    estatus:{
        type:DataTypes.STRING(45),
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_estatus',
    timestamps:false
});
export{ estatus };
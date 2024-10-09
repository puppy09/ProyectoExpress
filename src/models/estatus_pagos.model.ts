import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
interface estatuspagosAttributes{
    id: number,
    estatus_pagos: string
}
interface estatuspagosCreationAttributes extends Optional<estatuspagosAttributes, 'id'>{}

class estatuspagos extends Model<estatuspagosAttributes, estatuspagosCreationAttributes> implements estatuspagosAttributes{
    public id!: number;
    public estatus_pagos!: string;
}

estatuspagos.init({
    id:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    estatus_pagos:{
        type:DataTypes.STRING(45),
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_estatuspagos',
    timestamps:false
});
export{ estatuspagos };
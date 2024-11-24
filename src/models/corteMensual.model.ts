import { sequelize } from "../config/database";
import { Model, DataType, Optional, DataTypes } from "sequelize";

interface corteMensualAttributes{
    id_corte: number,
    id_usuario: number,
    mes: Date,
    total: number
}

interface corteMensualCreationAttributes extends Optional<corteMensualAttributes, 'id_corte'>{}


class corteMensual extends Model <corteMensualAttributes, corteMensualCreationAttributes> implements corteMensualAttributes{
    public id_corte!: number;
    public id_usuario!: number;
    public mes!: Date;
    public anio!: string;
    public total!: number;
}
corteMensual.init({
    id_corte:{
        type:DataTypes.NUMBER,
        autoIncrement: true,
        primaryKey: true
    },
    id_usuario:{
        type:DataTypes.NUMBER,
        allowNull: false
    },
    mes:{
        type:DataTypes.DATE,
        allowNull: false
    },
    total:{
        type:DataTypes.FLOAT,
        allowNull:false,
        defaultValue: 0
    }
},{
    sequelize,
    tableName:'tb_corte_mensual',
    timestamps:false
});
export{corteMensual};
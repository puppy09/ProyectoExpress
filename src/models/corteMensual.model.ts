import { sequelize } from "../config/database";
import { Model, DataType, Optional, DataTypes } from "sequelize";

interface corteMensualAttributes{
    id_corte: number,
    id_usuario: number,
    mes: Date,
    monto: number
}

interface corteMensualCreationAttributes extends Optional<corteMensualAttributes, 'id_corte'>{}

class corteMensual extends Model <corteMensualAttributes, corteMensualCreationAttributes> implements corteMensualAttributes{
    public id_corte!: number;
    public id_usuario!: number;
    public mes!: Date;
    public monto!: number;
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
    monto:{
        type:DataTypes.FLOAT,
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_corte_corteMensual',
    timestamps:false
});
export{corteMensual};
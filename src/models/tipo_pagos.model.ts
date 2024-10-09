import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
interface tipospagosAttributes{
    id: number,
    tipo: string
}
interface tipospagosCreationAttributes extends Optional<tipospagosAttributes, 'id'>{}

class tipospagos extends Model<tipospagosAttributes, tipospagosCreationAttributes> implements tipospagosAttributes{
    public id!: number;
    public tipo!: string;
}

tipospagos.init({
    id:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    tipo:{
        type:DataTypes.STRING(45),
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_tipospagos',
    timestamps:false
});
export{ tipospagos };
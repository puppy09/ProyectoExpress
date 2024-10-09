import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import{user} from "../models/user.model";
import { estatus } from "./estatus.model";

interface negocioRubroAttributes{
    id_tiponegocio: number,
    tipo_negocio: string
}

interface negocioRubroCreationAttributes extends Optional<negocioRubroAttributes, 'id_tiponegocio'>{}

class negocioRubro extends Model<negocioRubroAttributes, negocioRubroCreationAttributes> implements negocioRubroAttributes{
    public  id_tiponegocio!: number;
    public tipo_negocio!: string;
}
negocioRubro.init({
    id_tiponegocio:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    tipo_negocio:{
        type:DataTypes.STRING(50),
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_tiponegocios',
    timestamps:false,
});
export { negocioRubro };
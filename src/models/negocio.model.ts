import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import{user} from "../models/user.model";
import { estatus } from "./estatus.model";
import { negocioRubro } from "./negocio_rubro.model";

interface negocioAttributes{
    id_negocio: number,
    nombre: string,
    tipo_negocio: number,
    id_creador: number
}

interface negocioCreationAttributes extends Optional<negocioAttributes, 'id_negocio'>{}

class negocio extends Model<negocioAttributes, negocioCreationAttributes> implements negocioAttributes{
    public id_negocio!: number;
    public nombre!: string;
    public tipo_negocio!: number;
    public id_creador!: number;
}
negocio.init({
    id_negocio:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    nombre:{
        type:DataTypes.STRING(150),
        allowNull:false
    },
    tipo_negocio:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: negocioRubro,
            key:'id_tiponegocio'
        }
    },
    id_creador:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references:{
            model: user,
            key: 'ID'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    
},{
    sequelize,
    tableName:'tb_negocios',
    timestamps:false,
});
negocio.belongsTo(negocioRubro, { foreignKey: 'tipo_negocio'});
export { negocio };
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import{user} from "../models/user.model";
import { estatus } from "./estatus.model";

interface cuentaAttributes{
    ID: number,
    no_cuenta: string,
    fecha_vencimiento: string,
    nombre: string,
    saldo: number,
    id_usuario: number,
    estatus: number
}

interface cuentaCreationAttributes extends Optional<cuentaAttributes, 'ID'>{}

class cuenta extends Model<cuentaAttributes, cuentaCreationAttributes> implements cuentaAttributes{
    public ID!: number;
    public no_cuenta!: string;
    public fecha_vencimiento!: string;
    public nombre!: string;
    public saldo!: number;
    public id_usuario!: number;
    public estatus!: number;
}
cuenta.init({
    ID:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    no_cuenta:{
        type:DataTypes.STRING(20),
        allowNull:false
    },
    fecha_vencimiento:{
        type:DataTypes.STRING(10),
        allowNull:false
    },
    saldo:{
        type:DataTypes.FLOAT,
        allowNull: false
    },
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    },
    id_usuario:{
        type:DataTypes.INTEGER,
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
    tableName:'tb_cuentas',
    timestamps:false,
});
cuenta.belongsTo(estatus, { foreignKey: 'estatus', as: 'estatusDetail'});
export { cuenta };
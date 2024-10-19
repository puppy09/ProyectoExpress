import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { category } from "./category.model";
import { user } from "./user.model";
import { estatus } from "./estatus.model";
import { negocio } from "./negocio.model";
import { tipoMovimiento } from "./tipomovimiento.model";


interface movimientoProgramadoAttributes{
    id_movimientoProgramado: number,
    id_usuario: number,
    no_cuenta:string,
    descripcion: string,
    //categoria:String,
    //tipo_movimiento:number;
    monto:number,
    dia: Date,
    estatus:number
}
interface movimientoProgramadoCreationAttributes extends Optional<movimientoProgramadoAttributes, 'id_movimientoProgramado'>{}

class movimientoProgramado extends Model<movimientoProgramadoAttributes, movimientoProgramadoCreationAttributes> implements movimientoProgramadoAttributes{
    id_movimientoProgramado!: number;
    id_usuario!: number;
    no_cuenta!: string;
    descripcion!: string;
    categoria!:string;
    tipo_movimiento!:number;
    monto!: number;
    dia!:Date;
    estatus!:number;
}

movimientoProgramado.init({
    id_movimientoProgramado:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_usuario:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: user,
            key: 'ID'
        }
    },
    no_cuenta:{
        type:DataTypes.STRING,
        allowNull:false
    },
    descripcion:{
        type:DataTypes.INTEGER.UNSIGNED,
    },
    monto:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    dia:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    estatus:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model:estatus,
            key:'id'
        }
    }
},{
    sequelize,
    tableName:'tb_movimientosprogramados',
    timestamps:false
});
movimientoProgramado.belongsTo(estatus, { foreignKey: 'estatus', as: 'estatusDetail'});
//movimientoProgramado.hasOne(diaMov,{foreignKey:'id_mov', as:'movimientoDetail'});
export{ movimientoProgramado };
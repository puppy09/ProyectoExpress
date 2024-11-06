import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { category } from "./category.model";
import { user } from "./user.model";
import { estatus } from "./estatus.model";
import { negocio } from "./negocio.model";
import { tipoMovimiento } from "./tipomovimiento.model";
import { pagos } from "./pagos.model";

interface movimientoAttributes{
    id_movimiento: number,
    id_usuario: number,
    id_pago:number,
    no_cuenta:string,
    descripcion: string,
    tipo_movimiento:number;
    monto:number,
    fecha: Date,
}
interface movimientoCreationAttributes extends Optional<movimientoAttributes, 'id_movimiento'>{}

class movimiento extends Model<movimientoAttributes, movimientoCreationAttributes> implements movimientoAttributes{
    id_movimiento!: number;
    id_usuario!: number;
    id_pago!: number;
    no_cuenta!: string;
    descripcion!: string;
    tipo_movimiento!:number;
    monto!: number;
    fecha!:Date;
}

movimiento.init({
    id_movimiento:{
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
    id_pago:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:true,
        references:{
            model:pagos,
            key:'id_pago'
        }
    },
    no_cuenta:{
        type:DataTypes.STRING,
        allowNull:false
    },
    descripcion:{
        type:DataTypes.STRING,
    },
    tipo_movimiento:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model:tipoMovimiento,
            key:'id_movimiento'
        }
    },
    monto:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    fecha:{
        type:DataTypes.DATE,
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_movimientos',
    timestamps:false
});
movimiento.belongsTo(tipoMovimiento, {foreignKey: 'tipo_movimiento', as: 'movimientoDetail'});
//movimiento.hasOne(diaMov,{foreignKey:'id_mov', as:'movimientoDetail'});
export{ movimiento };
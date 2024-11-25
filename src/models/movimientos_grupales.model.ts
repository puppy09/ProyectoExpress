import { Request, Response } from "express";
import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { user } from "./user.model";
import { negocio } from "./negocio.model";
import { tipoMovimiento } from "./tipomovimiento.model";
import { pagos } from "./pagos.model";
import { grupos } from "./grupos.model";
import { categoriagrupal } from "../models/categorias_grupos.model";
import { pagogrupal } from "./pagos_grupales.model";

interface movimientogrupalAttributes{
    id_movimiento: number,
    id_grupo: number,
    id_usuario: number,
    tipo_movimiento: number,
    id_pago: number,
    no_cuenta:string,
    descripcion: string,
    monto:number,
    fecha: Date,
}
interface movimientogrupalCreationAttributes extends Optional<movimientogrupalAttributes, 'id_movimiento'>{}

class movimientogrupal extends Model<movimientogrupalAttributes, movimientogrupalCreationAttributes> implements movimientogrupalAttributes{
    id_movimiento!: number;
    id_grupo!: number;
    id_usuario!: number;
    tipo_movimiento!:number;
    id_pago!: number;
    no_cuenta!: string;
    descripcion!: string;
    monto!: number;
    fecha!:Date;
}

movimientogrupal.init({
    id_movimiento:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_grupo:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model:grupos,
            key:'id_grupo'
        }
    },
    id_usuario:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: user,
            key: 'ID'
        }
    },
    tipo_movimiento:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:true,
        references:{
            model:tipoMovimiento,
            key:'id_tipomovimiento'
        }
    },
    id_pago:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:true,
        references:{
            model: pagogrupal,
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
    tableName:'tb_movimientosgrupal',
    timestamps:false
});
//movimiento.hasOne(diaMov,{foreignKey:'id_mov', as:'movimientoDetail'});
movimientogrupal.belongsTo(tipoMovimiento, {foreignKey:'tipo_movimiento', as: 'movimientoDetail'});
movimientogrupal.belongsTo(user, {foreignKey: 'id_usuario', as:'userDetail'})
export{ movimientogrupal };
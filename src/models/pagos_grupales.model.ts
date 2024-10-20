import { Request, Response } from "express";
import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { user } from "./user.model";
import { negocio } from "./negocio.model";
import { tipoMovimiento } from "./tipomovimiento.model";
import { pagos } from "./pagos.model";
import { grupos } from "./grupos.model";
import { categoriagrupal } from "../models/categorias_grupos.model";
import { subcategoriagrupal } from "./subcategorias_grupos.model";

interface pagogrupalAttributes{
    id_pago: number,
    id_grupo: number,
    id_usuario: number,
    no_cuenta:string,
    descripcion: string,
    monto:number,
    categoria:number,
    subcategoria:number,
    fecha: Date,
}
interface pagogrupalCreationAttributes extends Optional<pagogrupalAttributes, 'id_pago'>{}

class pagogrupal extends Model<pagogrupalAttributes, pagogrupalCreationAttributes> implements pagogrupalAttributes{
    id_pago!: number;
    id_grupo!: number;
    id_usuario!: number;
    no_cuenta!:string;
    descripcion!: string;
    monto!:number;
    categoria!:number;
    subcategoria!:number;
    fecha!: Date;
}

pagogrupal.init({
    id_pago:{
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
    categoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model:categoriagrupal,
            key:'id_categoria'
        }
    },
    subcategoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model:negocio,
            key:'id_negocio'
        }
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
pagogrupal.belongsTo(negocio,{foreignKey: 'subcategoria'});
pagogrupal.belongsTo(categoriagrupal,{foreignKey:'categoria'});
export{ pagogrupal };
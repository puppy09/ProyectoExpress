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
import { estatuspagos } from "./estatus_pagos.model";
import { tipospagos } from "./tipo_pagos.model";

interface pagogrupalAttributes{
    id_pago: number,
    id_grupo: number,
    id_usuario: number,
    no_cuenta:string,
    descripcion: string,
    monto:number,
    categoria:number,
    subcategoria:number,
    estatus:number,
    fecha: Date,
    tipo_pago:number,
    pagos_hechos:number,
    total_pagos:number
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
    estatus!: number;
    fecha!: Date;
    tipo_pago!:number;
    pagos_hechos!: number;
    total_pagos!: number;
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
    estatus:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model:estatuspagos,
            key:'id'
        }
    },
    fecha:{
        type:DataTypes.DATE,
        allowNull:false
    },
    tipo_pago:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: tipospagos,
            key:'id'
        }
    },
    pagos_hechos:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
    },
    total_pagos:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
    }
},{
    sequelize,
    tableName:'tb_pagosgrupal',
    timestamps:false
});
//movimiento.hasOne(diaMov,{foreignKey:'id_mov', as:'movimientoDetail'});
pagogrupal.belongsTo(negocio,{foreignKey: 'subcategoria'});
pagogrupal.belongsTo(categoriagrupal,{foreignKey:'categoria'});
pagogrupal.belongsTo(estatuspagos,{foreignKey:'estatus'});
pagogrupal.belongsTo(tipospagos,{foreignKey:'tipo_pago'});
pagogrupal.belongsTo(user, {foreignKey: 'id_usuario'});
export{ pagogrupal };
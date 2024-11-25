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

interface pagogrupalprogramadoAttributes{
    id_pago: number,
    id_grupo: number,
    id_usuario: number,
    no_cuenta:string,
    descripcion: string,
    monto:number,
    categoria:number,
    subcategoria:number,
    dia_programado:number,
    pagos_hechos:number,
    total_pagos:number,
    estatus_pago:number,
}
interface pagogrupalprogramadoCreationAttributes extends Optional<pagogrupalprogramadoAttributes, 'id_pago'>{}

class pagogrupalprogramado extends Model<pagogrupalprogramadoAttributes, pagogrupalprogramadoCreationAttributes> implements pagogrupalprogramadoAttributes{
    id_pago!: number;
    id_grupo!: number;
    id_usuario!: number;
    no_cuenta!:string;
    descripcion!: string;
    monto!:number;
    categoria!:number;
    subcategoria!:number;
    dia_programado!:number;
    pagos_hechos!:number;
    total_pagos!:number;
    estatus_pago!: number;
}

pagogrupalprogramado.init({
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
    dia_programado:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false
    },
    pagos_hechos:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false

    },
    total_pagos:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false
    },
    estatus_pago:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model:estatuspagos,
            key:'id'
        }
    }
},{
    sequelize,
    tableName:'tb_pagosprogramadosgrupal',
    timestamps:false
});
//movimiento.hasOne(diaMov,{foreignKey:'id_mov', as:'movimientoDetail'});
pagogrupalprogramado.belongsTo(negocio,{foreignKey: 'subcategoria'});
pagogrupalprogramado.belongsTo(categoriagrupal,{foreignKey:'categoria'});
pagogrupalprogramado.belongsTo(estatuspagos,{foreignKey:'estatus_pago', as:'estatusDetail'});
pagogrupalprogramado.belongsTo(user,{foreignKey: 'id_usuario', as:'usuarioDetail'})
export{ pagogrupalprogramado };
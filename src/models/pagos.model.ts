import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { tipospagos } from "./tipo_pagos.model";
import { category } from "./category.model";
import { subcategory } from "./subcategory.model";
import { estatuspagos } from "./estatus_pagos.model";
import { user } from "./user.model";
import { cuenta } from "./cuentas.model";
import { negocio } from "./negocio.model";
interface pagosAttributes{
    id_pago: number,
    id_usuario: number,
    no_cuenta: string,
    descripcion: string,
    monto: number,
    categoria: number,
    subcategoria: number,
    tipo_pago: number,
    fecha: Date,
    //dia_pago:number,
    pagos_hechos:number,
    total_pagos:number,
    estatus_pago:number
}
interface pagosCreationAttributes extends Optional<pagosAttributes, 'id_pago'>{}

class pagos extends Model<pagosAttributes, pagosCreationAttributes> implements pagosAttributes{
    public id_pago!: number;
    public id_usuario!: number;
    public no_cuenta!: string;
    public descripcion!: string;
    public monto !: number;
    public categoria!: number;
    public subcategoria!: number;
    public tipo_pago!: number;
    public fecha!: Date;
  //  public dia_pago!: number;
    public pagos_hechos!: number;
    public total_pagos!: number;
    public estatus_pago!: number;
}

pagos.init({
    id_pago:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_usuario:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: user,
            key: 'ID'
        },
        allowNull:false
    },
    no_cuenta:{
        type:DataTypes.STRING,
        references:{
            model: cuenta,
            key: 'no_cuenta'
        },
        allowNull:false
    },
    descripcion:{
        type:DataTypes.STRING,
        allowNull:false
    },
    monto:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    categoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: category,
            key: 'ID'
        },
        allowNull:false
    },
    subcategoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: negocio,
            key: 'id_negocio'
        },
        allowNull:false
    },
    tipo_pago:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: tipospagos,
            key:'id'
        },
        allowNull:false
    },
    fecha:{
        type:DataTypes.DATE,
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
        references:{
            model:estatuspagos,
            key:"id"
        },
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_pagos',
    timestamps:false
});

pagos.belongsTo(estatuspagos, { foreignKey: 'estatus_pago'});
pagos.belongsTo(negocio,{foreignKey: 'subcategoria'});
pagos.belongsTo(category,{foreignKey:'categoria'});
pagos.belongsTo(tipospagos,{foreignKey:'tipo_pago'});
export{ pagos };
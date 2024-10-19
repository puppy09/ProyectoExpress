import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { tipospagos } from "./tipo_pagos.model";
import { category } from "./category.model";
import { subcategory } from "./subcategory.model";
import { estatuspagos } from "./estatus_pagos.model";
import { user } from "./user.model";
import { cuenta } from "./cuentas.model";
import { negocio } from "./negocio.model";
import { pagosprogramados } from "./pagosprogramados.model";
interface pagospendientesAttributes{
    id_pagopendiente: number,
    id_pagoprogramado: number
}
interface pagospendientesCreationAttributes extends Optional<pagospendientesAttributes, 'id_pagopendiente'>{}

class pagospendientes extends Model<pagospendientesAttributes, pagospendientesCreationAttributes> implements pagospendientesAttributes{
    public id_pagopendiente!: number;
    public id_pagoprogramado!: number;
}

pagospendientes.init({
    id_pagopendiente:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_pagoprogramado:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: pagosprogramados,
            key: 'id_pagoprogramado'
        },
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_pagospendientes',
    timestamps:false
});

export{ pagospendientes };
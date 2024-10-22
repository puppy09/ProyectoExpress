import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { pagogrupalprogramado } from "./pagos_programados_grupales.model";
import { grupos } from "./grupos.model";
interface pagospendientesgruposAttributes{
    id_pago_pendiente: number,
    id_grupo: number,
    id_pago_programado: number
}
interface pagospendientesgruposCreationAttributes extends Optional<pagospendientesgruposAttributes, 'id_pago_pendiente'>{}

class pagospendientesgrupos extends Model<pagospendientesgruposAttributes, pagospendientesgruposCreationAttributes> implements pagospendientesgruposAttributes{
    public id_pago_pendiente!: number;
    public id_grupo!: number;
    public id_pago_programado!: number;
}

pagospendientesgrupos.init({
    id_pago_pendiente:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_grupo:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: grupos,
            key:'id_grupo'
        }
    },
    id_pago_programado:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: pagogrupalprogramado,
            key: 'id_pagoprogramado'
        },
        allowNull:false
    }
},{
    sequelize,
    tableName:'tb_pagos_pendientes_grupal',
    timestamps:false
});

export{ pagospendientesgrupos };
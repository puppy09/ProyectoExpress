import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { category } from "./category.model";
import { user } from "./user.model";
import { estatus } from "./estatus.model";
import { negocio } from "./negocio.model";

interface tipoMovimientoAttributes{
    id_tipomovimiento: number,
    tipo_movimiento: string,
}
interface tipoMovimientoCreationAttributes extends Optional<tipoMovimientoAttributes, 'id_tipomovimiento'>{}

class tipoMovimiento extends Model<tipoMovimientoAttributes, tipoMovimientoCreationAttributes> implements tipoMovimientoAttributes{
    id_tipomovimiento!: number;
    tipo_movimiento!: string;
}

tipoMovimiento.init({
    id_tipomovimiento:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    tipo_movimiento:{
        type:DataTypes.STRING,
        allowNull:false
    },
},{
    sequelize,
    tableName:'tb_tipomovimientos',
    timestamps:false
});
// Subcategory model
/*deposito.belongsTo(category, { foreignKey: 'id_categoria' });
deposito.belongsTo(negocio, { foreignKey: 'id_negocio' });

// Category model
category.hasMany(deposito, { foreignKey: 'id_categoria' });

// Negocio model
negocio.hasMany(deposito, { foreignKey: 'id_negocio' });*/

export{ tipoMovimiento };
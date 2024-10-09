import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { category } from "./category.model";
import { user } from "./user.model";
import { estatus } from "./estatus.model";
import { negocio } from "./negocio.model";

interface subcategoryAttributes{
    id_subcategory: number,
    id_categoria: number,
    id_negocio:number,
    id_user: number
}
interface subcategoryCreationAttributes extends Optional<subcategoryAttributes, 'id_subcategory'>{}

class subcategory extends Model<subcategoryAttributes, subcategoryCreationAttributes> implements subcategoryAttributes{
    id_subcategory!: number;
    id_categoria!: number;
    id_negocio!: number;
    id_user!: number;
}

subcategory.init({
    id_subcategory:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_categoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: category,
            key: 'ID'
        }
    },
    id_negocio:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: negocio,
            key: 'id_negocio'
        },
        allowNull:false
    },
    id_user:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model:user,
            key: 'ID'
        }
    }
},{
    sequelize,
    tableName:'tb_subcategory',
    timestamps:false
});
// Subcategory model
subcategory.belongsTo(category, { foreignKey: 'id_categoria' });
subcategory.belongsTo(negocio, { foreignKey: 'id_negocio' });

// Category model
category.hasMany(subcategory, { foreignKey: 'id_categoria' });

// Negocio model
negocio.hasMany(subcategory, { foreignKey: 'id_negocio' });

export{ subcategory };
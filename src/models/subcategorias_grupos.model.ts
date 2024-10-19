import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { category } from "./category.model";
import { user } from "./user.model";
import { estatus } from "./estatus.model";
import { negocio } from "./negocio.model";
import { grupos } from "./grupos.model";

interface subcategoriagrupalAttributes{
    id_subcategoria: number,
    id_grupo: number,
    id_categoria:number,
    id_negocio: number,
    id_creador: number
}
interface subcategoryCreationAttributes extends Optional<subcategoriagrupalAttributes, 'id_subcategoria'>{}

class subcategoriagrupal extends Model<subcategoriagrupalAttributes, subcategoryCreationAttributes> implements subcategoriagrupalAttributes{
    id_subcategoria!: number;
    id_grupo!: number;
    id_categoria!: number;
    id_negocio!: number;
    id_creador!: number;
}

subcategoriagrupal.init({
    id_subcategoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    id_grupo:{
        type:DataTypes.INTEGER.UNSIGNED,
        allowNull:false,
        references:{
            model: grupos,
            key:'id_grupo'
        }
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
    id_creador:{
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
subcategoriagrupal.belongsTo(category, { foreignKey: 'id_categoria' });
subcategoriagrupal.belongsTo(negocio, { foreignKey: 'id_negocio' });

// Category model
category.hasMany(subcategoriagrupal, { foreignKey: 'id_categoria' });

// Negocio model
negocio.hasMany(subcategoriagrupal, { foreignKey: 'id_negocio' });

export{ subcategoriagrupal };
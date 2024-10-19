import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { category } from "./category.model";
import { user } from "./user.model";
import { estatus } from "./estatus.model";
import { negocio } from "./negocio.model";
import { tipoMovimiento } from "./tipomovimiento.model";
import { pagos } from "./pagos.model";
import { grupos } from "./grupos.model";

interface movimientogrupalAttributes{
    id_movimiento: number,
    id_grupo: number,
    id_usuario: number,
    tipo_movimiento: number,
    no_cuenta:string,
    categoria:number,
    subcategoria:number,
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
    no_cuenta!: string;
    categoria!:number;
    subcategoria!: number;
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
    no_cuenta:{
        type:DataTypes.STRING,
        allowNull:false
    },
    descripcion:{
        type:DataTypes.STRING,
    },
    categoria:{
        type:DataTypes.STRING
    },
    subcategoria:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model: negocio,
            key: 'id_negocio'
        },
        allowNull:false
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
    tableName:'tb_movimientos',
    timestamps:false
});
//movimiento.hasOne(diaMov,{foreignKey:'id_mov', as:'movimientoDetail'});
pagos.belongsTo(negocio,{foreignKey: 'subcategoria'});
export{ movimientogrupal };
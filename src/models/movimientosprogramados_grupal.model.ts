import { DataTypes, DateOnlyDataType, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import { category } from "./category.model";
import { user } from "./user.model";
import { estatus } from "./estatus.model";
import { negocio } from "./negocio.model";
import { tipoMovimiento } from "./tipomovimiento.model";
import { group } from "console";
import { grupos } from "./grupos.model";


interface movimientoProgramadoGrupalAttributes{
    id_movimiento: number,
    id_grupo:number,
    id_usuario: number,
    no_cuenta:string,
    descripcion: string,
    //categoria:String,
    //tipo_movimiento:number;
    monto:number,
    dia: Date,
    estatus:number
}
interface movimientoProgramadoGrupalCreationAttributes extends Optional<movimientoProgramadoGrupalAttributes, 'id_movimiento'>{}

class movimientoProgramadoGrupal extends Model<movimientoProgramadoGrupalAttributes, movimientoProgramadoGrupalCreationAttributes> implements movimientoProgramadoGrupalAttributes{
    id_movimiento!: number;
    id_grupo!: number;
    id_usuario!: number;
    no_cuenta!: string;
    descripcion!: string;
    categoria!:string;
    tipo_movimiento!:number;
    monto!: number;
    dia!:Date;
    estatus!:number;
}

movimientoProgramadoGrupal.init({
    id_movimiento:{
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
        type:DataTypes.INTEGER.UNSIGNED,
    },
    monto:{
        type:DataTypes.FLOAT,
        allowNull:false
    },
    dia:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    estatus:{
        type:DataTypes.INTEGER.UNSIGNED,
        references:{
            model:estatus,
            key:'id'
        }
    }
},{
    sequelize,
    tableName:'tb_movimientosprogramados_grupal',
    timestamps:false
});
movimientoProgramadoGrupal.belongsTo(estatus, { foreignKey: 'estatus', as: 'estatusDetail'});
//movimientoProgramado.hasOne(diaMov,{foreignKey:'id_mov', as:'movimientoDetail'});
export{ movimientoProgramadoGrupal };
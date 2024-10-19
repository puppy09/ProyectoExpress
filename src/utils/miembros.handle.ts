import { grupos } from "../models/grupos.model";
import { miembros } from "../models/miembros_grupos.model"
const ifMiembro =(id:number):boolean=>{
    const miembroFound = miembros.findOne({
        where:{
            id_usuario: id
        }
    });
    if(!miembroFound){
        return false;
    }
    return true;
}

const isCreador = async (id:number, id_grupo:number):Promise<boolean>=>{
    const creador = await grupos.findOne({
        where:{
            id_creador: id,
            id_grupo: id_grupo
        }
    });
    if(!creador){
        return false;
    }
    return true;
}
export{ifMiembro, isCreador};
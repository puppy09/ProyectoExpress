import { group } from "console"
import { miembros } from "../models/miembros_grupos.model"
export const isMiembro = (idUser: number, id_grupo:number):boolean=>{
    const activeMember = miembros.findOne({
        where:{
            id_usuario: idUser,
            id_grupo: id_grupo,
            id_estatus: 1
        }
    });
    if(!activeMember){
        return false;
    }
    return true;
}
import { Request, Response } from "express";
import { miembros } from "../models/miembros_grupos.model";
import { isMiembro } from "../utils/activeMember.handle";
import { grupos } from "../models/grupos.model";

const getMiembros = async(req:Request, res:Response)=>{
    try{
        const {grupo} = req.params;
        const miembrosGrupo = await miembros.findAll({
            where:{
                id_grupo: grupo
            }
        });
        return res.status(200).json(miembrosGrupo);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO MIEMBROS DE GRUPOS'});
    }
}
const getStatusUser = async(req:Request, res:Response)=>{
    try {
        const UserId = (req as any).user.id;
        const {grupo} = req.body;
        if(!isMiembro(UserId, grupo)){
            return res.status(500).json({message:'User inactivo'});
        }
        return res.status(200).json({message:'User activo'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO ESTATUS DE USUARIO'});
    }
}

const desactivarUser = async(req:Request, res:Response)=>{
    try {
        const UserId = (req as any).user.id;
        const {grupo} = req.body;
        const esMiembro = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId
            }
        });
        if(!esMiembro){
            return res.status(404).json({message:'Usuario no encontrado'});
        }
        if(esMiembro.id_estatus===2){
            return res.status(404).json({message:'Este usuario ya esta inactivo'});
        }
        const grupoFound = await grupos.findByPk(grupo);
        if(grupoFound?.id_creador===UserId){
            return res.status(401).json({message:'No puedes desactivar el usuario si este es el creador del grupo'});
        }
        esMiembro.id_estatus=2;
        esMiembro.save();
        return res.status(200).json({message:'Usuario desactivado con exito'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR DESACTIVANDO USUARIO'});
    }
}

const activarUser = async(req:Request, res:Response)=>{
    try {
        const UserId = (req as any).user.id;
        const {grupo} = req.body;
        const esMiembro = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId
            }
        });
        if(!esMiembro){
            return res.status(404).json({message:'Usuario no encontrado'});
        }
        if(esMiembro.id_estatus===1){
            return res.status(404).json({message:'Este usuario ya esta activo'});
        }
        
        esMiembro.id_estatus=1;
        esMiembro.save();
        return res.status(200).json({message:'Usuario activado con exito'});

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR ACTIVANDO USUARIO'});
    }
}

const adminActivarUser = async(req:Request, res:Response)=>{
    try {
        const UserId = (req as any).user.id;
        const {grupo, miembro} = req.body;
        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        if(grupoFound.id_creador!=UserId){
            return res.status(401).json({message:'No eres creador'});
        }

        const esMiembro = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: miembro,
            }
        });
        if(!esMiembro){
            return res.status(404).json({message:'Usuario no encontrado'});
        }
        if(esMiembro.id_estatus===1){
            return res.status(404).json({message:'Este usuario ya esta activo'});
        }
        esMiembro.id_estatus=1;
        esMiembro.save();
        return res.status(200).json({message:'Usuario activado con exito'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR ACTIVANDO USUARIO'});
    }
}
const adminDesactivarUser = async(req:Request, res:Response)=>{
    try {
        const UserId = (req as any).user.id;
        const {grupo, miembro} = req.body;
        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        if(grupoFound.id_creador!=UserId){
            return res.status(401).json({message:'No eres creador'});
        }

        const esMiembro = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: miembro,
            }
        });
        if(!esMiembro){
            return res.status(404).json({message:'Usuario no encontrado'});
        }
        if(esMiembro.id_estatus===2){
            return res.status(404).json({message:'Este usuario ya esta inactivo'});
        }
        esMiembro.id_estatus=2;
        esMiembro.save();
        return res.status(200).json({message:'Usuario desactivado con exito'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR DESACTIVANDO USUARIO'});
    }
}
export{getMiembros, desactivarUser, activarUser, getStatusUser, adminActivarUser, adminDesactivarUser};
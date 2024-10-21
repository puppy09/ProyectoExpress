import { Request, Response } from "express";
import { miembros } from "../models/miembros_grupos.model";

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
export{getMiembros};
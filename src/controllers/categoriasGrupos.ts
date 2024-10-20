import { Request, Response } from "express";
import { miembros } from "../models/miembros_grupos.model";
import { categoriagrupal } from "../models/categorias_grupos.model";

const addCategoria = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {nombre} = req.body;
        const {grupo} = req.params;

        const isMiembro = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId
            }
        });
        if(!isMiembro){
            return res.status(401).json({message:'No eres miembro de este grupo'});
        }

        const auxGrupo = parseInt(grupo);
        const newCategory = categoriagrupal.create({
            id_grupo: auxGrupo,
            categoria: nombre,
            id_creador: UserId
        });
        return res.status(200).json({message:'Categoria creada con exito'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR CREANDO CATEGORIA GRUPAL'});
    }
}
const getCategorias = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo} = req.params;

        const categoriesFound = await categoriagrupal.findAll({
            where:{
                id_grupo: grupo
            }
        });
        if(categoriesFound.length===0){
            return res.status(404).json({message:'Categorias no encontradas'});
        }
        return res.status(200).json({categoriesFound});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO CATEGORIAS GRUPALES'});
    }
}
export{addCategoria, getCategorias}
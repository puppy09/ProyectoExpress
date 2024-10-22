import { Request, Response } from "express";
import { miembros } from "../models/miembros_grupos.model";
import { categoriagrupal } from "../models/categorias_grupos.model";
import { estatus } from "../models/estatus.model";
import { user } from "../models/user.model";

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
            id_creador: UserId,
            estatus:1
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
            },
            include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                }
            ]
        });
        if(categoriesFound.length===0){
            console.log(categoriesFound);
            return res.status(404).json({message:'Categorias no encontradas'});
        }
        return res.status(200).json({categoriesFound});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO CATEGORIAS GRUPALES'});
    }
}
const habilitarCat = async(req:Request, res:Response)=>{
    try{
        const {categoria} = req.params;
        const {grupo} = req.body;

        const categoriesFound = await categoriagrupal.findOne({
            where:{
                id_categoria:categoria,
                id_grupo:grupo
            }
        });
        if(!categoriesFound){
            return res.status(404).json({message:'Categoria no encontrada'});
        }
        if(categoriesFound.estatus===1){
            return res.status(200).json({message:'Esta categoria ya esta habilitada'});
        }
        categoriesFound.estatus=1;
        categoriesFound.save();
        return res.status(200).json({message:'Categoria activada exitosamente'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR HABILITANDO CATEGORIA GRUPAL'});
    }
}
const deshabilitarCat = async(req:Request, res:Response)=>{
    try{
        const {categoria} = req.params;
        const {grupo} = req.body;

        const categoriesFound = await categoriagrupal.findOne({
            where:{
                id_categoria:categoria,
                id_grupo:grupo
            }
        });
        if(!categoriesFound){
            return res.status(404).json({message:'Categoria no encontrada'});
        }
        if(categoriesFound.estatus===2){
            return res.status(200).json({message:'Esta categoria ya esta inhabilitada'});
        }
        categoriesFound.estatus=2;
        categoriesFound.save();
        return res.status(200).json({message:'Categoria desactivada exitosamente'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR HABILITANDO CATEGORIA GRUPAL'});
    }
}
const getGlobalActCat = async(req:Request, res:Response)=>{
    try{
        const {grupo} = req.body;
        const UserId = (req as any).user.id;

        const userFound = await miembros.findOne({where:{
            id_grupo: grupo,
            $id_usuario$: UserId
        }});
        if(!userFound){
            return res.status(401).json({message:'No tienes acceso'});
        }
        const categoriesFound = await categoriagrupal.findAll({
            where:{
                id_grupo: grupo,
                estatus:1
            }
        });
        if(categoriesFound.length===0){
            return res.status(404).json({message:'Categorias no encontradas'});
        }        
        return res.status(200).json(categoriesFound);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO CATEGORIAS ACTIVAS'});
    }
}
const updateGloCat = async(req:Request, res:Response)=>{
    try{

        const {grupo, estatus, nombre} = req.body;
        const UserId = (req as any).user.id;
        const {categoria} = req.params;

        const categoriesFound = await categoriagrupal.findOne({
            where:{
                id_grupo: grupo,
                id_creador: UserId,
                id_categoria:categoria
            }
        });
        if(!categoriesFound){
            return res.status(401).json({message:'No tienes acceso'});
        }

        categoriesFound.categoria=nombre|| categoriesFound.categoria;
        categoriesFound.estatus=estatus||categoriesFound.estatus;
        categoriesFound.save();
        return res.status(200).json({message:'Categoria Actualizada exitosamente'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR ACTUALIZANDO CATEGORIA'});
    }
}
export{addCategoria, getCategorias, deshabilitarCat, habilitarCat, getGlobalActCat, updateGloCat}
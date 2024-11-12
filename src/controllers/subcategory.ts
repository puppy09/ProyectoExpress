import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import {user} from "../models/user.model";
import {category} from "../models/category.model";
import { error } from "console";
import { subcategory } from "../models/subcategory.model";
import { negocio } from "../models/negocio.model";
import { notEqual } from "assert";
import { Op } from "sequelize";
import { findingUser } from "../utils/userFound.handle";
const asignarSubcategoria = async(req:Request, res:Response)=>{
    try{

        //Obtenemos ID de usuario
        const id_user = (req as any).user.id;
        //Obtenemos el ID del negocio o marca, asi como la categoria para establecer la relacion
        const {categoria, marca} = req.body;

        //Validamos que exista
        if(!findingUser(id_user)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        //Validamos que exista la categoria o pertenezca al usuario
        const categoryFound = await category.findOne({
            where:{
                ID: categoria,
                id_user: id_user
            }
        });
        if(!categoryFound){
            return res.status(404).json({message:'Categoria no valida, o no pertenece al usuario'});
        }

        //Si se encontro, validamos que no este dada de baja
        if(categoryFound.estatus===2){
            return res.status(500).json({message:'Categoria inactiva, es necesario activar primero'});
        }

        //Validamos que el negocio exista
        const negocioFound = await negocio.findOne({
            where:{
                id_negocio: marca,
                [Op.or]:[
                    {id_creador: 0},
                    {id_creador: id_user}
                ]
            }
        });
        if(!negocioFound){
            return res.status(404).json({message: 'Negocio no encontrado o no ha sido registrado por el usuario'});
        }

        const auxSub = await subcategory.findOne({
            where:{
                id_categoria:categoria,
                id_negocio: marca,
                id_user: id_user
            }
        });
        if(auxSub){
            return res.status(500).json({mesasge:'Este negocio o marca ya esta asignado a esta categoria'});
        }

        const newSubcategory = await subcategory.create({
            id_categoria: categoria,
            id_negocio: marca,
            id_user: id_user
        });
        return res.status(201).json(newSubcategory);
        
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Error agregando subcategoria'})
    }
}

const getSubcategorias = async(req:Request, res:Response)=>{
    try{
         
        //Obtenemos ID de usuario
        const id_user = (req as any).user.id;

        //Validamos que exista
        if(!findingUser(id_user)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        const auxSub = await subcategory.findAll({
            where:{
                id_user: id_user
            },
            attributes:{
                exclude:['id_negocio','id_user']
            },
            include: [
                {
                    model: category, // Include the category details
                    attributes: ['nombre'] // Specify the attributes you want to retrieve from Category
                },
                {
                    model: negocio, // Include the negocio (business) details
                    attributes: ['nombre'] // Specify the attributes you want to retrieve from Negocio
                }
            ]
        });

        if(!auxSub || auxSub.length === 0){
            return res.status(404).json({message:'Este user no ha agregado subcategorias'});
        }
        res.status(200).json(auxSub);
    }catch(error){
        console.error('Error fetching subcategories with details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getSingleSubcategorias = async(req:Request, res:Response)=>{
    try{
        //Obtenemos ID de usuario
    const id_user = (req as any).user.id;

    //Validamos que exista
    if(!findingUser(id_user)){
        return res.status(404).json({message:'Este usuario no ha sido encontrado'});
    }
    const {id_categoria} = req.params;

    const auxSub = await subcategory.findAll({
        where:{
            id_user: id_user,
            id_categoria: id_categoria
        },
        attributes:{
            exclude:['id_negocio','id_user']
        },
        include: [
            {
                model: category, // Include the category details
                attributes: ['nombre'] // Specify the attributes you want to retrieve from Category
            },
            {
                model: negocio, // Include the negocio (business) details
                attributes: ['nombre'] // Specify the attributes you want to retrieve from Negocio
            }
        ]
    });

    if(!auxSub || auxSub.length === 0){
        return res.status(404).json({message:'Este user no ha agregado subcategorias'});
    }
    res.status(200).json(auxSub);

    }catch(error){
    console.error('Error fetching subcategories with details:', error);
    res.status(500).json({ message: 'Internal server error' });
    }
}
const deleteSubcategory = async(req:Request, res:Response)=>{
    try{

        //Obtenemos id del usuario
        const id_user = (req as any).user.id;

        //Validamos que exista
        if(!findingUser(id_user)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        //Obtenemos el ID del negocio o marca, asi como la categoria para establecer la relacion
        const {categoria, marca} = req.body;

        const auxSub = await subcategory.findOne({
            where:{
                id_categoria: categoria,
                id_negocio: marca,
                id_user: id_user
            }
        });

        if(!auxSub){
            return res.status(404).json({message:'Esta subcategoria no existe o no pertenece al usuario'});
        }

        auxSub.destroy();

        return res.status(200).json({message:'Subcategoria eliminada con exito'});

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Error eliminando subcategoria'});
    }
}

const getCatBySub = async(req:Request, res:Response)=>{
    try {
         //Obtenemos ID de usuario
         const id_user = (req as any).user.id;
         const catId = req.params;

         //Validamos que exista
         if(!findingUser(id_user)){
             return res.status(404).json({message:'Este usuario no ha sido encontrado'});
         }
 
         const auxSub = await subcategory.findAll({
             where:{
                 id_user: id_user,
                 id_categoria: catId
             },
             attributes:{
                 exclude:['id_negocio','id_user']
             },
             include: [
                 {
                     model: category, // Include the category details
                     attributes: ['nombre'] // Specify the attributes you want to retrieve from Category
                 },
                 {
                     model: negocio, // Include the negocio (business) details
                     attributes: ['nombre'] // Specify the attributes you want to retrieve from Negocio
                 }
             ]
         });
 
         if(!auxSub || auxSub.length === 0){
             return res.status(404).json({message:'Este user no ha agregado subcategorias'});
         }
         res.status(200).json(auxSub);
        
    } catch (error) {
        
    }
}
export{asignarSubcategoria, getSubcategorias, getSingleSubcategorias, deleteSubcategory, getCatBySub};
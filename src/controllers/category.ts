import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import {user} from "../models/user.model";
import {category} from "../models/category.model";
import { error } from "console";
import { estatus } from "../models/estatus.model";
import { findingUser } from "../utils/userFound.handle";

//POST Category
const postCategory = async(req: Request, res:Response)=>{
    try{
        
        //Obtenemos ID de usuario
        const id_user = (req as any).user.id;
        //Obtenemos Nombre y Presupuesto
        var { nombre, presupuesto, estatus} = req.body;

        //validar existencia de user
        const userFound = await user.findByPk(id_user);
        if(!userFound){
            return res.status(404).json({message:'usuario no encontrado'});
        }
        if(!presupuesto){
            presupuesto = 0;
        }
        if(presupuesto > 100 || presupuesto < 0){
            return res.status(500).json({message: 'El presupuesto no puede ser menor de 0 ni mayor a 100'})
        }
        if(!estatus){
            estatus = 1;
        }
        //crear nueva categoría
        const newCategory = await category.create({
            nombre: nombre,
            presupuesto: presupuesto,
            id_user: id_user,
            estatus: estatus
        });

        //const newCategory=await category.create({nombre, presupuesto, user_id});
        res.status(201).json(newCategory);
    }catch (error){
        console.error('Error creando categoria: ',error);
        res.status(500).json({ message: 'Internal server error' });
        handleHttp(res, 'ERROR_POSTING_CATEGORY');
    }
}

//GET Category
const getCategory = async(req: Request, res:Response)=>{
    try{
        //Obtenemos id del user
        const user_id = (req as any).user.id;

        //Validamos que el user exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }
       
        const categories = await category.findAll({
            where: {
                id_user: user_id,
            },
            include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                }
            ]
        });
        
        //Si no se encuentran categorias
        if(categories.length===0){
            return res.status(200).json({message: 'ese user aun no ha añadido ninguna categoria'});
        }
            res.json(categories);
        }catch{
            console.error('Error encontrando categoria', error);
            res.status(500).json({message:'Internal server error'});
        }
}

const getSingleCategory = async(req:Request, res:Response)=>{
    try{
        //Obtenemos id del user
        const user_id = (req as any).user.id;

        const {category_id} = req.params;
        //Validamos que el user exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }
        const categories = await category.findAll({
            where: {
                id_user: user_id,
                ID: category_id
            },
            include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                }
            ]
        });
        
        //Si no se encuentran categorias
        if(categories.length===0){
            return res.status(200).json({message: 'Este user aun no ha añadido ninguna categoria'});
        }
            res.json(categories);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Error obteniendo cateogira'});
    }
}
//UPDATE Category
const updateCategory = async(req: Request, res:Response)=>{
    try{

        //Obtenemos ID del user
        const id_user = (req as any).user.id;

        //Obtenemos ID de la categoria
        const { category_id }  = req.params;

        //Obtenemos Nombre y presupuesto
        var { nombre, presupuesto, estatus } = req.body;

       //Validamos que el user exista
       if(!findingUser(id_user)){
           return res.status(404).json({message:'Este usuario no ha sido encontrado'});
       }

        //Validar categoria y que le pertenezca al usuario
        const CategoryFound = await category.findOne({
            where: {
                ID: category_id,
                id_user: id_user
            }
        });
        if(!CategoryFound){
            return res.status(404).json({ message: 'Categoria no encontrada o no pertenece al usuario' });
        }
        if(!presupuesto){
            CategoryFound.presupuesto = 0
        }
        if(presupuesto>100||presupuesto<0){
            return res.status(500).json({message: 'El presupuesto no puede ser mayor a 100 ni menor a 0'});
        }
        if(!estatus){
            CategoryFound.estatus=1;
        }
        if(estatus>2||estatus<1){
            return res.status(500).json({message: 'Estatus incorrecto'});
        }
        //Actualizar categoria con los nuevos valores
        CategoryFound.nombre = nombre
        CategoryFound.presupuesto = presupuesto || 0
        CategoryFound.estatus = estatus || 1;

        //Guardar la categoria actualizada
        await CategoryFound.save();

        //Return the updated category
        res.status(200).json(CategoryFound);
    } catch (error){
        console.error('Error actualizando la categoria ', error);
        res.status(500).json({message: 'Internal Server error'});
    }
}

//DELETE Category
/*const deleteCategory = async(req: Request, res:Response)=>{
    try{

        //Obtenemos id del user
        const user_id = (req as any).user.id;

        //obtenemos id de la categoria
        const { category_id } = req.params;

        //validamos que el usuario exista
        const userFound = await user.findByPk(user_id);
        if(!userFound){
            return res.status(404).json({message:'user not found'});
        }

        //validamos que la categoria exista y le pertenezca al usuario
        const categoryFound = await category.findOne({
            where:{
                ID: category_id,
                id_user: user_id
            }
        });
        if(!categoryFound){
            return res.status(404).json({message:'categoria no encontrada o no pertenece al usuario'});
        }
        await category.destroy({
            where:{
                ID: category_id,
                id_user: user_id
            }
        });

        //devolver mensaje de exito
        res.status(200).json({message: 'categoria eliminada exitosamente'});
    } catch(error){
        console.error('Error eliminando categoria', error);
        res.status(500).json({message: 'internal server error'});
    }
};*/

//Hacer categoria Disponible
const activarCategory = async(req: Request, res:Response)=>{
    try{
            //Obtenemos id del user
            const user_id = (req as any).user.id;

            //Validamos que el user exista
            if(!findingUser(user_id)){
                return res.status(404).json({message:'Este usuario no ha sido encontrado'});
            }

            const { category_id } = req.params;
          
            //validamos que la categoria exista y le pertenezca al usuario
            const categoryFound = await category.findOne({
                where:{
                    ID: category_id,
                    id_user: user_id
                }
            });
            if(!categoryFound){
                return res.status(404).json({message:'categoria no encontrada o no pertenece al usuario'});
            }

            if(categoryFound.estatus==1){
                return res.status(200).json({message:'Esta categoria ya esta activa'});
            }
            categoryFound.estatus = 1;
            categoryFound.save();
            return res.status(200).json({message:'Cateogira activada con exito'});
        }catch(error){
            console.error(error);
            res.status(500).json({message: 'Error eliminando categoria'});
        }
};

const desactivarCategory = async(req:Request, res: Response)=>{
    try{
        //Obtenemos id del user
        const user_id = (req as any).user.id;

        //Validamos que el user exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        const { category_id } = req.params;
      
        //validamos que la categoria exista y le pertenezca al usuario
        const categoryFound = await category.findOne({
            where:{
                ID: category_id,
                id_user: user_id
            }
        });
        if(!categoryFound){
            return res.status(404).json({message:'categoria no encontrada o no pertenece al usuario'});
        }

        if(categoryFound.estatus==2){
            return res.status(200).json({message:'Esta categoria ya esta inactiva'});
        }
        categoryFound.estatus = 2;
        categoryFound.save();
        return res.status(200).json({message:'Categoria desactivada con exito'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Error desactivando subcategoria'});
    }
}



export {postCategory, getCategory, updateCategory, activarCategory, desactivarCategory, getSingleCategory};
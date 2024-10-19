import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import {user} from "../models/user.model";
import {category} from "../models/category.model";
import { error } from "console";
import { estatus } from "../models/estatus.model";
import { findingUser } from "../utils/userFound.handle";
import { validateTotalBudgetPercentage } from "../utils/categoryBudget.handle";

//POST Category
const postCategory = async(req: Request, res:Response)=>{
    try{
        
        //Obtenemos ID de usuario
        const id_user = (req as any).user.id;
        //Obtenemos Nombre y Presupuesto
        var { nombre, presupuesto, estatus} = req.body;

        //validar existencia de user
        if(!findingUser(id_user)){
            return res.status(404).json({message:'usuario no encontrado'});
        }
        const isValid = await validateTotalBudgetPercentage(presupuesto, id_user);
        if(!isValid){
            return res.status(500).json({message:'El porcentaje total de las categorias activas no puede exceder a 100'});
        }
        if(presupuesto > 100 || presupuesto < 0){
            return res.status(500).json({message: 'El presupuesto no puede ser menor de 0 ni mayor a 100'})
        }
        //crear nueva categoría
        const newCategory = await category.create({
            nombre: nombre,
            presupuesto: presupuesto || 0,
            id_user: id_user,
            estatus: estatus || 1
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

        //Si no se manda el dato de presupuesto se tomara el que se encontraba previamente asignado
        //Esto ya esta validado mas abajo pero es para que pueda entrar la funcion de Validacion de Presupuestos
        if(!presupuesto){
            presupuesto = CategoryFound.presupuesto;
        }
        const isValid = await validateTotalBudgetPercentage(presupuesto, id_user);
        if(!isValid){
            return res.status(500).json({message:'El porcentaje total de las categorias activas no puede exceder a 100'});
        }
        
        //Validamos que sea una cantidad valida
        if(presupuesto>100||presupuesto<0||isNaN(presupuesto)){
            return res.status(500).json({message: 'El presupuesto no puede ser mayor a 100 ni menor a 0'});
        }
        if(estatus>2||estatus<1){
            return res.status(500).json({message: 'Estatus incorrecto'});
        }
        //Actualizar categoria con los nuevos valores
        CategoryFound.nombre = nombre || CategoryFound.nombre;
        CategoryFound.presupuesto = presupuesto || CategoryFound.presupuesto;
        CategoryFound.estatus = estatus || CategoryFound.estatus;

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

            //Obtenemos ID de la categoria a activar
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

            const isValid = await validateTotalBudgetPercentage(categoryFound.presupuesto, user_id, categoryFound.ID);
            if(!isValid){
                return res.status(400).json({message:'No se puede activar la categoria, el total excederia 100%'});
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

const getTotalBudget = async(req:Request, res:Response)=>{
    try{
        //Obtenemos id del user
        const user_id = (req as any).user.id;
        //Validamos que el user exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        const activeCategories = await category.findAll({
            where:{
                id_user: user_id,
                estatus: 1
            },
            attributes:['presupuesto']
        });

        const totalPercentage = activeCategories.reduce((sum, category)=>sum+category.presupuesto,0);
        return res.status(200).json(totalPercentage);
    }catch(error){
        return res.status(500).json({message:'Error calculando total de presupuestos'});
    }
}
const getActivaCategories=async(req:Request, res:Response)=>{
    try{
        //Obtenemos id del user
        const user_id = (req as any).user.id;
        //Validamos que el user exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }
        const activeCategories = await category.findAll({
            where:{
                id_user: user_id,
                estatus: 1
            },
            include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                }
            ]
        });
        if(activeCategories.length===0){
            return res.status(404).json({message:'Este user no ha añadido categorias'});
        }
        return res.status(200).json(activeCategories);

    }catch(error){
        return res.status(500).json({message:'Error obteniendo categorias activas'});
    }
}

export {postCategory, getCategory, updateCategory, activarCategory, desactivarCategory, getSingleCategory, getTotalBudget, getActivaCategories};
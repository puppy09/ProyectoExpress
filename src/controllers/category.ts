import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import {user} from "../models/user.model";
import {category} from "../models/category.model";
import { error } from "console";
import { estatus } from "../models/estatus.model";
import { findingUser } from "../utils/userFound.handle";
import { validateTotalBudgetPercentage } from "../utils/categoryBudget.handle";
import { movimiento } from "../models/movimientos.model";
import { pagos } from "../models/pagos.model";
import { Op } from "sequelize";

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
        /*const isValid = await validateTotalBudgetPercentage(presupuesto, id_user);
        if(!isValid){
            return res.status(500).json({message:'El porcentaje total de las categorias activas no puede exceder a 100'});
        }
        if(presupuesto > 100 || presupuesto < 0){
            return res.status(500).json({message: 'El presupuesto no puede ser menor de 0 ni mayor a 100'})
        }*/
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
        var { nombre, presupuesto } = req.body;

        
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
        /*if(!presupuesto){
            presupuesto = CategoryFound.presupuesto;
        }
        const isValid = await validateTotalBudgetPercentage(presupuesto, id_user);
        if(!isValid){
            return res.status(500).json({message:'El porcentaje total de las categorias activas no puede exceder a 100'});
        }*/
        
        //Validamos que sea una cantidad valida
        //if(presupuesto>100||presupuesto<0||isNaN(presupuesto)){
          //  return res.status(500).json({message: 'El presupuesto no puede ser mayor a 100 ni menor a 0'});
        //}
        //if(estatus>2||estatus<1){
         //   return res.status(500).json({message: 'Estatus incorrecto'});
        //}
        //Actualizar categoria con los nuevos valores
        CategoryFound.nombre = nombre || CategoryFound.nombre;
        CategoryFound.presupuesto = presupuesto || CategoryFound.presupuesto;

        //Guardar la categoria actualizada
        await CategoryFound.save();

        //Return the updated category
        res.status(200).json(CategoryFound);
    } catch (error){
        console.error('Error actualizando la categoria ', error);
        res.status(500).json({message: 'Internal Server error'});
    }
}

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

            /*const isValid = await validateTotalBudgetPercentage(categoryFound.presupuesto, user_id, categoryFound.ID);
            if(!isValid){
                return res.status(400).json({message:'No se puede activar la categoria, el total excederia 100%'});
            }*/

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

const getInactiveCategories=async (req:Request, res:Response)=>{
    try {
        //Obtenemos id del user
        const user_id = (req as any).user.id;
        //Validamos que el user exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }
        const inactiveCategories = await category.findAll({
            where:{
                id_user: user_id,
                estatus: 2
            },
            include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                }
            ]
        });
        if(inactiveCategories.length===0){
            return res.status(404).json({message:'Este user no ha añadido categorias'});
        }
        return res.status(200).json(inactiveCategories);
        
    } catch (error) {
        return res.status(500).json({message:'Error obteniendo categorias activas'});
    }
}
const getBudgetSpent = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth()+1;
        const currentYear = currentDate.getFullYear();

        const userFound = await user.findByPk(UserId);
        if(!userFound){
            return res.status(404).json({message:'User no encontrado'});
        }
        const categoriasFound = await category.findAll({
            where:{
                id_user: UserId
            }
        });
        if(categoriasFound.length===0){
            return res.status(404).json({message:'Categorias no encontradas'});
        }

        const budgetSpent = await Promise.all(categoriasFound.map(async (category)=>{
            const totalSpent = await pagos.sum('monto',{
                where:{
                    categoria: category.ID,
                    fecha:{
                        [Op.and]:[
                            { [Op.gte]: new Date(currentYear, currentMonth - 1, 1) },
                            { [Op.lt]: new Date(currentYear, currentMonth,1)},
                        ],
                    },
                },
            });

            const ingreso = userFound.ingresos_mensules;
            const presupuestoCantidad = (category.presupuesto/100)*ingreso;
            
            const spentPorcentaje = totalSpent ? (totalSpent/presupuestoCantidad)*100 : 0;
            const auxPorcentajeFixed = parseFloat(spentPorcentaje.toFixed(2));
            let alerta;
            if(auxPorcentajeFixed >= 95){
                alerta="Estas cerca de exceder el presupuesto establecido";
            }
            else{
                alerta="Disponible";
            }

            return {
                categoria: category.nombre,
                presupuesto_porcentaje_ingreso_mensual: category.presupuesto,
                presupuesto_gastado_en_porcentaje: parseFloat(spentPorcentaje.toFixed(2)),
                alerta_presupuesto: alerta
            };
        }));
        
        return res.status(200).json(budgetSpent);
        console.log()

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO PRESUPUESTO GASTADO'});
    }
}

const getTotalSpent = async(req:Request, res:Response)=>{
    try {
        const userID = (req as any).user.id;
        const {mes} = req.body;
        const mesFixed=mes-1;
        const inicioMes = new Date(new Date().getFullYear(), mesFixed, 1, 0, 0, 0);
        console.log("Inicio Mes"+inicioMes);
        const finMes = new Date(new Date().getFullYear(), mesFixed + 1, 0, 23, 59, 59);
        const categoriasFound = await category.findAll({
            where:{
                id_user:userID
            }
        });

        const totalGastado = await pagos.sum('monto',{
            where:{
                fecha:{
                    [Op.between]:[inicioMes, finMes],
                },
            }
        });
        if(totalGastado!=null){
            console.log("SI SE ENCONTRO"+totalGastado);
        }
        const totalGastadoFixed = totalGastado ? parseFloat(totalGastado.toFixed(2)):0;
        console.log("TOTAL GASTADO "+totalGastado);
        const categoriasPorcentaje = await Promise.all(categoriasFound.map(async (category)=>{
            const totalGastadoCat = await pagos.sum('monto',{
                where:{
                    categoria: category.ID,
                    fecha:{
                        [Op.between]:[inicioMes, finMes],
                    },
                },
            });

            const totalGastadoCatFixed = totalGastadoCat ? parseFloat(totalGastadoCat.toFixed(2)) : 0;
            const percentage = totalGastado > 0 ? (totalGastadoCatFixed / totalGastadoFixed) * 100 : 0;
            //totalGastadoCat.toFixed(2);
            return {
                categoryId: category.ID,
                presupuesto: category.presupuesto,
                categoryNombre: category.nombre,
                totalSpent: totalGastadoCatFixed || 0,
                percentage: percentage.toFixed(2), // Round to two decimal places
            };
            
        }));
        return res.status(200).json({
            totalGastadoFixed,
            categories: categoriasPorcentaje
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({error});
    }
}

const getTotalSpent3Months = async(req:Request, res:Response)=>{
    try {
        const userID = (req as any).user.id;

        const today = new Date();
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const categoriasFound = await category.findAll({
            where: {
                id_user: userID,
            },
        });

        const totalGastado = await pagos.sum('monto', {
            where: {
                fecha: {
                    [Op.between]: [threeMonthsAgo, endOfThisMonth],
                },
            },
        });

        const totalGastadoFixed = totalGastado ? parseFloat(totalGastado.toFixed(2)) : 0;

        const categoriasPorcentaje = await Promise.all(categoriasFound.map(async (category) => {
            const totalGastadoCat = await pagos.sum('monto', {
                where: {
                    categoria: category.ID,
                    fecha: {
                        [Op.between]: [threeMonthsAgo, endOfThisMonth],
                    },
                },
            });

            const totalGastadoCatFixed = totalGastadoCat ? parseFloat(totalGastadoCat.toFixed(2)) : 0;
            const percentage = totalGastado > 0 ? (totalGastadoCatFixed / totalGastadoFixed) * 100 : 0;

            return {
                categoryId: category.ID,
                categoryNombre: category.nombre,
                totalSpent: totalGastadoCatFixed || 0,
                percentage: percentage.toFixed(2),
            };
        }));

        return res.status(200).json({
            totalGastadoFixed,
            categories: categoriasPorcentaje,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
}

const getTotalSpent6Months = async(req:Request, res:Response)=>{
    try {
        const userID = (req as any).user.id;

        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const categoriasFound = await category.findAll({
            where: {
                id_user: userID,
            },
        });

        const totalGastado = await pagos.sum('monto', {
            where: {
                fecha: {
                    [Op.between]: [sixMonthsAgo, endOfThisMonth],
                },
            },
        });

        const totalGastadoFixed = totalGastado ? parseFloat(totalGastado.toFixed(2)) : 0;

        const categoriasPorcentaje = await Promise.all(categoriasFound.map(async (category) => {
            const totalGastadoCat = await pagos.sum('monto', {
                where: {
                    categoria: category.ID,
                    fecha: {
                        [Op.between]: [sixMonthsAgo, endOfThisMonth],
                    },
                },
            });

            const totalGastadoCatFixed = totalGastadoCat ? parseFloat(totalGastadoCat.toFixed(2)) : 0;
            const percentage = totalGastado > 0 ? (totalGastadoCatFixed / totalGastadoFixed) * 100 : 0;

            return {
                categoryId: category.ID,
                categoryNombre: category.nombre,
                totalSpent: totalGastadoCatFixed || 0,
                percentage: percentage.toFixed(2),
            };
        }));

        return res.status(200).json({
            totalGastadoFixed,
            categories: categoriasPorcentaje,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
}
export {getTotalSpent6Months,getTotalSpent3Months,getTotalSpent, postCategory, getCategory, updateCategory, activarCategory, desactivarCategory, getSingleCategory, getTotalBudget, getActivaCategories, getInactiveCategories, getBudgetSpent};
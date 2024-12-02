import { Request, Response } from "express";
import { miembros } from "../models/miembros_grupos.model";
import { categoriagrupal } from "../models/categorias_grupos.model";
import { estatus } from "../models/estatus.model";
import { user } from "../models/user.model";
import { validateTotalBudgetPercentageGrupal } from "../utils/categoryBudget.handle";
import { pagogrupal } from "../models/pagos_grupales.model";
import { Op } from "sequelize";
import { grupos } from "../models/grupos.model";

//AÑADIR CATEGORIA A UN GRUPO
const addCategoria = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {nombre, presupuesto} = req.body;
        const {grupo} = req.params;
        const auxGrupo = parseInt(grupo);
        /*const isMiembro = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId
            }
        });*/
        /*if(!isMiembro){
            return res.status(401).json({message:'No eres miembro de este grupo'});
        }
        const isValid = await validateTotalBudgetPercentageGrupal(presupuesto, auxGrupo);
        if(!isValid){
            return res.status(500).json({message:'El porcentaje total de las categorias activas no puede exceder a 100'});
        }
        if(presupuesto > 100 || presupuesto < 0){
            return res.status(500).json({message: 'El presupuesto no puede ser menor de 0 ni mayor a 100'})
        }*/
        
        const newCategory = categoriagrupal.create({
            id_grupo: auxGrupo,
            categoria: nombre,
            id_creador: UserId,
            presupuesto: presupuesto || 0,
            estatus:1
        });
        return res.status(200).json({message:'Categoria creada con exito'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR CREANDO CATEGORIA GRUPAL'});
    }
}

//GET TODAS LAS CATEGORIAS DE UN GRUPO
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
                },
                {
                    model: user,
                    as: 'creadorDetail',
                    attributes: ['nombre']
                }
            ]
        });
        if(categoriesFound.length===0){
            console.log(categoriesFound);
            return res.status(404).json({message:'Categorias no encontradas'});
        }
        return res.status(200).json(categoriesFound);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO CATEGORIAS GRUPALES'});
    }
}

//ACTIVAR CATEGORIA GRUPAL
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

//DESACTIVAR CATEGORIA GRUPAL
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
//GET CATEGORIAS ACTIVAS
const getGlobalActCat = async(req:Request, res:Response)=>{
    try{
        const {grupo} = req.params;
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
            },include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                },
                {
                    model: user,
                    as: 'creadorDetail',
                    attributes: ['nombre']
                }
            ]
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

//UPDATE CATEGORIAS GRUPAL
const updateGloCat = async(req:Request, res:Response)=>{
    try{

        const {grupo, nombre, presupuesto} = req.body;
        const UserId = (req as any).user.id;
        const {categoria} = req.params;
        const auxGrupo = parseInt(grupo);
        const auxCat = parseInt(categoria);
        const categoriesFound = await categoriagrupal.findOne({
            where:{
                id_grupo: grupo,
                id_creador: UserId,
                id_categoria:categoria
            }
        });
        if(!categoriesFound){
            return res.status(404).json({message:'Categoria no encontrada o No tienes acceso'});
        }

        categoriesFound.categoria=nombre|| categoriesFound.categoria;
        categoriesFound.presupuesto=presupuesto||categoriesFound.presupuesto;
        //categoriesFound.estatus=estatus||categoriesFound.estatus;
        categoriesFound.save();
        return res.status(200).json({message:'Categoria Actualizada exitosamente'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR ACTUALIZANDO CATEGORIA'});
    }
}
const getBudgetSpentGrupal = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo} = req.params;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth()+1;
        const currentYear = currentDate.getFullYear();

        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        const categoriasFound = await categoriagrupal.findAll({
            where:{
                id_grupo: grupo
            }
        });
        if(categoriasFound.length===0){
            return res.status(404).json({message:'Categorias no encontradas'});
        }

        const budgetSpent = await Promise.all(categoriasFound.map(async (category)=>{
            const totalSpent = await pagogrupal.sum('monto',{
                where:{
                    categoria: category.id_categoria,
                    fecha:{
                        [Op.and]:[
                            { [Op.gte]: new Date(currentYear, currentMonth - 1, 1) },
                            { [Op.lt]: new Date(currentYear, currentMonth,1)},
                        ],
                    },
                },
            });

            const ingreso = grupoFound.fondos;
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
                categoria: category.categoria,
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

const getCategoriasInactivas = async(req:Request, res:Response)=>{
    try {
        const {grupo} = req.params;
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
                estatus:2
            },include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                },
                {
                    model: user,
                    as: 'creadorDetail',
                    attributes: ['nombre']
                }
            ]
        });
        if(categoriesFound.length===0){
            return res.status(404).json({message:'Categorias no encontradas'});
        }        
        return res.status(200).json(categoriesFound);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO CATEGORIAS ACTIVAS'});
    }
}
export{addCategoria, getCategorias, deshabilitarCat, habilitarCat, getGlobalActCat, getCategoriasInactivas,updateGloCat, getBudgetSpentGrupal}
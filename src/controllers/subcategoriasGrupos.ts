import { Request, Response } from "express";
import { categoriagrupal } from "../models/categorias_grupos.model";
import { subcategoriagrupal } from "../models/subcategorias_grupos.model";
import { negocio } from "../models/negocio.model";

const addSubcategoria = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {categoria, id_negocio} = req.body;
        const {grupo} = req.params;
        
        /*const categoryFound = await categoriagrupal.findByPk(categoria);
        if(!categoryFound){
            return res.status(404).json({message:'Categoria grupal no encontrada'});
        }
        const negocioFound = await negocio.findByPk(id_negocio);
        console.log(negocioFound);
        if(!negocioFound){
            return res.status(404).json({message:'Negocio no encontrado'});
        }*/
        
        const existingCategory = await subcategoriagrupal.findOne({
            where:{
                id_grupo: grupo,
                id_categoria: categoria,
                id_negocio: id_negocio
            }
        });
        
        if(!existingCategory){
            const auxGrupo = parseInt(grupo);
        const newSubcategoria = subcategoriagrupal.create({
            id_grupo: auxGrupo,
            id_categoria: categoria,
            id_negocio: id_negocio,
            id_creador: UserId
        });

        return res.status(200).json({message:'Subcategoria creada'});
        }
        else{
            return res.status(500).json({message:'Ya existe esta subcategoria asignada'});
        }
        
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR CREANDO SUBCATEGORIA'});
    }
}

const getSubcategorias = async(req:Request, res:Response)=>{
    try{
        const {grupo} = req.params;
        
        const subcategoriasGrupales = await subcategoriagrupal.findAll({
            where:{
                id_grupo: grupo
            },
            include: [
                {
                    model: categoriagrupal, // Include the category details
                    attributes: ['categoria'] // Specify the attributes you want to retrieve from Category
                },
                {
                    model: negocio, // Include the negocio (business) details
                    attributes: ['nombre'] // Specify the attributes you want to retrieve from Negocio
                }
            ]
        });
        return res.status(200).json(subcategoriasGrupales);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR CREANDO SUBCATEGORIA'});
    }
}

const getSubcategoriasByCat = async(req:Request, res:Response)=>{
    try{
        //Obtenemos ID de usuario
    const id_user = (req as any).user.id;
    const {id_categoria, grupo} = req.params;

    console.log("CATEGORIAAAAAAAAAA " +id_categoria);
    console.log("grupooooooooooooooooooooooooooo "+grupo);
    //const {grupo} = req.body;

    const auxSub = await subcategoriagrupal.findAll({
        where:{
            id_categoria: id_categoria,
            id_grupo: grupo
        },
        include: [
            {
                model: categoriagrupal, // Include the category details
                attributes: ['categoria'] // Specify the attributes you want to retrieve from Category
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

        //Obtenemos el ID del negocio o marca, asi como la categoria para establecer la relacion
        const {categoria, marca, grupo} = req.body;

        const auxSub = await subcategoriagrupal.findOne({
            where:{
                id_categoria: categoria,
                id_negocio: marca,
                id_creador: id_user,
                id_grupo: grupo
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

const postAndAssignGrupos = async(req:Request, res:Response)=>{
    try {

         //Obtenemos id del usuario
         const userId = (req as any).user.id;
        
         //Obtenemos parametros del body
         const { grupo, nombre, tipo_negocio, categoria } = req.body;
         console.log("NOMBREEEE "+nombre);
         console.log("TIPO NEGOCIOOO "+tipo_negocio);
         console.log("CATEGORIA "+categoria);
        
         const newNegocio = await negocio.create({
            nombre: nombre,
            tipo_negocio: tipo_negocio,
            id_creador: userId
        });

        const newSubcategory = await subcategoriagrupal.create({
            id_categoria: categoria,
            id_negocio: newNegocio.id_negocio,
            id_creador: userId,
            id_grupo: grupo
        });
        return res.status(201).json(newSubcategory);        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error agregando subcategoria'})
    }
}
export {addSubcategoria, getSubcategorias,getSubcategoriasByCat, deleteSubcategory, postAndAssignGrupos};
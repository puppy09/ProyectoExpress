import { Request, Response } from "express";
import { categoriagrupal } from "../models/categorias_grupos.model";
import { subcategoriagrupal } from "../models/subcategorias_grupos.model";
import { negocio } from "../models/negocio.model";

const addSubcategoria = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {categoria, id_negocio} = req.body;
        const {grupo} = req.params;
        
        const categoryFound = await categoriagrupal.findByPk(categoria);
        if(!categoryFound){
            return res.status(404).json({message:'Categoria grupal no encontrada'});
        }

        console.log(`id negocio ${id_negocio}`)
        const negocioFound = await negocio.findByPk(id_negocio);
        console.log(negocioFound);
        if(!negocioFound){
            return res.status(404).json({message:'Negocio no encontrado'});
        }
        
        const auxGrupo = parseInt(grupo);
        const newSubcategoria = subcategoriagrupal.create({
            id_grupo: auxGrupo,
            id_categoria: categoryFound.id_categoria,
            id_negocio: negocioFound.id_negocio,
            id_creador: UserId
        });

        return res.status(200).json({message:'Subcategoria creada'});
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
export {addSubcategoria, getSubcategorias};
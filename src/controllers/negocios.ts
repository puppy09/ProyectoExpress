import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model"; // Ensure this is correctly imported
import { validateFechaExpiracion } from "../utils/expiracion.handle";
import { findingUser } from "../utils/userFound.handle";
import { negocioRubro } from "../models/negocio_rubro.model";
import { negocio } from "../models/negocio.model";
import { Op } from 'sequelize';

const postNegocio = async (req: Request, res: Response) => {
    try {

        //Obtenemos id del usuario
        const userId = (req as any).user.id;
        
        //Obtenemos parametros del body
        const { nombre, tipo_negocio } = req.body;

         //Validamos que exista
         if(!findingUser(userId)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        //Validar que exista tipo negocio
        const auxtipoNegocio = await negocioRubro.findByPk(tipo_negocio);

        //Si no lo encontramos
        if(!auxtipoNegocio){
            return res.status(404).json({message: 'Tipo de negocio no valido'});
        }

        if(!nombre){
            return res.status(500).json({message:'Datos no proporcionados'});
        }
        // Create a new negocio
        const newNegocio = await negocio.create({
            nombre: nombre,
            tipo_negocio: tipo_negocio,
            id_creador: userId
        });

        // Send the response with the newly created negocio
        return res.status(201).json(newNegocio);
    } catch (error) {
        console.error('Error creando negocio: ', error);
        handleHttp(res, 'ERROR_POSTING_NEGOCIO'); // Handle error properly
    }
};

const getRubros = async (req: Request, res:Response)=>{
    try {
        const rubros = await negocioRubro.findAll();
        return res.status(200).json(rubros);
    } catch (error) {
        return res.status(500).json({mesage:'ERROR OBTENIENDO RUBROS DE NEGOCIOS'});
    }
}
const getAllNegocios = async(req:Request, res:Response)=>{
    try{
        //Obtenemos id del usuario
        const userId = (req as any).user.id;
         
        //Validamos que exista
         if(!findingUser(userId)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        //Buscamos por todos los negocios
        const allNegocios = await negocio.findAll({
            where:{
                [Op.or]:[
                    //Obtenemos todos los negocios cuyo id del creador sea 0 (negocios preestablecidos)
                    //O los negocios que sean creados por el usuario
                    {id_creador:0},
                    {id_creador: userId}
                ]
            },
            include: [
                {
                    model: negocioRubro,
                    attributes: ['tipo_negocio'] // Specify the attributes you want to retrieve from Category
                }
            ]
        });
        return res.status(200).json(allNegocios);
    }
    catch(error){
        console.error('Error mostrando negocios: ', error);
        handleHttp(res, 'ERROR_GETTING_NEGOCIOS'); // Handle error properly
    }
}

const getNegociosByRubro = async(req:Request, res:Response)=>{
    try{

        //Obtenemos id del usuario
        const userId = (req as any).user.id;
         
        //Validamos que exista
         if(!findingUser(userId)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        const {categoryId} = req.params;
        const negociosByCat = await negocio.findAll({
            where:{
                tipo_negocio: categoryId,
                [Op.or]:[
                    {id_creador: 0},
                    {id_creador: userId}
                ]
            },
            include: [
                {
                    model: negocioRubro,
                    attributes: ['tipo_negocio'] // Specify the attributes you want to retrieve from Category
                }
            ]
        });

        if(!negociosByCat){
            return res.status(404).json({message: 'Categoria invalida'});
        }
        return res.status(200).json(negociosByCat);

    }catch(error){
        console.error('Error mostrando negocios por categoria: ', error);
        handleHttp(res, 'ERROR_POSTING_NEGOCIOS_BY_CATEGORY'); // Handle error properly

    }
}
export{getRubros,postNegocio, getAllNegocios, getNegociosByRubro };
import crypto from 'crypto';
import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { validateFechaExpiracion } from "../utils/expiracion.handle";
import { findingUser } from "../utils/userFound.handle";
import { Op } from 'sequelize';
import { grupos } from "../models/grupos.model";
import { geneToken } from '../utils/generateToken.handle';
import { miembros } from '../models/miembros_grupos.model';

const postGrupos = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {nombre, descripcion }= req.body;

        if(!findingUser){
            return res.status(404).json({message:'Usuario no encontrado'});
        }
        const groupToken = await geneToken();
        
        const newGrupo = await grupos.create({
            nombre: nombre,
            descripcion: descripcion,
            id_creador: UserId,
            fondos: 0,
            token:groupToken
        });
        
        const newMiembro = await miembros.create({
            id_grupo: newGrupo.id_grupo,
            id_usuario: UserId
        });
        return res.status(200).json(newGrupo);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR CREANDO GRUPO'});
    }
}

export{ postGrupos };
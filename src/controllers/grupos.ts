import crypto, { generateKey } from 'crypto';
import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { validateFechaExpiracion } from "../utils/expiracion.handle";
import { findingUser } from "../utils/userFound.handle";
import { Op } from 'sequelize';
import { grupos } from "../models/grupos.model";
import { geneToken } from '../utils/generateToken.handle';
import { miembros } from '../models/miembros_grupos.model';
import nodemailer from "nodemailer";

const postGrupos = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {nombre, descripcion }= req.body;

        const userFound = await user.findByPk(UserId);
        if(!userFound){
            return res.status(404).json({message:'Error, no existe el usuario'});
        }
        const groupToken = await geneToken();
        
        const newGrupo = await grupos.create({
            nombre: nombre,
            descripcion: descripcion,
            id_creador: UserId,
            fondos: 0,
            token:groupToken
        });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.CORREO,
                pass: process.env.CONTRA_CORREO
            }
        });

        const mailOptions={
            from: process.env.CORREO,
            to: userFound.email,
            subject: 'Sweeney - Grupo Creado',
            text: `Has creado el grupo con nombre ${nombre}. El Token para acceder a él es ${groupToken}. Proporcionalo a tus futuros miembros`
        };
        await transporter.sendMail(mailOptions);

        const newMiembro = await miembros.create({
            id_grupo: newGrupo.id_grupo,
            id_usuario: UserId,
            id_estatus: 1,
            tipo_usuario: 'CREADOR'
        });
        return res.status(200).json(newGrupo);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR CREANDO GRUPO'});
    }
}

const getGruposCreados = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        if(!findingUser(UserId)){
            return res.status(404).json({message:'Usuario no encontrado'});
        }
        const gruposCreados = await grupos.findAll({
            where:{
                id_creador: UserId
            }
        });
        if(gruposCreados.length===0){
            return res.status(404).json({message:'Este usuario aun no ha creado grupos'});
        }
        return res.status(200).json(gruposCreados);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO GRUPOS'});
    }
}

const getGruposMiembro = async(req:Request, res:Response)=>{
    try{
        console.log("ENTRO A GRUPOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOS");
        const UserId = (req as any).user.id;
        if(!findingUser(UserId)){
            return res.status(404).json({message:'Usuario no encontrado'});
        }

        //Obtenemos todos los grupos a los que pertenece la persona
        const GruposMiembro = await miembros.findAll({
            where:{
                id_usuario: UserId,
                //tipo_usuario: "MIEMBRO"
            },
            include:[
                {
                    model:grupos,
                    as:'grupoDetail',
                    attributes:['nombre', 'descripcion', 'fondos']
                }
            ]
        });
        if(GruposMiembro.length===0){
            return res.status(404).json({message:'Este usuario no es miembro de ningun grupo aun'});
        }
        return res.send(GruposMiembro);

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO GRUPOS A LOS QUE PERTENECE ESTE USUARIO'});
    }
}

const joinGrupo = async(req:Request, res:Response)=>{
    try{
        console.log("SE UNIO A GRUPOOOOOOO");
        const UserId = (req as any).user.id;
        const{token} = req.body;
        if(!findingUser(UserId)){
            return res.status(404).json({message:'Usuario no encontrado'});
        }
        const auxGrupo = await grupos.findOne({
            where:{
                token: token
            }
        });
        if(!auxGrupo){
            return res.status(404).json({message: 'Token inválido'});
        }
        const isMiembro = await miembros.findOne({
            where:{
                id_grupo: auxGrupo.id_grupo,
                id_usuario: UserId
            }
        });
        if(!isMiembro){
            const newMiembro = miembros.create({
                id_grupo: auxGrupo.id_grupo,
                id_usuario: UserId,
                id_estatus: 1,
                tipo_usuario: 'MIEMBRO'
            });
            return res.status(200).json({message:'Te uniste al grupo exitosamente'});
        }
        else{
            return res.status(500).json({message:"Ya eres miembro de este grupo"});
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR UNIENDOTE A GRUPO'});
    }
}
const updateGrupo = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo} = req.params;
        const {nombre, descripcion} = req.body;
        
        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        if(grupoFound.id_creador!=UserId){
            return res.status(401).json({message:'No tienes autorizacion'}); 
        }
        grupoFound.nombre = nombre || grupoFound.nombre;
        grupoFound.descripcion = descripcion || grupoFound.descripcion;
        grupoFound.save();
        return res.status(200).json({grupoFound});
        
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR ACTUALIZANDO GRUPO'});
    }
}
export{ postGrupos, getGruposCreados, getGruposMiembro, joinGrupo, updateGrupo };
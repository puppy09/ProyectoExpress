import {Request, Response } from "express"
import { generateToken } from "../utils/jwt.handle";
import { encrypt, verified } from "../utils/bcrypt.handle";
import {user} from "../models/user.model";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import { generateRandomPassword, updatePassword } from "../utils/generatePsw.handle";
import { text } from "stream/consumers";

dotenv.config();
const JWT_SECRET =process.env.JWT_SECRET || "secreto.01";


const loginCtrl = async (req:Request, res:Response)=>{
    const { email, contra} = req.body;

    //Checamos si existe el usuario con ese correo
    const checkIs = await user.findOne({ 
        where:{
            email:email 
        }
    });

    //Si no se encuentra...
    if(!checkIs){
        return res.status(500).json({message:'Correo o contraseña incorrectos'});
    } 

    //Encriptamos contraseña
    const passwordHash = checkIs.contra
    
    //Verificamos contraseña
    const isCorrect = await verified(contra, passwordHash);
    
    //Si no coincide
    if(!isCorrect || !checkIs){
        return res.status(500).json({message:'Correo o contraseña incorrectos'});
    }    

    //Datos del usuario
    const usuario = {ID:checkIs.ID, email:checkIs.email };
    
    //Generamos Token
    const token = generateToken(usuario.ID);
    
    //Retornamos Token y ID
    return res.send({user: checkIs.ID, token});
}

//Registrar Usuario
const registerCtrl = async(req:Request, res:Response)=>{
    const {nombre, apellidos, email} = req.body;

    //Verificamos si ya esta registrado
    const checkIs = await user.findOne({
        where:{
            email:email
        }
    });

    //Si se encontro
    if(checkIs){
        console.log("Este usuario ya fue registrado");
        return res.status(400).json({message:'Este Correo ya fue registrado'});
    }

    //Generamos contraseña
    const pass = generateRandomPassword();
    //encriptamos contraseña
    const passHash = await encrypt(pass);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user: process.env.CORREO,
            pass: process.env.CONTRA_CORREO
        },
    });

    const mailOptions = {
        from: process.env.CORREO,
        to: email,
        subject: 'Registro de Sweeney',
        text:`¡Gracias por registrarte en Sweeney! Usa esta contraseña para iniciar sesión ${pass}.
                Podrás cambiar tu contraseña una vez ingreses a la aplicación`
    };

    await transporter.sendMail(mailOptions);
    const registerNewUser = await user.create({ nombre, apellidos, email, contra:passHash, ingresos_mensules:0 });
    return res.status(200).json({message: 'Registro completado'});
}
const recoverPsw = async(req: Request, res:Response)=>{
    try {
        const {email} = req.body;
        const correoFound = await user.findOne({
            where:{
                email: email
            }
        });
        if(correoFound){
            const newPassword = generateRandomPassword();
            updatePassword(email, newPassword);
        
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth:{
                    user: process.env.CORREO,
                    pass: process.env.CONTRA_CORREO
                },
            });

            const mailOptions = {
                from: process.env.CORREO,
                to: email,
                subject: 'Recuperar Contraseña',
                text: `Tu Contraseña temporal es : ${newPassword}. Ingresa en la aplicacion.`,
            };
            await transporter.sendMail(mailOptions);
        }
        return res.status(200).json({message:'Email enviado'});
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR ENVIANDO CORREO'});
    }
}

const getSelfData = async(req:Request, res:Response)=>{
    try {

        const userID = (req as any).user.id;
        console.log("SEEEEEEEEEEEEEEEEEELLLLLLLLLLLLLLLLFFFFFFFFFFFFF DDDDDDDDDDDDDDDDDAAAAAAAAAAAAAAAAAATTTTTTTTAAAAAAAAAAA");
        const userFound= await user.findByPk(userID);
        return res.status(200).json(userFound);
    } catch (error) {
        console.log("Error obteniendo datos del usuario", error);
        return res.status(500).json({message: "ERROR OBTENIENDO DATOS DEL USUARIO"});
    }
}
export{registerCtrl, loginCtrl, recoverPsw, getSelfData}

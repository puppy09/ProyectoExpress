import {Request, Response } from "express"
import { generateToken } from "../utils/jwt.handle";
import { encrypt, verified } from "../utils/bcrypt.handle";
import {user} from "../models/user.model";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import { generateRandomPassword, updatePassword } from "../utils/generatePsw.handle";

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
    const {nombre, apellidos, email, contra} = req.body;

    //Verificamos si ya esta registrado
    const checkIs = await user.findOne({
        where:{
            email:email
        }
    });

    //Si se encontro
    if(checkIs) return "Este Usuario ya esta Registrado";

    //Encriptamos contraseña
    const passHash = await encrypt(contra);

    //Registramos en la BD
    const registerNewUser = await user.create({ nombre, apellidos, email, contra:passHash, ingresos_mensules:0 });
    return res.status(200).json(registerNewUser);
}
const recoverPsw = async(req: Request, res:Response)=>{
    try {
        const {email} = req.body;
        const correoFound = await user.findOne({
            where:{
                email: email
            }
        });
        if(!correoFound){
            console.log("no existe pa");
            return res.status(404).json({message:'NOT FOUND'});
        }
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
        return res.status(200).json({message:'Email enviado'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR ENVIANDO CORREO'});
    }
}
export{registerCtrl, loginCtrl, recoverPsw}

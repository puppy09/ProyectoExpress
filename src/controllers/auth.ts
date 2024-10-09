import {Request, Response } from "express"
import { generateToken } from "../utils/jwt.handle";
import { encrypt, verified } from "../utils/bcrypt.handle";
import {user} from "../models/user.model";
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
    const registerNewUser = await user.create({ nombre, apellidos, email, contra:passHash });
    return res.status(200).json(registerNewUser);
}

export{registerCtrl, loginCtrl}

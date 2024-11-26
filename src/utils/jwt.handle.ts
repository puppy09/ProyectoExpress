//import { NextFunction, Request, Response } from "express";
import{sign, verify}from "jsonwebtoken";
const JWT_SECRET =process.env.JWT_SECRET || "secreto.01";


const generateToken = (id: number)=>{

    //Firmar JWT Con el ID del usuario
    return sign({ id }, JWT_SECRET, {expiresIn: "24h"});
}

const verifyToken = (token: string)=>{
    try{
        return verify(token, JWT_SECRET);
    }catch(error){
        return null;
    }
}

export{generateToken,verifyToken};
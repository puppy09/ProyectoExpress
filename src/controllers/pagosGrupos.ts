import { Request, Response } from "express";

const addPagoGrupal = async(req:Request, res:Response)=>{
    try{

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR AÑADIENDO PAGO GRUPAL'});
    }
}
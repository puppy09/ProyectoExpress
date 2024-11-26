import { Request, Response } from "express";
import { user } from "../models/user.model";
import { encrypt, verified } from "../utils/bcrypt.handle";

const changePsw = async(req: Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {contra, newcontra, confirContra} = req.body;
        console.log("contra "+contra);
        console.log("nueva contra "+ newcontra);
        console.log("confirmacion contra "+confirContra);
        const userFound = await user.findByPk(UserId);
        if(!userFound){
            return res.status(404).json({message:'User no encontrado'});
        }
        const passwordHash = userFound.contra;
        const isCorrect = await verified(contra, passwordHash);

        if(!isCorrect){
            return res.status(500).json({message:'Contraseña invalida'});
        }
        if(userFound.contra===newcontra){
            return res.status(500).json({message:'La nueva contraseña no debe ser igual a la anterior'});
        }
        if(newcontra!=confirContra){
            return res.status(500).json({message:'La contraseña no coincide'});
        }
        const passHash = await encrypt(newcontra);
        userFound.contra=passHash;
        userFound.save();
        return res.status(200).json({message:'Contra cambiada'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message: 'ERROR CAMBIANDO CONTRASEÑA'});
    }
}


export{changePsw};
//Sandbox para pagos
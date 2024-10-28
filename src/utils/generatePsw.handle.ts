import {hash, compare} from "bcryptjs"; 
import { encrypt } from "./bcrypt.handle";
import { user } from "../models/user.model";
function generateRandomPassword() {
    console.log("generate psw");
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function updatePassword(userEmail: string, newPassword:string) {
    console.log("upd password");
    const hashedPsw = await hash(newPassword, 8);
    const userFound= await user.findOne({
        where:{
            email: userEmail
        }
    });
    if(!userFound){
        console.log("Usuario no encontrado");
        return;
    }
    userFound.contra = hashedPsw;
    userFound.save();
    await user.update({contra: hashedPsw}, {where: {email: userEmail}});
}
export{generateRandomPassword, updatePassword}
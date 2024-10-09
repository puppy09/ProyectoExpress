import { user } from "../models/user.model"
export const findingUser = (idUser: number):boolean=>{
    const userFound = user.findByPk(idUser)
    if(!userFound){
        return false;
    }
    return true;
}
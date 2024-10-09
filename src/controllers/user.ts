import { Request, Response } from "express"
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";

const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const idUser = await user.findByPk(id);
        
        return idUser ? res.json(idUser) : res.status(404).json({ message: "No existe ese usuario"});

    } catch (error) {
        handleHttp(res, 'ERROR_GET_USER');
    }
}

const getUsers = async (req: Request, res: Response) => {
    try{
        const users = await user.findAll();
        res.status(200).json(users);
    } catch(error){
        handleHttp(res, 'ERROR_GET_USERS');
    }
}

const postUser = async( req: Request, res:Response) => {

    try{
        const { nombre, apellidos, email, contra} = req.body;
        const newUser = await user.create({ nombre, apellidos, email, contra});
        res.status(201).json(newUser);
    } catch{
        handleHttp(res, 'ERROR_POSTING_USER')
    }
}

const updateUser = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const { nombre, apellidos, email, contra} = req.body;
        const idUser = await user.findByPk(id);
        if(!idUser){
            return res.status(404).json({ message: "No existe ese usuario"})
        } 
        await idUser.update({nombre, apellidos, email, contra});
        res.json(idUser);

    }catch(error){
        handleHttp(res, 'ERROR_UPDATING_USERS');
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const idUser = await user.findByPk(id);
        if(!idUser){
            return res.status(404).json({ message: "No existe ese usuario"})
        }

        await idUser.destroy()
        res.json({ message:"Usuario borrado de la base de datos"});

    }catch{
        handleHttp(res, 'ERROR_DELETING_USERS')
    }
}


export { getUser, getUsers, postUser, updateUser, deleteUser};
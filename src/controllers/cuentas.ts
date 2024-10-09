import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model"; // Ensure this is correctly imported
import { error } from "console";
import { pagos } from "../models/pagos.model";
import { validateFechaExpiracion } from "../utils/expiracion.handle";
import { findingUser } from "../utils/userFound.handle";
import { estatus } from "../models/estatus.model";
//import { findingCuenta } from "../utils/cuentaFound.handle";

// POST Cuenta
const postCuenta = async (req: Request, res: Response) => {
    try {

        //Obtenemos id del usuario
        const userId = (req as any).user.id;
        
        //Obtenemos parametros del body
        const { no_cuenta, fecha_vencimiento, nombre, saldo, estatus } = req.body;

        // Validate existence of user
        const userFound = await user.findByPk(userId);
        if (!userFound) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        //Validar que no exista cuenta
        const aux_cuenta = await cuenta.findOne({
            where:{
                no_cuenta:no_cuenta
            }
        });

        //Si la encontramos
        if(aux_cuenta){
            return res.status(500).json({message: 'Ya existe esta cuenta registrada'});
        }

        if(!validateFechaExpiracion(fecha_vencimiento)){
            return res.status(400).json({message: 'Fecha de expiración invalida'});
        }
        const auxsaldo  = saldo || 0;
        const auxestatus = estatus || 1;        
        // Create a new cuenta
        const newCuenta = await cuenta.create({
            no_cuenta,
            fecha_vencimiento,
            nombre,
            saldo: auxsaldo,
            id_usuario: userId,
            estatus: auxestatus
        });

        // Send the response with the newly created cuenta
        res.status(201).json(newCuenta);
    } catch (error) {
        console.error('Error creando cuenta: ', error);
        handleHttp(res, 'ERROR_POSTING_CUENTA'); // Handle error properly
    }
};

const getCuentas = async(req: Request, res: Response)=>{
   try{
        const userId = (req as any).user.id;
        console.log(userId);
        const cuentas = await cuenta.findAll({
            where:{
                id_usuario: userId
            },
            include: [
                {
                    model: estatus, // Include the category details
                    as: 'estatusDetail',
                    attributes: ['estatus'] // Specify the attributes you want to retrieve from Category
                }
            ]
        })
        if(cuentas.length === 0 || !cuentas){
            return res.status(404).send('Este usuario no tiene ninguna cuenta agregada');
        }
        return res.send(cuentas);
   }catch(error){
        console.error('Error obteniendo cuentas: ', error);
        handleHttp(res, 'ERROR_GETTING_CUENTA'); // Handle error properly
   }
};

/*const deleteCuentas= async(req: Request, res:Response)=>{
    try{

        //Obtenemos ID del usuario
        const user_Id = (req as any).user.id;

        //Obtenemos ID de la cuenta
        const {cuenta_id} = req.params;


        //validamos que el usuario exista
        const userFound = await user.findByPk(user_Id);
        if(!userFound){
            return res.status(404).json({message:'Usuario no encontrado'});
        }

        //validamos que la cuenta exista y le pertenezca al usuario
        const cuentaFound = await cuenta.findOne({
            where:{
                ID: cuenta_id,
                id_usuario: user_Id
            }
        });
        if(!cuentaFound){
            return res.status(404).json({message:'cuenta no encontrada o no pertenece al usuario'});
        }
        await cuenta.destroy({
            where:{
                ID: cuenta_id,
                id_usuario: user_Id
            }
        });
        //devolver mensaje de exito
       return res.status(200).json({message: 'cuenta eliminada exitosamente'});
    }catch(error){
        console.error('Error eliminando cuenta', error);
        res.status(500).json({message: 'internal server error'});
    }
};*/
const updateCuentas=async(req:Request, res:Response)=>{
    try{

        //Obtenemos id
        const user_id = (req as any).user.id;
        //Obtenemos id de la cuenta
        const { cuenta_id } = req.params;

        //Obtenemos parametros
        const { no_cuenta, fecha_vencimiento, nombre, saldo, estatus} = req.body;

        //Validamos si el usuario existe
        const userFound = await user.findByPk(user_id);
        if(!userFound){
            return res.status(404).json({ message:'Usuario no encontrado' });
        }

         //Validar cuenta y que le pertenezca al usuario
         const cuentaFound = await cuenta.findOne({
            where: {
                ID: cuenta_id,
                id_usuario: user_id
            }
        });
        if(!cuentaFound){
            return res.status(404).json({ message: 'Cuenta no encontrada o no pertenece al usuario' });
        }

        //Validamos fecha de expiracion de cuenta
        if(!validateFechaExpiracion(fecha_vencimiento)){
            return res.status(400).json({message: 'Fecha de expiración invalida'});
        }

        
        //Validar que no exista cuenta
        const aux_cuenta = await cuenta.findOne({
            where:{
                no_cuenta:no_cuenta
            }
        });
        if(aux_cuenta){
            return res.status(500).json({message:'Numero de cuenta invalido, esta cuenta ya ha sido registrada'});
        }
        //Actualizar categoria con los nuevos valores
        cuentaFound.nombre = nombre || cuentaFound.nombre //Se mantendra el mismo nombre de la categoria si este no se encuentra
        cuentaFound.saldo = saldo || cuentaFound.saldo;
        cuentaFound.fecha_vencimiento = fecha_vencimiento|| cuentaFound.fecha_vencimiento;
         
        //Guardamos el numero de cuenta anterior
        const oldCuenta = cuentaFound.no_cuenta;
        //Actualizamos el numero de cuenta y el estatus
        cuentaFound.no_cuenta = no_cuenta || cuentaFound.no_cuenta;
        cuentaFound.estatus = estatus || cuentaFound.estatus;

        //Si no se ingresa dineros
        if (!saldo || isNaN(saldo)) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }
        //Guardar la categoria actualizada
        await cuentaFound.save();

        //Esto es para actualizar el numero de cuenta en los pagos
        const updatePayments = await pagos.update(
            {no_cuenta: cuentaFound.no_cuenta},
            {
                where: { no_cuenta: oldCuenta }
            }
        );

        //Return the updated category
        res.status(200).json(cuentaFound);
    } catch (error){
        console.error('Error actualizando la categoria ', error);
        res.status(500).json({message: 'Internal Server error'});
    }
};

const addFunds = async (req: Request, res: Response) => {
    try {

        //Obtenemos ID del usuario
        const user_id = (req as any).user.id;
        
        //Obtenemos ID de la cuenta
        const { cuenta_id } = req.params;
        
        //Obtenemos el dineros
        const { money } = req.body;

        //Si no se ingresa dineros
        if (!money || isNaN(money) || money<=0) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }

        //Buscamos que el usuario exista
        const userFound = await user.findByPk(user_id);
        if (!userFound) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        //Nos aseguramos que exista la cuenta y le pertenezca al usuario
        const cuentaFound = await cuenta.findOne({
            where: {
                ID: cuenta_id,
                id_usuario: user_id
            }
        });

        //Si no se encontro
        if (!cuentaFound) {
            return res.status(404).json({ message: 'Cuenta no encontrada o no pertenece al usuario' });
        }

        if(cuentaFound.estatus===2){
            return res.status(500).json({message:'Esta cuenta está desactivada, actívala primero'});
        }
        //Pasamos el dinero a float
        const money_parsed = parseFloat(money);
        const updatedSaldo = (parseFloat(cuentaFound.saldo.toString()) + money_parsed).toFixed(2);

        // Save the updated saldo as a number, rounded to 2 decimal places
        cuentaFound.saldo = parseFloat(updatedSaldo);

        await cuentaFound.save();

        res.status(200).json({ message: 'Saldo actualizado con éxito', cuenta: cuentaFound });
    } catch (error) {
        console.error('Error actualizando el saldo:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const habilitarCuenta = async(req:Request, res:Response)=>{
    try{
        //Obtenemos ID del usuario
        const user_id = (req as any).user.id;
        
        //Validamos que exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

        //Obtenemos ID de la cuenta
        const { cuenta_id } = req.params;
        //const auxCuentaId = parseInt(cuenta_id);
        /*if(!findingCuenta(auxCuentaId, user_id)){
            return res.status(404).json({message:'Esta cuenta no existe o no pertenece a este usuario'});
        }*/
        const cuentaFound = await cuenta.findOne({
            where:{
                ID: cuenta_id,
                id_usuario: user_id
            }
        });
        if(!cuentaFound){
            return res.status(404).json({message:'Esta cuenta no existe o no pertenece a este usuario'});
        }

        if(cuentaFound.estatus === 1){
            return res.status(200).json({message:'Esta cuenta ya esta activa'});
        }
        cuentaFound.estatus=1;
        cuentaFound.save();
        res.status(200).json({ message: 'Cuenta activada con exito'});

    }catch(error){
        return res.status(500).json({message:'Error activando cuenta'});
    }
}

const deshabilitarCuenta = async(req:Request, res:Response)=>{
    try{
        //Obtenemos ID del usuario
        const user_id = (req as any).user.id;
        
        //Validamos que exista
        if(!findingUser(user_id)){
            return res.status(404).json({message:'Este usuario no ha sido encontrado'});
        }

         //Obtenemos ID de la cuenta
         const { cuenta_id } = req.params;

         const cuentaFound = await cuenta.findOne({
            where:{
                ID: cuenta_id,
                id_usuario: user_id
            }
        });
        if(!cuentaFound){
            return res.status(404).json({message:'Esta cuenta no existe o no pertenece a este usuario'});
        }

        if(cuentaFound.estatus === 2){
            return res.status(200).json({message:'Esta cuenta ya esta inactiva'});
        }
        cuentaFound.estatus=2;
        cuentaFound.save();
        res.status(200).json({ message: 'Cuenta desactivada con exito'});
    }catch(error){
        return res.status(500).json({message:'Error activando cuenta'});
    }
}

export { postCuenta, getCuentas, updateCuentas,addFunds, habilitarCuenta, deshabilitarCuenta };

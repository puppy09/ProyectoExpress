import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model"; // Ensure this is correctly imported
import { error } from "console";
import { pagos } from "../models/pagos.model";
import { validateFechaExpiracion } from "../utils/expiracion.handle";
import { findingUser } from "../utils/userFound.handle";
import { estatus } from "../models/estatus.model";
import { movimiento } from "../models/movimientos.model";

import { movimientoProgramado } from "../models/movimientosprogramados.model";
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

const getCuentasActivas = async(req: Request, res: Response)=>{
    try{
         const userId = (req as any).user.id;
         const cuentas = await cuenta.findAll({
             where:{
                 id_usuario: userId,
                 estatus: 1
             }
         });
         if(cuentas.length === 0 || !cuentas){
             return res.status(404).send('Este usuario no tiene ninguna cuenta agregada');
         }
         return res.send(cuentas);
    }catch(error){
         console.error('Error obteniendo cuentas activas: ', error);
         handleHttp(res, 'ERROR_GETTING_ACTIVE_CUENTAS'); // Handle error properly
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
/*const updateCuentas=async(req:Request, res:Response)=>{
    try{

        //Obtenemos id
        const user_id = (req as any).user.id;
        if(!findingUser(user_id)){
            return res.status(404).json({ message:'Usuario no encontrado' });
        }

        //Obtenemos id de la cuenta
        const { cuenta_id } = req.params;

        //Obtenemos parametros
        const { no_cuenta, fecha_vencimiento, nombre, saldo, estatus} = req.body;
        

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
};*/

const updateCuentas = async (req: Request, res: Response) => {
    try {
        // Get user ID and account ID from the request
        const user_id = (req as any).user.id;
        const { cuenta_id } = req.params;

        // Get parameters from the request body
        const { no_cuenta, fecha_vencimiento, nombre, saldo, estatus } = req.body;

        // Validate if the user exists
        const userFound = await user.findByPk(user_id);
        if (!userFound) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Validate that the account belongs to the user
        const cuentaFound = await cuenta.findOne({
            where: {
                ID: cuenta_id,
                id_usuario: user_id
            }
        });
        if (!cuentaFound) {
            return res.status(404).json({ message: 'Cuenta no encontrada o no pertenece al usuario' });
        }

        // Validate expiration date
        if (fecha_vencimiento && !validateFechaExpiracion(fecha_vencimiento)) {
            return res.status(400).json({ message: 'Fecha de expiración inválida' });
        }

        // Validate if the new `no_cuenta` already exists, but only if `no_cuenta` is provided
        if (no_cuenta) {
            const aux_cuenta = await cuenta.findOne({
                where: {
                    no_cuenta: no_cuenta
                }
            });
            if (aux_cuenta) {
                return res.status(500).json({ message: 'Número de cuenta inválido, esta cuenta ya ha sido registrada' });
            }
        }

        // If `saldo` is provided, validate that it's a valid number
        if (saldo !== undefined && (isNaN(saldo) || saldo < 0)) {
            return res.status(400).json({ message: 'Cantidad inválida para el saldo' });
        }

        // Update the account with new values or keep the old ones if not provided
        cuentaFound.nombre = nombre !== undefined ? nombre : cuentaFound.nombre;
        cuentaFound.saldo = saldo !== undefined ? saldo : cuentaFound.saldo;
        cuentaFound.fecha_vencimiento = fecha_vencimiento !== undefined ? fecha_vencimiento : cuentaFound.fecha_vencimiento;
        
        // Save the old `no_cuenta` before updating it
        const oldCuenta = cuentaFound.no_cuenta;
        
        // If `no_cuenta` is provided, update it; otherwise, keep the old one
        cuentaFound.no_cuenta = no_cuenta !== undefined ? no_cuenta : cuentaFound.no_cuenta;
        
        // If `estatus` is provided, update it; otherwise, keep the old one
        cuentaFound.estatus = estatus !== undefined ? estatus : cuentaFound.estatus;

        // Save the updated account
        await cuentaFound.save();

        // If `no_cuenta` was updated, update it in all the related `pagos`
        if (no_cuenta) {
            const updatePayments = await pagos.update(
                { no_cuenta: cuentaFound.no_cuenta },
                {
                    where: { no_cuenta: oldCuenta }
                }
            );
        }

        // Return the updated account information
        res.status(200).json(cuentaFound);
    } catch (error) {
        console.error('Error actualizando cuenta:', error);
        res.status(500).json({ message: 'Error actualizando la cuenta' });
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


const applyProgrammedDeposits = async () =>{
    const hoy = new Date();
    const dia= hoy.getDate();
    try{
        const depositosToApply = await movimientoProgramado.findAll({
            where:{
                dia: dia,
                estatus:1
            }
        });
        if(depositosToApply.length===0){
            console.log("No hay depositos para aplicar hoy");
        }

        for(const deposito of depositosToApply){
            const {id_usuario, no_cuenta, descripcion, monto, dia, estatus} = deposito;
            const cuentaFound = await cuenta.findOne({
                where:{
                    no_cuenta: no_cuenta
                }
            });
            if(cuentaFound){
                cuentaFound.saldo += monto;
                await cuentaFound.save();
            }
            else{
                console.log(`Cuenta ${no_cuenta}, no encontrada`);
            }
            const currentDate: Date = new Date();
            const fecha = currentDate.getDate();
            const newDeposito = await movimiento.create({
                id_usuario:id_usuario,
                id_pago:0,
                no_cuenta:no_cuenta,
                descripcion:descripcion,
                monto:monto,
                tipo_movimiento:1,
                fecha: currentDate,
            });
            await newDeposito.save();
            console.log(`Deposito con monto ${monto} aplicado a cuenta ${no_cuenta} para el usuario ${id_usuario}`);
        }
    }catch(error){
        console.error("Error aplicando depositos programados", error);
    }
};

//Update Movimientos Programados
const updFondosProgra = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {idMov} = req.params;
        const {no_cuenta, monto, dia, estatus, descripcion} = req.body;

        const auxMov = await movimientoProgramado.findByPk(idMov);
        if(!auxMov){
            return res.status(404).json({message:'Pago no encontrado'});
        }

        auxMov.no_cuenta = no_cuenta||auxMov.no_cuenta;
        auxMov.monto = monto||auxMov.monto;
        auxMov.dia=dia||auxMov.dia;
        auxMov.estatus=estatus||auxMov.estatus;
        auxMov.descripcion=descripcion||auxMov.descripcion;
        auxMov.save();
        return res.status(200).json({message:'Pago actualizado'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR ACTUALIZANDO DEPOSITO PROGRAMADO'});
    }
}

export { postCuenta, getCuentas, updateCuentas, habilitarCuenta, deshabilitarCuenta, applyProgrammedDeposits, getCuentasActivas, updFondosProgra };

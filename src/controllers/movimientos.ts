import { Request, Response } from "express";
import { movimiento } from "../models/movimientos.model";
import { tipoMovimiento } from "../models/tipomovimiento.model";
import { movimientoProgramado } from "../models/movimientosprogramados.model";
import { estatus } from "../models/estatus.model";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model";

//Get de Movimientos
const getMovimientos = async(req: Request, res: Response)=>{
    try {
        const userId = (req as any).user.id;
        const movimientosFound = await movimiento.findAll({
            where:{
                id_usuario: userId
            },
            include:[
                {
                    model: tipoMovimiento,
                    as:'movimientoDetail',
                    attributes:['tipo_movimiento']
                }
            ],
            order:[
                ['fecha', 'DESC']
            ]
        });
        if(movimientosFound.length===0){
            console.log("No hay movimientos");
            return res.status(200).json({message:'Este usuario no tiene movimientos'});
        }
        return res.status(200).json(movimientosFound)
    } catch (error) {
        console.log("ERROR OBTENIENDO MOVIMIENTOS", error);
        return res.status(500).json({message:'ERROR OBTENIENDO MOVIMIENTOS DEL USUARIO'});
    }
}

//Get de Movimientos Programados
const getMovimientosProgramados = async(req:Request, res:Response)=>{
    try {
        const userId = (req as any).user.id;
        const movimientosFound = await movimientoProgramado.findAll({
            where:{
                id_usuario: userId
            },
            include:[
                {
                    model: estatus,
                    as:'estatusDetail',
                    attributes:['estatus']
                }
            ]
        });
        if(movimientosFound.length===0){
            return res.status(403).json({message:"Este usuario no tiene movimientos programados"});
        }
        return res.status(200).json({movimientosFound})
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Error obteniendo movimientos programados"})
    }
}

//get Movimientos By Cuenta
const getMovByCuenta = async(req:Request, res:Response)=>{
    try {
        const userID = (req as any).user.id;
        const {noCuenta} = req.body;

        const movimientosFound = await movimiento.findAll({
            where:{
                no_cuenta: noCuenta
            },
            include:[
                {
                    model: tipoMovimiento,
                    as:'movimientoDetail',
                    attributes:['tipo_movimiento']
                }
            ]
        });
        return res.status(200).json(movimientosFound)
    } catch (error) {
        console.log("Error obteniendo movimientos por no de cuenta", error);
        return res.status(500).json({message: 'ERROR OBTENIENDO MOVIMIENTOS POR CUENTA'});
    }
}

const postFondos = async(req:Request, res:Response)=>{
    try {
        console.log('POSTEANDO FONDOS');
        //Obtenemos ID del usuario
        const user_id = (req as any).user.id;
        
        
        //Obtenemos el dineros
        const { monto, no_cuenta, descripcion } = req.body;
        console.log(monto);
        //Si no se ingresa dineros
        if (!monto || isNaN(monto) || monto<=0) {
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
                no_cuenta: no_cuenta,
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
        const money_parsed = parseFloat(monto);
        const updatedSaldo = (parseFloat(cuentaFound.saldo.toString()) + money_parsed).toFixed(2);
        cuentaFound.saldo = parseFloat(updatedSaldo);
            await cuentaFound.save();
            
            const currentDate = new Date();
            const newDeposito = movimiento.create({
                id_usuario:user_id,
                id_pago:0,
                no_cuenta:no_cuenta,
                descripcion:descripcion,
                monto:monto,
                tipo_movimiento:1,
                fecha: currentDate,
            });
            console.log(cuentaFound);
            return res.status(201).json({ cuentaFound });
    } catch (error) {
        console.log("Error añadiendo gondos", error);
        return res.status(500).json({message: "ERROR AÑADIENDO FONDOS A CUENTA"});
    }
}

const postFondosProgramados = async(req:Request, res:Response)=>{
    try {
        //Obtenemos ID del usuario
        const user_id = (req as any).user.id;
        
        
        //Obtenemos el dineros
        const { monto, no_cuenta, descripcion, dia_depo } = req.body;
        console.log(monto);
        //Si no se ingresa dineros
        if (!monto || isNaN(monto) || monto<=0) {
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
                no_cuenta: no_cuenta,
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
        const money_parsed = parseFloat(monto);
        const updatedSaldo = (parseFloat(cuentaFound.saldo.toString()) + money_parsed).toFixed(2);
        
        //Si es un deposito programado
        //lo creamos y lo guardamos en la tabla de movimientos programados
        const depoProgramado = movimientoProgramado.create({
            id_usuario: user_id,
            no_cuenta: no_cuenta,
            descripcion: descripcion,
            monto: monto,
            dia:dia_depo,
            estatus:1
        });

        //Si es programado mensual sera necesario actualizar los ingresos mensuales del usuario
        userFound.ingresos_mensules += monto;
        userFound.save();
        return res.status(201).json({depoProgramado});
    } catch (error) {
        console.log("Error programando deposito", error);
        return res.status(500).json({message:"ERROR PROGRAMANDO DEPOSITO"});
    }
}
export {getMovimientos, getMovimientosProgramados, getMovByCuenta, postFondos, postFondosProgramados}
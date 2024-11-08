import { Request, Response } from "express";
import { movimiento } from "../models/movimientos.model";
import { tipoMovimiento } from "../models/tipomovimiento.model";
import { movimientoProgramado } from "../models/movimientosprogramados.model";
import { estatus } from "../models/estatus.model";

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
                }
            ]
        });
        return res.status(200).json(movimientosFound)
    } catch (error) {
        console.log("Error obteniendo movimientos por no de cuenta", error);
        return res.status(500).json({message: 'ERROR OBTENIENDO MOVIMIENTOS POR CUENTA'});
    }
}
export {getMovimientos, getMovimientosProgramados, getMovByCuenta}
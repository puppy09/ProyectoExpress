import { Request, Response } from "express";
import { movimiento } from "../models/movimientos.model";
import { tipoMovimiento } from "../models/tipomovimiento.model";

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
export {getMovimientos}
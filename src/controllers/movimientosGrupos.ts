import { Request, Response } from "express";
import { cuenta } from "../models/cuentas.model";
import { grupos } from "../models/grupos.model";
import { movimientogrupal } from "../models/movimientos_grupales.model";
import { miembros } from "../models/miembros_grupos.model";
import { movimiento } from "../models/movimientos.model";
const addFondos = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {no_cuenta, monto} = req.body;
        const {grupo} = req.params;
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: no_cuenta,
                id_usuario: UserId
            }
        });
        if(!cuentaFound){
            return res.status(404).json({message:'Cuenta no encontrada'});
        }
        if(cuentaFound.saldo<monto){
            return res.status(500).json({message:'Fondos insuficientes'});
        }
        const isMiembro = miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId
            }
        });
        if(!isMiembro){
            return res.status(401).json({message:'No eres miembro de este grupo'});
        }
        cuentaFound.saldo -= monto;
        cuentaFound.save();
        
        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        grupoFound.fondos += monto;
        grupoFound.save();
        
        const auxGrupo = parseInt(grupo);
        const date = new Date();
        const newMovimiento = movimientogrupal.create({
            id_grupo: auxGrupo,
            id_usuario: UserId,
            tipo_movimiento: 1,
            id_pago: 0,
            no_cuenta: no_cuenta,
            descripcion: `Adicion de fondos del usuario ${UserId}`,
            monto: monto,
            fecha: date
        });

        const newMovimientoIndi = movimiento.create({
            id_usuario:UserId,
            id_pago:0,
            no_cuenta:no_cuenta,
            descripcion:`Adicion de fondos al grupo ${grupo}`,
            tipo_movimiento: 2,
            monto: monto,
            fecha: date
        });
        return res.status(200).json({message:'Fondos añadidos'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR AÑADIENDO FONDOS'});
    }
}
export{addFondos}
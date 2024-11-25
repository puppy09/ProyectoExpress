import { Request, Response } from "express";
import { cuenta } from "../models/cuentas.model";
import { grupos } from "../models/grupos.model";
import { movimientogrupal } from "../models/movimientos_grupales.model";
import { miembros } from "../models/miembros_grupos.model";
import { movimiento } from "../models/movimientos.model";
import { movimientoProgramadoGrupal } from "../models/movimientosprogramados_grupal.model";
import { user } from "../models/user.model";
import { isMiembro } from "../utils/activeMember.handle";
const addFondos = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {no_cuenta, monto, tipo_deposito, dia_depo} = req.body;
        const {grupo} = req.params;
        const auxGrupo = parseInt(grupo);
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: no_cuenta,
                id_usuario: UserId
            }
        });
        if(!cuentaFound){
            return res.status(404).json({message:'Cuenta no encontrada'});
        }
        const isActivo = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario:  UserId,
                id_estatus: 1
            }
        });
        if(!isActivo){
            return res.status(500).json({message:'Este user no esta activo'});
        }
        if(cuentaFound.saldo<monto){
            return res.status(500).json({message:'Fondos insuficientes'});
        }
        const isMiembro = miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId,
                id_estatus: 1
            }
        });
        if(!isMiembro){
            return res.status(401).json({message:'No eres miembro de este grupo o no es activo'});
        }
/*        if(tipo_deposito===2){
            const depoProgramado = movimientoProgramadoGrupal.create({
                id_grupo: auxGrupo,
                id_usuario: UserId,
                no_cuenta: no_cuenta,
                descripcion: `Adicion de fondos del usuario ${UserId}`,
                monto: monto,
                dia:dia_depo,
                estatus:1
            });
        }*/
        cuentaFound.saldo -= monto;
        cuentaFound.save();
        
        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        grupoFound.fondos += monto;
        grupoFound.save();
        
        
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

const addFondosProgramados = async(req:Request, res:Response)=>{
    try {
        const UserId = (req as any).user.id;
        const {no_cuenta, monto, tipo_deposito, dia_depo} = req.body;
        const {grupo} = req.params;
        const auxGrupo = parseInt(grupo);
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: no_cuenta,
                id_usuario: UserId
            }
        });
        if(!cuentaFound){
            return res.status(404).json({message:'Cuenta no encontrada'});
        }
        const isActivo = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario:  UserId,
                id_estatus: 1
            }
        });
        if(!isActivo){
            return res.status(500).json({message:'Este user no esta activo'});
        }
        if(cuentaFound.saldo<monto){
            return res.status(500).json({message:'Fondos insuficientes'});
        }
        const isMiembro = miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId,
                id_estatus: 1
            }
        });
        if(!isMiembro){
            return res.status(401).json({message:'No eres miembro de este grupo o no es activo'});
        }
        const depoProgramado = movimientoProgramadoGrupal.create({
            id_grupo: auxGrupo,
            id_usuario: UserId,
            no_cuenta: no_cuenta,
            descripcion: `Adicion de fondos del usuario ${UserId}`,
            monto: monto,
            dia:dia_depo,
            estatus:1
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR PROGRAMANDO FONDOS'});
    }
}

const applyFondosGrupales = async()=>{
    const hoy = new Date();
    const dia= hoy.getDate();
    try{
        const depositosToApply = await movimientoProgramadoGrupal.findAll({
            where:{
                dia: dia,
                estatus:1
            }
        });
        if(depositosToApply.length===0){
            console.log("No hay depositos para aplicar hoy");
        }

        for(const deposito of depositosToApply){
            const {id_grupo, id_usuario, no_cuenta, descripcion, monto, dia, estatus} = deposito;
            const grupoFound = await grupos.findOne({
                where:{
                    id_grupo: id_grupo
                }
            });
            const cuentaFound = await cuenta.findOne({
                where:{
                    no_cuenta: no_cuenta
                }
            });
            if(!cuentaFound){
                console.log("Cuenta no encontrada");
                continue;
            }
            if(grupoFound){
                grupoFound.fondos += monto;
                await grupoFound.save();
                cuentaFound.saldo -= monto;
                await cuentaFound.save();
            }
            else{
                console.log(`Grupo ${id_grupo}, no encontrado`);
            }
            const currentDate: Date = new Date();
            const fecha = currentDate.getDate();
            const newDeposito = await movimientogrupal.create({
                id_grupo: id_grupo,
                id_usuario:id_usuario,
                id_pago:0,
                no_cuenta:no_cuenta,
                descripcion:descripcion,
                monto:monto,
                tipo_movimiento:1,
                fecha: currentDate,
            });
            await newDeposito.save();
            console.log(`Deposito con monto ${monto} aplicado a grupo ${id_grupo} por el usuario ${id_usuario}`);
        }
    }catch(error){
        console.error("Error aplicando depositos programados", error);
    }
}

const uptFondosProGru = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any);
        const {movProId} = req.params;
        const {grupo, no_cuenta, monto, dia_depo, estatus} = req.body;

        const isActivo = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario:  UserId,
                id_estatus: 1
            }
        });
        if(!isActivo){
            return res.status(500).json({message:'Este user no esta activo'});
        }
        const auxMov = await movimientoProgramadoGrupal.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: UserId,
                id_movimiento: movProId
            }
        });
        if(!auxMov){
            return res.status(404).json({message:'Pago no encontrado'});
        }
        auxMov.no_cuenta = no_cuenta || auxMov.no_cuenta;
        auxMov.monto = monto   || auxMov.monto;
        auxMov.dia = dia_depo || auxMov.dia;
        auxMov.estatus = estatus || auxMov.estatus;
        auxMov.save();
        return res.status(200).json({message:'Movimiento Programado Editado con exito'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR ACTUALIZANDO FONDO PROGRAMADO'});
    }
}

const getMovimientosGrupales = async(req:Request,res:Response)=>{
    try {
        
            const UserId = (req as any).user.id;
            const {grupo} = req.params;
            const isActivo = await miembros.findOne({
                where:{
                    id_grupo: grupo,
                    id_usuario:  UserId,
                    id_estatus: 1
                }
            });
            if(!isActivo){
                return res.status(500).json({message:'Este user no esta activo'});
            }
            const auxPagos = await movimientogrupal.findAll({
                where:{
                    id_grupo: grupo
                },
                order:[
                    ['fecha', 'DESC']
                ]
            });
            if(auxPagos.length===0){
                return res.status(404).json({message: 'Este grupo aun no ha hecho pagos'});
            }
            return res.status(200).json(auxPagos);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO MOVIMIENTOS GRUPALES'});
    }
}
export{addFondos, applyFondosGrupales, uptFondosProGru , getMovimientosGrupales};
import { Request, Response } from "express";
import { cuenta } from "../models/cuentas.model";
import { grupos } from "../models/grupos.model";
import { movimientogrupal } from "../models/movimientos_grupales.model";
import { miembros } from "../models/miembros_grupos.model";
import { movimiento } from "../models/movimientos.model";
import { movimientoProgramadoGrupal } from "../models/movimientosprogramados_grupal.model";
import { user } from "../models/user.model";
import { isMiembro } from "../utils/activeMember.handle";
import { tipoMovimiento } from "../models/tipomovimiento.model";
import { estatus } from "../models/estatus.model";
const addFondos = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {no_cuenta, descripcion, monto } = req.body;
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
            descripcion: descripcion,
            monto: monto,
            fecha: date
        });

        const newMovimientoIndi = movimiento.create({
            id_usuario:UserId,
            id_pago:0,
            no_cuenta:no_cuenta,
            descripcion:`Adicion de fondos al grupo ${grupoFound.nombre}`,
            tipo_movimiento: 2,
            monto: monto,
            fecha: date
        });
        return res.status(200).json(newMovimiento);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR AÑADIENDO FONDOS'});
    }
}

const addFondosProgramados = async(req:Request, res:Response)=>{
    try {
        const UserId = (req as any).user.id;
        const {no_cuenta, monto, descripcion, dia_depo} = req.body;
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
            descripcion: descripcion,
            monto: monto,
            dia:dia_depo,
            estatus:1
        });
        return res.status(200).json(depoProgramado);
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
        const {no_cuenta, descripcion, monto, dia_depo} = req.body;
        console.log("no cuenta " + no_cuenta);
        console.log("descripcion "+descripcion);
        console.log("dia: "+ dia_depo);
        console.log("monto "+monto);
        
        const auxMov = await movimientoProgramadoGrupal.findByPk(movProId);
        if(!auxMov){
            return res.status(404).json({message:'Pago no encontrado'});
        }
        auxMov.descripcion = descripcion || auxMov.descripcion;
        auxMov.no_cuenta = no_cuenta || auxMov.no_cuenta;
        auxMov.monto = monto   || auxMov.monto;
        auxMov.dia = dia_depo || auxMov.dia;
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
                include:[
                    {
                        model: tipoMovimiento,
                        as: 'movimientoDetail',
                        attributes:['tipo_movimiento']
                    },
                    {
                        model: user,
                        as: 'userDetail',
                        attributes:['nombre']
                    }
                ],
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

const getMovimientosProgramadosGrupales = async(req: Request, res:Response)=>{
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
        const auxMovimientos = await movimientoProgramadoGrupal.findAll({
            where:{
                id_grupo: grupo
            },
            include:[
                {
                    model: estatus,
                    as: 'estatusDetail',
                    attributes:['estatus']
                },
                {
                    model: user,
                    as: 'usuarioDetail',
                    attributes:['nombre']
                }
            ]
        });
        if(auxMovimientos.length===0){
            return res.status(404).json({message: 'No hay fondos programados'});
        }
        return res.status(200).json(auxMovimientos);
} catch (error) {
    console.log(error);
    return res.status(500).json({message:'ERROR OBTENIENDO MOVIMIENTOS GRUPALES'});
}
}

const activarMovProgramado = async(req:Request, res:Response)=>{
    try {
        const {movPro} = req.params;
        const userID = (req as any).user.id;
        const movimientoFound = await movimientoProgramadoGrupal.findByPk(movPro);
        if(!movimientoFound){
            return res.status(500).json({message:'ERROR ENCONTRANDO MOVIMIENTO PROGRAMADO'});
        }
        movimientoFound.estatus=1;
        movimientoFound.save();
        return res.status(200).json(movimientoFound);

    } catch (error) {
        console.log("Error activando movimiento");
        return res.status(500).json({message:'Error activando movimiento'});
    }
}

const desactivarMovProgramado = async(req:Request, res:Response)=>{
    try {
        const {movPro} = req.params;
        console.log("MOVIMIENTO PROGRAMADO: "+movPro);
        const userID = (req as any).user.id;
        const movimientoFound = await movimientoProgramadoGrupal.findByPk(movPro);
        if(!movimientoFound){
            return res.status(500).json({message:'ERROR ENCONTRANDO MOVIMIENTO PROGRAMADO'});
        }
        movimientoFound.estatus=2;
        movimientoFound.save();
        return res.status(200).json(movimientoFound);

    } catch (error) {
        console.log("Error desactivando movimiento");
        return res.status(500).json({message:'Error desactivando movimiento'});
    }
}
export{desactivarMovProgramado,activarMovProgramado,addFondosProgramados, addFondos, applyFondosGrupales, uptFondosProGru , getMovimientosGrupales, getMovimientosProgramadosGrupales};
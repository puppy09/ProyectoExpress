import { Request, Response } from "express";
import { pagogrupal } from "../models/pagos_grupales.model";
import { grupos } from "../models/grupos.model";
import { movimientogrupal } from "../models/movimientos_grupales.model";
import { tipospagos } from "../models/tipo_pagos.model";

const addPagoGrupal = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {no_cuenta, descripcion, monto, categoria, subcategoria} = req.body;
        const {grupo}=req.params;
        const auxGrupo = parseInt(grupo);
        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        if(grupoFound.fondos < monto||isNaN(monto||monto<0)){
            return res.status(500).json({message:'Cantidad invalida'});
        }
        //Verificar que Categoria
        const fecha = new Date();
        const newPago = await pagogrupal.create({
            id_usuario: UserId,
            id_grupo: auxGrupo,
            no_cuenta: no_cuenta,
            descripcion:descripcion,
            monto: monto,
            categoria: categoria,
            subcategoria: subcategoria,
            estatus:2,
            fecha: fecha
        });

        const newMovimiento = movimientogrupal.create({
            id_grupo:auxGrupo,
            id_usuario:UserId,
            tipo_movimiento: 2,
            id_pago: newPago.id_pago,
            no_cuenta: no_cuenta,
            descripcion: descripcion,
            monto: monto,
            fecha: fecha
        });
        grupoFound.fondos -= monto;
        grupoFound.save();
        return res.status(200).json(newPago);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR AÑADIENDO PAGO GRUPAL'});
    }
}

const updatePagoGrupal = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo, no_cuenta, descripcion, monto, categoria, subcategoria} = req.body;
        const {pagoId} = req.params;
        

        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        
       const pagoFound = await pagogrupal.findOne({
        where:{
            id_grupo: grupo,
            id_usuario: UserId
        }
       });
        if(!pagoFound){
            return res.status(404).json({message:'Pago no encontrado'});
        }
        const fecha = new Date();
        const paymentDate = new Date(pagoFound.fecha);

        const isSameMonth = paymentDate.getMonth()===fecha.getMonth() && paymentDate.getFullYear()===fecha.getFullYear();
        if(!isSameMonth){
            return res.status(500).json({message:'Este movimiento es demasiado antiguo para ser editado'});
        }
        const diferencia = pagoFound.monto - monto;
       pagoFound.descripcion=descripcion||pagoFound.descripcion;
       pagoFound.monto=monto||pagoFound.monto;
       pagoFound.categoria=categoria||pagoFound.categoria;
       pagoFound.subcategoria=subcategoria||pagoFound.subcategoria;
        pagoFound.save();

       const movFound = await movimientogrupal.findOne({
        where:{
            id_pago:pagoFound.id_pago
        }
       });

       if(!movFound){
        return res.status(404).json({message:'Pago no encontrado'});
       }
       movFound.descripcion=descripcion||movFound.descripcion;
       movFound.monto=monto||movFound.monto;
       movFound.save();

       
       
       console.log(diferencia);
       let auxTipoPago=0;
       let auxMonto=0;
       if(diferencia<0){
           const totalDebido = Math.abs(diferencia);
           grupoFound.fondos -= totalDebido;
           grupoFound.save();
           auxTipoPago=2;
          auxMonto=totalDebido;
       }
       if(diferencia>0){
           grupoFound.fondos += diferencia;
           grupoFound.save();
           auxTipoPago=1;
           auxMonto=diferencia;
       }
        const newMovimiento = movimientogrupal.create({
            id_grupo:grupo,
            id_usuario:UserId,
            tipo_movimiento: auxTipoPago,
            id_pago: pagoFound.id_pago,
            no_cuenta: no_cuenta,
            descripcion: `Ajuste de monto de pago con ID ${pagoFound.id_pago}`,
            monto: auxMonto,
            fecha: fecha
        });
        return res.status(200).json(`Pago con ID ${pagoFound.id_pago}, actualizado con exito`);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR AÑADIENDO PAGO GRUPAL'});
    }
}

const reembolsoGrupal = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {pagoId} = req.params;

        const pagoFound = await pagogrupal.findByPk(pagoId);
        if(!pagoFound){
            return res.status(404).json({message:'Pago no encontrado'});
        }
        if(pagoFound.id_usuario!=UserId){
            return res.status(401).json({message:'No tienes acceso'});
        }
        if(pagoFound.estatus===3){
            return res.status(500).json({message:'Este pago ya fue reembolsado'});
        }
        const paymentDate = new Date(pagoFound.fecha);
        const auxFecha = new Date();

        const isSameMonth = paymentDate.getMonth()===auxFecha.getMonth() && paymentDate.getFullYear()===auxFecha.getFullYear();
        if(!isSameMonth){
            return res.status(500).json({message:'Este movimiento es demasiado antiguo para ser reembolsado'});
        }
        pagoFound.estatus=3;
        pagoFound.save();
        const auxMov = await movimientogrupal.create({
            id_grupo: pagoFound.id_grupo,
            id_usuario: UserId,
            tipo_movimiento: 3,
            id_pago: pagoFound.id_pago,
            no_cuenta: pagoFound.no_cuenta,
            descripcion: `Reembolso de pago con ID ${pagoFound.id_pago}`,
            monto:pagoFound.monto,
            fecha:auxFecha
        });
        const grupoFound = await grupos.findByPk(pagoFound.id_grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        grupoFound.fondos += pagoFound.monto;
        grupoFound.save();
        return res.status(200).json({mesage:'Pago reembolsado con exito'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR REEMBOLSANDO PAGO'});
    }
}

const getPagosGrupales = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo} = req.params;

        const auxPagos = await pagogrupal.findAll({
            where:{
                id_grupo: grupo
            }
        });

        if(auxPagos.length===0){
            return res.status(404).json({message: 'Este grupo aun no ha hecho pagos'});
        }
        return res.status(200).json({auxPagos});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO PAGOS GRUPALES'});
    }
}

const getPagosGrupalesByCategory = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo} = req.params;
        const {categoria} = req.body;

        const auxPagos = await pagogrupal.findAll({
            where:{
                id_grupo: grupo,
                categoria: categoria
            }
        });
        if(auxPagos.length===0){
            return res.status(404).json({message: 'Este grupo aun no ha hecho pagos con esa categoria'});
        }
        return res.status(200).json({auxPagos});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO PAGOS GRUPALES POR CATEGORIA'});
    }
}

const getPagosGrupalesBySubcategory=async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo} = req.params;
        const {subcategoria} = req.body;

        const auxPagos = await pagogrupal.findAll({
            where:{
                id_grupo: grupo,
                subcategoria: subcategoria
            }
        });
        if(auxPagos.length===0){
            return res.status(404).json({message: 'Este grupo aun no ha hecho pagos con esa subcategoria'});
        }
        return res.status(200).json({auxPagos});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO PAGOS GRUPALES POR SUBCATEGORIA'});
    }
}

const getPagosGrupalesByCatandSub = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo} = req.params;
        const {categoria,subcategoria} = req.body;

        const auxPagos = await pagogrupal.findAll({
            where:{
                id_grupo: grupo,
                categoria:categoria,
                subcategoria: subcategoria
            }
        });
        if(auxPagos.length===0){
            return res.status(404).json({message: 'Este grupo aun no ha hecho pagos con esas caracteristicas'});
        }
        return res.status(200).json({auxPagos});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR OBTENIENDO PAGOS GRUPALES POR CATEGORIA Y SUBCATEGORIA'});
    }
}
export {addPagoGrupal, updatePagoGrupal, reembolsoGrupal, getPagosGrupales, getPagosGrupalesByCategory, getPagosGrupalesBySubcategory, getPagosGrupalesByCatandSub};
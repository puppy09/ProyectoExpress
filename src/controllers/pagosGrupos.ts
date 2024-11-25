import { Request, Response } from "express";
import { pagogrupal } from "../models/pagos_grupales.model";
import { grupos } from "../models/grupos.model";
import { movimientogrupal } from "../models/movimientos_grupales.model";
import { tipospagos } from "../models/tipo_pagos.model";
import { pagogrupalprogramado } from "../models/pagos_programados_grupales.model";
import { pagospendientesgrupos } from "../models/pagospendientes_grupos.mode";
import { categoriagrupal } from "../models/categorias_grupos.model";
import { pagos } from "../models/pagos.model";
import { miembros } from "../models/miembros_grupos.model";
import { negocio } from "../models/negocio.model";
import { estatuspagos } from "../models/estatus_pagos.model";

const addPagoGrupal = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {no_cuenta, descripcion, monto, categoria, subcategoria, tipo_pago, dia_pago, total_pagos} = req.body;
        const {grupo}=req.params;
        const auxGrupo = parseInt(grupo);
        const grupoFound = await grupos.findByPk(grupo);
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
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        if(isNaN(monto||monto<0)){
            return res.status(500).json({message:'Cantidad invalida'});
        }
        /*if(tipo_pago===2){
            const newProgrammedPago = await pagogrupalprogramado.create({
                id_usuario: UserId,
                id_grupo: auxGrupo,
                no_cuenta: no_cuenta,
                descripcion: descripcion,
                monto:monto,
                categoria:categoria,
                subcategoria:subcategoria,
                dia_programado: dia_pago,
                pagos_hechos: 0,
                total_pagos: total_pagos,
                estatus_pago: 1
            });
            return res.status(201).json({
                message: 'Pago global programado con exito',
                pago:newProgrammedPago
            });
        }*/
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
            fecha: fecha,
            tipo_pago: 1,
            pagos_hechos:1,
            total_pagos:1
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

const addPagoProgramadoGrupal = async(req:Request, res:Response)=>{

    const UserId = (req as any).user.id;
    const {no_cuenta, descripcion, monto, categoria, subcategoria, tipo_pago, dia_pago, total_pagos} = req.body;
    const {grupo}=req.params;
    const auxGrupo = parseInt(grupo);
    const grupoFound = await grupos.findByPk(grupo);
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
    if(!grupoFound){
        return res.status(404).json({message:'Grupo no encontrado'});
    }
    if(isNaN(monto||monto<0)){
        return res.status(500).json({message:'Cantidad invalida'});
    }

    const newProgrammedPago = await pagogrupalprogramado.create({
        id_usuario: UserId,
        id_grupo: auxGrupo,
        no_cuenta: no_cuenta,
        descripcion: descripcion,
        monto:monto,
        categoria:categoria,
        subcategoria:subcategoria,
        dia_programado: dia_pago,
        pagos_hechos: 0,
        total_pagos: total_pagos,
        estatus_pago: 1
    });
    return res.status(201).json({
        message: 'Pago global programado con exito',
        pago:newProgrammedPago
    });
}
const updatePagoGrupal = async(req:Request, res:Response)=>{
    try{
        const UserId = (req as any).user.id;
        const {grupo, no_cuenta, descripcion, monto, categoria, subcategoria} = req.body;
        const {pagoId} = req.params;
        
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
        const {pagoId, grupo} = req.params;

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
        const isActivo = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario:  UserId,
                id_estatus: 1
            }
        });
        /*if(!isActivo){
            return res.status(500).json({message:'Este user no esta activo'});
        }*/
        const auxPagos = await pagogrupal.findAll({
            where:{
                id_grupo: grupo
            },
            include: [
                {
                    model: categoriagrupal,
                    attributes: ['categoria'], // Specify the attributes you want to retrieve from Category
                },
                {
                    model: negocio,
                    attributes: ['nombre']
                },
                {
                    model: tipospagos,
                    attributes:['tipo']
                },
                {
                    model:estatuspagos,
                    attributes:['estatus_pagos']
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

const applyGruProgrammedPagos = async()=>{
    const hoy = new Date();
    const dia= hoy.getDate();
    try{
        const pagosToApply = await pagogrupalprogramado.findAll({
            where:{
                dia_programado: dia,
                estatus_pago:1
            }
        });
        console.log("se trae los pagos a aplicar");
        if(pagosToApply.length===0){
            console.log("No hay pagos grupales para aplicar hoy");
        }
        console.log(pagosToApply);
        for(const pago of pagosToApply){
            const {id_grupo, id_usuario, no_cuenta, descripcion, categoria, subcategoria, monto, pagos_hechos, total_pagos} = pago;

            const grupoFound = await grupos.findByPk(id_grupo);
            if(grupoFound){
                if(grupoFound.fondos<monto){
                    console.log(`Fondos Insuficientes en grupo ${id_grupo}, sera agendado como pago pendiente`);
                    const pagoPendiente = await pagospendientesgrupos.create({
                        //id_pagoprogramado: pago.id_pagoprogramado,
                        id_pago_programado: pago.id_pago,
                        id_grupo: pago.id_grupo
                    });
                    continue;
                }
                grupoFound.fondos -= monto;
                await grupoFound.save();
            }
            else{
                console.log(`Grupo ${id_grupo}, no encontrada`);
            }
            const categoryFound = await categoriagrupal.findByPk(categoria);
            if(!categoryFound){
                console.log("No existe esta categoria");
                return;
            }
            const currentDate: Date = new Date();
            const fecha = currentDate.getDate();
            const newPago = await pagogrupal.create({
                id_usuario:id_usuario,
                id_grupo:id_grupo,
                no_cuenta:no_cuenta,
                descripcion:descripcion,
                monto:monto,
                categoria:categoria,
                subcategoria:subcategoria,
                tipo_pago:2,
                fecha: currentDate,
                //dia_pago: fecha,
                pagos_hechos: pagos_hechos+1,
                total_pagos:total_pagos,
                estatus: pagos_hechos + 1 >=total_pagos ? 2 : 1
            });
            pago.pagos_hechos+=1;
            const newMovimiento = await movimientogrupal.create({
                id_usuario:id_usuario,
                id_grupo:id_grupo,
                id_pago:newPago.id_pago,
                no_cuenta:no_cuenta,
                descripcion:descripcion,
                monto:monto,
                tipo_movimiento:2,
                fecha: currentDate,
            });
            if(pago.pagos_hechos >= pago.total_pagos){
                pago.estatus_pago=2
            }
            await pago.save();
            console.log(`Pago con monto ${monto} aplicado a cuenta ${no_cuenta} para el usuario ${id_usuario}`);
        }
    }catch(error){
        console.error('Error aplicando pago programado: ', error);
    }
};

const applyGruPendientesPagos = async()=>{
    const hoy = new Date();
    const dia= hoy.getDate();
    try{
        const pagosPendientesApply = await pagospendientesgrupos.findAll();
        if(pagosPendientesApply.length===0){
            console.log("No hay pagos pendientes para aplicar");
            return;
        }
        for(const pago of pagosPendientesApply){
            const {id_pago_programado} = pago;

            const pagoDetail = await pagogrupalprogramado.findByPk(id_pago_programado);
            if(!pagoDetail){
                console.log("Cuenta no encontrada");
                continue;
            }
            const grupoFound = await grupos.findOne({
                where:{
                    id_grupo: pagoDetail.id_grupo
                }
            });
            if(!grupoFound){
                console.log("Grupo no encontrado");
                continue;
            }
            if(grupoFound.fondos<pagoDetail.monto){
                console.log('Saldos insuficientes');
                continue;
            }
            const categoryFound = await categoriagrupal.findByPk(pagoDetail.categoria);
            if(!categoryFound){
                console.log("categoria no encontrada");
                continue;
            }
            grupoFound.fondos -= pagoDetail.monto;

            const newPago = await pagogrupal.create({
                //id_usuario:pagoDetail.id_usuario,
                //no_cuenta:pagoDetail.no_cuenta,
                //descripcion:pagoDetail.descripcion,
                //monto:pagoDetail.monto,
                //categoria:pagoDetail.categoria,
                //subcategoria:pagoDetail.subcategoria,
                //tipo_pago:2,
                //fecha: hoy,
                //dia_pago: fecha,
                //pagos_hechos: pagoDetail.pagos_hechos+1,
                //total_pagos:pagoDetail.total_pagos,
                //estatus_pago: pagoDetail.pagos_hechos + 1 >=pagoDetail.total_pagos ? 2 : 1,

                id_usuario:pagoDetail.id_usuario,
                id_grupo:pagoDetail.id_grupo,
                no_cuenta:pagoDetail.no_cuenta,
                descripcion:pagoDetail.descripcion,
                monto:pagoDetail.monto,
                categoria:pagoDetail.categoria,
                subcategoria:pagoDetail.subcategoria,
                tipo_pago:2,
                fecha: hoy,
                //dia_pago: fecha,
                pagos_hechos: pagoDetail.pagos_hechos+1,
                total_pagos:pagoDetail.total_pagos,
                estatus: pagoDetail.pagos_hechos + 1 >=pagoDetail.total_pagos ? 2 : 1
            });
            pagoDetail.pagos_hechos+=1;
            const newMovimiento = movimientogrupal.create({
                //id_usuario:pagoDetail.id_usuario,
                //id_pago:newPago.id_pago,
                //no_cuenta:pagoDetail.no_cuenta,
                //descripcion:pagoDetail.descripcion,
                //monto:pagoDetail.monto,
                //tipo_movimiento:2,
                //fecha: hoy

                id_usuario:pagoDetail.id_usuario,
                id_grupo:pagoDetail.id_grupo,
                id_pago:newPago.id_pago,
                no_cuenta:pagoDetail.no_cuenta,
                descripcion:pagoDetail.descripcion,
                monto:pagoDetail.monto,
                tipo_movimiento:2,
                fecha: hoy
            });
            if(pagoDetail.pagos_hechos >= pagoDetail.total_pagos){
                pagoDetail.estatus_pago=2
            }
            await pagoDetail.save();
            //await pago.save();
            console.log(`Pago atrasado con monto ${pagoDetail.monto} aplicado a cuenta ${pagoDetail.no_cuenta} para el usuario ${pagoDetail.id_usuario}`);
            await pagospendientesgrupos.destroy({
                where:{
                    id_pago_programado: pago.id_pago_pendiente
                }
            });
            
        }
    }catch(error){
        console.log("Error aplicando pago pendiente ", error);
    }
}

const updPagoGruProgramado = async(req: Request, res:Response)=>{
    try{
        //Obtenemos Id del Usuario
        const userId = (req as any).user.id;
        
        //Obtenemos el ID del pago
        const {pagoProgramadoId} = req.params;

        //Obtenemos los datos del pago que se modificaran
        const {grupo, no_cuenta,descripcion, monto, categoria, subcategoria, dia_pago, total_pagos}=req.body;

        const isActivo = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario:  userId,
                id_estatus: 1
            }
        });
        if(!isActivo){
            return res.status(500).json({message:'Este user no esta activo'});
        }
        const currentDate = new Date();
        const grupoFound = await grupos.findByPk(grupo);
        if(!grupoFound){
            return res.status(404).json({message:'Grupo no encontrado'});
        }
        const isMiembro = await miembros.findOne({
            where:{
                id_grupo: grupo,
                id_usuario: userId
            }
        });
        if(!isMiembro){
            return res.status(401).json({messge:'No tienes acceso a este grupo'});
        }
        //Obtenemos el pago a modificar
        const pagoFound = await pagogrupalprogramado.findOne({
            where:{
                id_pago: pagoProgramadoId,
                id_usuario: userId,
                id_grupo: grupo
            }
        });
        if(!pagoFound){
            return res.status(404).json({message:'Pago no encontrado'});
        }
        //const isValid = await subcategory.findOne({
        //    where:{
        //        id_categoria:categoria,
        //        id_negocio:subcategoria
        //    }
        //});
        //if(!isValid){
        //    return res.status(404).json({message:'Subcategoria no asignada a categoria'});
        //}

        //Calculamos la diferencia de Dinero (en caso de haberla)
        //                          
        const totalPagadoViejo = pagoFound.pagos_hechos * pagoFound.monto; //5k
        const totalPagadoNuevo = total_pagos * monto; //

        const diferencia = totalPagadoViejo - totalPagadoNuevo;

        if(diferencia>0){
            grupoFound.fondos += diferencia;
            await grupoFound.save();

            //Creamos movimiento en la tabla de movimientos
            const newMovimiento = await movimientogrupal.create({
                id_grupo: grupo,
                id_usuario: userId,
                id_pago: 0,
                no_cuenta: no_cuenta,
                descripcion: 'Ajuste de Pago - Reembolso',
                monto: diferencia,
                tipo_movimiento: 3,
                fecha: currentDate
            });
            if(pagoFound.pagos_hechos >= total_pagos){
                pagoFound.estatus_pago=2;
                //console.log("Estatus del pago");
                //console.log(pagoFound.estatus_pago);
                pagoFound.save();
            }
            await pagoFound.save();
        }
        if(diferencia<0){
            const totalDebido = Math.abs(diferencia);

            const pagosPendientes = total_pagos - pagoFound.pagos_hechos;
            if(pagosPendientes>0){
                const extraPerPago = totalDebido/pagosPendientes;
                pagoFound.monto = monto + extraPerPago;
                await pagoFound.save();
            }
        }
        pagoFound.monto = monto || pagoFound.monto;
        pagoFound.no_cuenta = no_cuenta || pagoFound.no_cuenta;
        pagoFound.categoria = categoria || pagoFound.categoria;
        pagoFound.subcategoria = subcategoria || pagoFound.subcategoria;
        pagoFound.dia_programado = dia_pago || pagoFound.dia_programado;
        pagoFound.descripcion = descripcion || pagoFound.descripcion;
        pagoFound.total_pagos = total_pagos || pagoFound.total_pagos;
        await pagoFound.save();
        return res.status(200).json({message:'Pago actualizado'});
    }catch(error){
        console.log(error);
        return res.status(500).json({message:'ERROR ACUTUALIZANDO PAGO PROGRAMADO'});
    }
}
export {addPagoProgramadoGrupal,addPagoGrupal, updatePagoGrupal, reembolsoGrupal, getPagosGrupales, getPagosGrupalesByCategory, getPagosGrupalesBySubcategory, getPagosGrupalesByCatandSub, applyGruProgrammedPagos, applyGruPendientesPagos, updPagoGruProgramado};
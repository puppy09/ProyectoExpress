import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model"; // Ensure this is correctly imported
//import { error } from "console";
import { category } from "../models/category.model";
import { tipospagos } from "../models/tipo_pagos.model";
import { estatuspagos } from "../models/estatus_pagos.model";
import { pagos } from "../models/pagos.model";
//import moment from 'moment';
//import { DATE } from "sequelize";
import { subcategory } from "../models/subcategory.model";
import { negocio } from "../models/negocio.model";
//import { syncBuiltinESMExports } from "module";
import { findingUser } from "../utils/userFound.handle";
import { pagosprogramados } from "../models/pagosprogramados.model";
import { movimiento } from "../models/movimientos.model";
import { pagospendientes } from "../models/pagospendientes.model";

const postPago = async(req: Request, res:Response)=>{  
    try{
        //Obtenemos id del usuario
            const userId = (req as any).user.id;

            //Obtenemos Parametros del pago
            const {num_cuenta, descripcion, monto, categoria, subcategoria, tipo_pago, dia_pago, total_pagos} = req.body;
            

            // Validate existence of user
            if(!findingUser(userId)){
                return res.status(404).json({message:'Usuario no encontrado'});
            }

            //Validar Existencia de Cuenta y que pertenezca al usuario
            const cuentaFound = await cuenta.findOne({
                where:{
                    no_cuenta: num_cuenta,
                    id_usuario: userId
                }
            })
            if(!cuentaFound){
                return res.status(404).json({message: 'Cuenta no encontrada o no pertenece al usuario'});
            }

            //Validar Existencia Categoria
            const categoryFound = await category.findByPk(categoria);
            if(!categoryFound){
                return res.status(404).json({ message: 'Categoria no encontrada' });
            }

            const isValid = await subcategory.findOne({
                where:{
                    id_categoria:categoria,
                    id_negocio:subcategoria
                }
            });
            if(!isValid){
                return res.status(404).json({message:'Subcategoria no asignada a categoria'});
            }

            //Validar Tipo de Pago
            const tipoPagoFound = await tipospagos.findByPk(tipo_pago);
            if(!tipoPagoFound){
                return res.status(404).json({message: 'Tipo Pago invalido'});
            }

            //Si no se ingresa un monto valido
            if (!monto || isNaN(monto) || monto<=0) {
                return res.status(400).json({ message: 'Cantidad inválida' });
            }
            if(cuentaFound.saldo<monto){
                return res.status(500).json({message:'Error aplicando pago, saldos insuficientes'});
            }

            //Obtenemos Fecha
            const currentDate: Date = new Date();

            //En caso de que sea un pago de unica exhibicion
            //Obtenemos la fecha del dia en el que se haga la compra
            //Solo se hara un pago
            var numPagosHechos;
            var numPagoTotales;
            var auxEstatusPago;
            var dia;

            if (tipo_pago == 2){
                //La fecha de pago sera la brindada por el usuario
                dia = dia_pago;
                numPagosHechos = 0;
                numPagoTotales = total_pagos;
                auxEstatusPago = 1 

                const newProgrammedPago = await pagosprogramados.create({
                    id_usuario: userId,
                    no_cuenta: num_cuenta,
                    descripcion: descripcion,
                    monto:monto,
                    categoria:categoria,
                    subcategoria:subcategoria,
                    tipo_pago: tipo_pago,
                    dia_programado: dia,
                    pagos_hechos: numPagosHechos,
                    total_pagos: numPagoTotales,
                    estatus_pago: auxEstatusPago
                });
                return res.status(201).json({
                    message: 'Pago programado con exito',
                    pago:newProgrammedPago
                });
            }
            //Valores por default en caso de que no entre al if (pago periodico)
            //numPagosHechos = numPagosHechos || 1;
            //numPagoTotales = numPagoTotales || 1;
            //auxEstatusPago = auxEstatusPago || 2;
   
            dia = dia || currentDate.getDate();
            //Si es un pago que sea por por abonos
            const newPago = await pagos.create({
                id_usuario: userId,
                no_cuenta: num_cuenta,
                descripcion: descripcion,
                monto: monto,
                categoria: categoria,
                subcategoria: subcategoria,
                tipo_pago: tipo_pago,
                fecha: currentDate,
                //dia_pago: dia,
                pagos_hechos: 1,
                total_pagos: 1,
                estatus_pago: 2
            });

            cuentaFound.saldo = cuentaFound.saldo-monto;
            cuentaFound.save();
            const newMovimiento = await movimiento.create({
                id_usuario:userId,
                id_pago:newPago.id_pago,
                no_cuenta:num_cuenta,
                descripcion:descripcion,
                monto:monto,
                tipo_movimiento:2,
                fecha: currentDate
            });
            return res.status(201).json(newPago);
        }catch(error){
            console.log(error);
        handleHttp(res, 'Error Posting Pago'); // Handle error properly
    }
}

const updatePago = async(req:Request, res:Response)=>{
    try{
        //Obtenemos Id del Usuario
        const userId = (req as any).user.id;
        
        //Obtenemos el ID del pago
        const {pagoId} = req.params;

        //Obtenemos los datos del pago que se modificaran
        const {no_cuenta,descripcion, monto, categoria, subcategoria, dia_pago}=req.body;

        //Obtenemos cuenta del usuario
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: no_cuenta,
                id_usuario: userId
            }
        });
        if(!cuentaFound){
            return res.status(404).json({message:'Cuenta no encontrada o no pertenece al usuario'});
        }

        // Fetch the payment by its ID
        const pagoFound = await pagos.findOne({
            where:{
                id_pago: pagoId,
                id_usuario: userId
            }
        });

        if (!pagoFound) {
            return res.status(404).json({ message: 'Pago no encontrado o no pertenece a este usuario' });
        }
        const isValid = await subcategory.findOne({
            where:{
                id_categoria:categoria,
                id_negocio:subcategoria
            }
        });
        if(!isValid){
            return res.status(404).json({message:'Subcategoria no asignada a categoria'});
        }

        const paymentDate = new Date(pagoFound.fecha);

        const currentDate = new Date();
        const isSameMonth = paymentDate.getMonth() === currentDate.getMonth() && 
        paymentDate.getFullYear() === currentDate.getFullYear();
        
        if (!isSameMonth) {
            return res.status(403).json({ message: 'No se puede modificar un pago que no sea del mes actual' });
        }
        //Si no se ingresa un monto valido
        if (!monto || isNaN(monto) || monto<=0) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }
        if(pagoFound.monto > monto){
            const auxDiferencia = pagoFound.monto-monto;
            cuentaFound.saldo += auxDiferencia;
            cuentaFound.save();
            const newMovimiento = await movimiento.create({
                id_usuario:userId,
                id_pago:0,
                no_cuenta:cuentaFound.no_cuenta,
                descripcion:"Ajuste de pago - Reembolso",
                monto:auxDiferencia,
                tipo_movimiento:3,
                fecha: currentDate
            });
        }
        else if(pagoFound.monto < monto){
            const auxDiferencia = monto - pagoFound.monto;
            cuentaFound.saldo -= auxDiferencia;
            cuentaFound.save();
            const newMovimiento = await movimiento.create({
                id_usuario:userId,
                id_pago:0,
                no_cuenta:cuentaFound.no_cuenta,
                descripcion:"Ajuste de pago",
                monto:auxDiferencia,
                tipo_movimiento:1,
                fecha: currentDate
            });

        }
        pagoFound.no_cuenta = no_cuenta || pagoFound.no_cuenta;
        pagoFound.monto = monto || pagoFound.monto;
        pagoFound.descripcion = descripcion || pagoFound.descripcion;
        pagoFound.categoria = categoria || pagoFound.categoria;
        pagoFound.subcategoria = subcategoria || pagoFound.subcategoria;
        
        //pagoFound.dia_pago = dia_pago || pagoFound.dia_pago;

        pagoFound.save();
        return res.status(200).json(pagoFound);

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'});
    }
}
const updatePagoProgramado = async(req:Request, res:Response)=>{
    try{
        //Obtenemos Id del Usuario
        const userId = (req as any).user.id;
        
        //Obtenemos el ID del pago
        const {pagoProgramadoId} = req.params;

        //Obtenemos los datos del pago que se modificaran
        const {no_cuenta,descripcion, monto, categoria, subcategoria, dia_pago, total_pagos}=req.body;

        const currentDate = new Date();
        //Obtenemos la cuenta
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: no_cuenta,
                id_usuario: userId
            }
        });
        if(!cuentaFound){
            return res.status(404).json({messge:'Esta cuenta no existe o no pertenece al usuario'});
        }
        //Obtenemos el pago a modificar
        const pagoFound = await pagosprogramados.findOne({
            where:{
                id_pagoprogramado: pagoProgramadoId,
                id_usuario: userId
            }
        });
        if(!pagoFound){
            return res.status(404).json({message:'Pago no encontrado'});
        }
        const isValid = await subcategory.findOne({
            where:{
                id_categoria:categoria,
                id_negocio:subcategoria
            }
        });
        if(!isValid){
            return res.status(404).json({message:'Subcategoria no asignada a categoria'});
        }

        //Calculamos la diferencia de Dinero (en caso de haberla)
        //                          
        const totalPagadoViejo = pagoFound.pagos_hechos * pagoFound.monto;
        const totalPagadoNuevo = total_pagos * monto;

        const diferencia = totalPagadoViejo - totalPagadoNuevo;

        if(diferencia>0){
            cuentaFound.saldo += diferencia;
            await cuentaFound.save();

            //Creamos movimiento en la tabla de movimientos
            const newMovimiento = await movimiento.create({
                id_usuario: userId,
                id_pago: 0,
                no_cuenta: cuentaFound.no_cuenta,
                descripcion: 'Ajuste de Pago - Reembolso',
                monto: diferencia,
                tipo_movimiento: 3,
                fecha: currentDate
            });
            if(pagoFound.pagos_hechos >= total_pagos){
                pagoFound.estatus_pago=2;
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
        pagoFound.save();
        return res.status(200).json({message:'Pago actualizado'});

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Error actualizando pagos'});
    } 
}
//Obtener todos los pagos que ha hecho un Usuario
const getPagos = async(req:Request, res:Response)=>{
    try{
        const userId = (req as any).user.id;
        
        const allPagos = await pagos.findAll({
            where:{
                id_usuario: userId
            },
            include: [
                {
                    model: category,
                    attributes: ['nombre'], // Specify the attributes you want to retrieve from Category
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
            ]
        })
        if((await allPagos).length===0){
            return res.status(404).json({message: 'No se encontraron pagos a nombre de este user'});
        }
        console.log(allPagos);
        return res.status(200).json(allPagos);

    }catch(error){
        return res.status(500).json({message: 'Error obteniendo pagos ', error});
    }
}
const getPagosProgramados = async(req:Request, res:Response)=>{
    try{
        const userId = (req as any).user.id;
        
        const allPagos = await pagosprogramados.findAll({
            where:{
                id_usuario: userId
            },
            include: [
                {
                    model: category,
                    attributes: ['nombre'], // Specify the attributes you want to retrieve from Category
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
            ]
        });

        if(allPagos.length===0){
            return res.status(404).json({message:'Este user aun no ha programado ningun pago'});
        }
        return res.status(201).json(allPagos);
    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Error obteniendo pagos programados"});
    }
}
const getSinglePago = async(req:Request, res:Response)=>{
    try{
        const userId = (req as any).user.id;
        const {pagoId} = req.params;
        const singlePagos = await pagos.findOne({
            where:{
                id_usuario: userId,
                id_pago: pagoId
            },
            include: [
                {
                    model: category,
                    attributes: ['nombre'], // Specify the attributes you want to retrieve from Category
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
            ]
        });
        if(!singlePagos){
            return res.status(404).json({mesage:'Pago no encontrado o no pertenece al usuario'});
        }
        console.log(singlePagos);
        return res.status(200).json(singlePagos);
    }catch(error){
        return res.status(500).json({message:'Error obteniendo pago ', error});
    }
}

const getPagosCategory = async(req:Request, res:Response)=>{
    try{
        const userId = (req as any).user.id;
        const {categoryId} = req.params;
        const categoryFound = await category.findOne({
            where:{
                ID: categoryId
            }
        });
        if(!categoryFound){
            return res.status(404).json({message:'Categoria no encontrada o no existe'});
        }
        
        const pagosCategory = await pagos.findAll({
            where:{
                id_usuario: userId,
                categoria: categoryId 
            },
            include: [
                {
                    model: category,
                    attributes: ['nombre'], // Specify the attributes you want to retrieve from Category
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
            ]
        });
        if(pagosCategory.length===0){
            return res.status(404).json({message:'Este usuario aun no tiene cargos de esta categoria'});
        }
        return res.status(200).json(pagosCategory);
                

    }catch(error){
        return res.status(500).json({message:'Error obteniendo pago ', error});
    }
}

const getPagosSubcategory = async(req:Request, res:Response)=>{
    try{
        const userId = (req as any).user.id;
        const {subcategoryId} = req.params;
        const subcategoryFound = await negocio.findOne({
            where:{
                id_negocio: subcategoryId
            }
        });
        if(!subcategoryFound){
            return res.status(404).json({message:'Subcategoria no encontrada o no existe'});
        }

        const pagosSubcategory = await pagos.findAll({
            where:{
                id_usuario: userId,
                subcategoria: subcategoryId 
            },
            include: [
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
            ]
        });
        if(pagosSubcategory.length===0){
            return res.status(404).json({message:'Este usuario aun no tiene cargos de esta subcategoria'});
        }
        return res.status(200).json(pagosSubcategory);
    }catch(error){
        return res.status(500).json({message:'Error obteniendo pagos ', error});
    }
}
const getPagosCatSub = async(req:Request, res:Response)=>{
    try{
        const userId = (req as any).user.id;
        const {categoryId, subcategoryId} = req.params;
        
        const subcategoryFound = await negocio.findOne({
            where:{
                id_negocio: subcategoryId
            }
        });
        if(!subcategoryFound){
            return res.status(404).json({message:'Subcategoria no encontrada o no existe'});
        }

        const categoryFound = await category.findOne({
            where:{
                ID: categoryId
            }
        });
        if(!categoryFound){
            return res.status(404).json({message:'Categoria no encontrada o no existe'});
        }

        const pagosSubcategory = await pagos.findAll({
            where:{
                id_usuario: userId,
                subcategoria: subcategoryId,
                categoria: categoryId 
            },
            include: [
                {
                    model: category,
                    attributes: ['nombre']
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
            ]
        });
        if(pagosSubcategory.length===0){
            return res.status(404).json({message:'Este usuario aun no tiene cargos de esta subcategoria'});
        }
        return res.status(200).json(pagosSubcategory);

    }catch(error){
        return res.status(500).json({message:'Error obteniendo pagos ', error});
    }
}
const applyProgrammedPagos = async()=>{
    const hoy = new Date();
    const dia= hoy.getDate();
    try{
        const pagosToApply = await pagosprogramados.findAll({
            where:{
                dia_programado: dia,
                estatus_pago:1
            }
        });
        if(pagosToApply.length===0){
            console.log("No hay pagos para aplicar hoy");
        }
        console.log(pagosToApply);
        for(const pago of pagosToApply){
            const {id_usuario, no_cuenta, descripcion, categoria, subcategoria, monto, pagos_hechos, total_pagos} = pago;

            const cuentaFound = await cuenta.findOne({
                where:{
                    no_cuenta: no_cuenta
                }
            });
            if(cuentaFound){
                if(cuentaFound.saldo<monto){
                    console.log(`Fondos Insuficientes en cuenta ${no_cuenta} para el usuario${id_usuario}, sera agendado como pago pendiente`);
                    const pagoPendiente = await pagospendientes.create({
                        id_pagoprogramado: pago.id_pagoprogramado
                    });
                    continue;
                }
                cuentaFound.saldo -= monto;
                await cuentaFound.save();
            }
            else{
                console.log(`Cuenta ${no_cuenta}, no encontrada`);
            }
            const categoryFound = await category.findByPk(categoria);
            if(!categoryFound){
                console.log("No existe esta categoria");
                return;
            }
            const currentDate: Date = new Date();
            const fecha = currentDate.getDate();
            const newPago = await pagos.create({
                id_usuario:id_usuario,
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
                estatus_pago: pagos_hechos + 1 >=total_pagos ? 2 : 1
            });
            pago.pagos_hechos+=1;
            const newMovimiento = await movimiento.create({
                id_usuario:id_usuario,
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

const applyPagosPendientes = async()=>{
    const hoy = new Date();
    const dia= hoy.getDate();
    try{
        const pagosPendientesApply = await pagospendientes.findAll();
        if(pagosPendientesApply.length===0){
            console.log("No hay pagos pendientes para aplicar");
            return;
        }
        for(const pago of pagosPendientesApply){
            const {id_pagoprogramado} = pago;

            const pagoDetail = await pagosprogramados.findByPk(id_pagoprogramado);
            if(!pagoDetail){
                console.log("Cuenta no encontrada");
                continue;
            }
            const cuentaFound = await cuenta.findOne({
                where:{
                    no_cuenta: pagoDetail.no_cuenta
                }
            });
            if(!cuentaFound){
                console.log("Cuenta no encontrada");
                continue;
            }
            if(cuentaFound.saldo<pagoDetail.monto){
                console.log('Saldos insuficientes');
                continue;
            }
            const categoryFound = await category.findByPk(pagoDetail.categoria);
            if(!categoryFound){
                console.log("categoria no encontrada");
                continue;
            }
            cuentaFound.saldo -= pagoDetail.monto;

            const newPago = await pagos.create({
                id_usuario:pagoDetail.id_usuario,
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
                estatus_pago: pagoDetail.pagos_hechos + 1 >=pagoDetail.total_pagos ? 2 : 1
            });
            pagoDetail.pagos_hechos+=1;
            const newMovimiento = movimiento.create({
                id_usuario:pagoDetail.id_usuario,
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
            await pagospendientes.destroy({
                where:{
                    id_pagoprogramado: pago.id_pagopendiente
                }
            });
            
        }
    }catch(error){
        console.log("Error aplicando pago pendiente ", error);
    }
}
const reemboslarPago = async(req:Request, res:Response)=>{
    try{
        //Obtenemos Id del Usuario
        const userId = (req as any).user.id;
        if(!findingUser){
            return res.status(404).json({message:'El user no ha sido encontrado'});
        }
        const {id_pago} = req.params;
        const pagoFound = await pagos.findByPk(id_pago);

        if(!pagoFound){
            return res.status(404).json({message:'Pago no encontrado'});
        }

        if(pagoFound.estatus_pago===3){
            return res.status(500).json({message:'Este pago ya ha sido reembolsado'});
        }
        
        //Validamos antigüedad del movimiento
        const paymentDate = new Date(pagoFound.fecha);
        const auxFecha = new Date();

        const isSameMonth = paymentDate.getMonth()===auxFecha.getMonth() && paymentDate.getFullYear()===auxFecha.getFullYear();
        if(!isSameMonth){
            return res.status(500).json({message:'Este movimiento es demasiado antiguo para ser reembolsado'});
        }
        pagoFound.estatus_pago=3;
        pagoFound.save();
        //Abonamos el dinero a la cuenta
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: pagoFound.no_cuenta
            }
        });

        if(!cuentaFound){
            return res.status(404).json({message:'Cuenta no encontrada'});
        }
        cuentaFound.saldo += pagoFound.monto;
        cuentaFound.save();
        //Creamos el movimiento
        const currentDate: Date = new Date();
        const newMovimiento = await movimiento.create({
            id_usuario:userId,
            id_pago:0,
            no_cuenta:cuentaFound.no_cuenta,
            descripcion:"Reembolso de pago",
            monto:pagoFound.monto,
            tipo_movimiento:3,
            fecha: currentDate
        });
        return res.status(200).json({message:'El pago ha sido reembolsado con éxito'});

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Error reembolsando pago'});
    }
};
export{postPago, updatePago, getPagos, getSinglePago, getPagosCategory, getPagosSubcategory, getPagosCatSub, applyProgrammedPagos, reemboslarPago, getPagosProgramados, updatePagoProgramado, applyPagosPendientes}
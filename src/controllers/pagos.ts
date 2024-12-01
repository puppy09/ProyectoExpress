import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model";
import { category } from "../models/category.model";
import { tipospagos } from "../models/tipo_pagos.model";
import { estatuspagos } from "../models/estatus_pagos.model";
import { pagos } from "../models/pagos.model";
import { subcategory } from "../models/subcategory.model";
import { negocio } from "../models/negocio.model";
import { findingUser } from "../utils/userFound.handle";
import { pagosprogramados } from "../models/pagosprogramados.model";
import { movimiento } from "../models/movimientos.model";
import {Op} from 'sequelize';
import { corteMensual } from "../models/corteMensual.model";

//Post Pago
const postPago = async(req: Request, res:Response)=>{  
    try{
        //Obtenemos id del usuario
            const userId = (req as any).user.id;

            //Obtenemos Parametros del pago
            const {num_cuenta, descripcion, monto, categoria, subcategoria} = req.body;

            console.log(num_cuenta); 
            console.log('Received payment request:', req.body);

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

            const auxMonto=parseFloat(monto);
            console.log()
            //Si no se ingresa un monto valido
            if (auxMonto<=0) {
                return res.status(400).json({ message: 'Cantidad inválida' });
            }
            if(cuentaFound.saldo<monto){
                return res.status(500).json({message:'Saldos insuficientes'});
            }

            //Obtenemos Fecha
            const currentDate: Date = new Date();
            const newPago = await pagos.create({
                id_usuario: userId,
                no_cuenta: num_cuenta,
                descripcion: descripcion,
                monto: monto,
                categoria: categoria,
                subcategoria: subcategoria,
                tipo_pago: 1,
                fecha: currentDate,
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

//Post pago Programado
const postPagoProgramado = async(req:Request, res:Response)=>{
    try {
        console.log("programando pago");
        const userId = (req as any).user.id;
        const {num_cuenta, descripcion, monto, categoria, subcategoria, dia_pago, total_pagos} = req.body;
        const auxMonto = parseFloat(monto);
        const currentDate: Date = new Date();
        const newProgrammedPago = await pagosprogramados.create({
            id_usuario: userId,
            no_cuenta: num_cuenta,
            descripcion: descripcion,
            monto:auxMonto,
            categoria:categoria,
            subcategoria:subcategoria,
            tipo_pago: 2,
            dia_programado: dia_pago,
            pagos_hechos: 0,
            total_pagos: total_pagos,
            estatus_pago: 1,
            fecha: currentDate
        });
        return res.status(201).json({
            message: 'Pago programado con exito',
            pago:newProgrammedPago
        });

    } catch (error) {
        console.log("error programando pago", error);
        return res.status(500).json({message:"ERROR PROGRAMANDO PAGO"});
    }
}

//Update Pago
const updatePago = async(req:Request, res:Response)=>{
    try{
        //Obtenemos Id del Usuario
        const userId = (req as any).user.id;
        
        //Obtenemos el ID del pago
        const {pagoId} = req.params;

        //Obtenemos los datos del pago que se modificaran
        const {no_cuenta,descripcion, monto, categoria, subcategoria}=req.body;

        //Obtenemos cuenta del usuario
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: no_cuenta
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

        const paymentDate = new Date(pagoFound.fecha);

        const currentDate = new Date();
        const isSameMonth = paymentDate.getMonth() === currentDate.getMonth() && 
        paymentDate.getFullYear() === currentDate.getFullYear();
        
        if (!isSameMonth) {
            return res.status(500).json({ message: 'No se puede modificar un pago que no sea del mes actual' });
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
                descripcion:`Ajuste de monto de pago con ID ${pagoFound.id_pago}`,
                monto:auxDiferencia,
                tipo_movimiento:2,
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

        const auxMov = await movimiento.findOne({
            where:{
                id_pago:pagoId
            }
        });
        if(!auxMov){
            return res.status(404).json({message:'Movimiento no encontrado'});
        }
        auxMov.monto=monto||auxMov.monto;
        auxMov.descripcion = descripcion || auxMov.descripcion;
        auxMov.save();
        return res.status(200).json(pagoFound);

    }catch(error){
        console.log(error);
        return res.status(500).json(error);
    }
}

//Update a pago programado
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
                no_cuenta: no_cuenta
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

//Get total gastado en el mes
const getTotalGastado = async(req:Request, res:Response)=>{
    try {

        const userId = (req as any).user.id;
        
        const startMes = new Date(new Date().getFullYear(), new Date().getMonth(),1);
        const startMesSig = new Date(new Date().getFullYear(), new Date().getMonth()+1,1);
        let totalMonto = '';
        const auxMonto = await pagos.sum('monto',{
            where:{
                id_usuario: userId,
                fecha: {
                    [Op.gte]: startMes,
                    [Op.lt]: startMesSig
                }
            }});
            if(auxMonto){
                totalMonto = auxMonto.toFixed(2);
            }
            else{
                totalMonto = '0';
            }
        return res.status(200).json({totalMonto});
    } catch (error) {
        console.log("ERROR OBTENIENDO SUMA MENSUAL", error);
        return res.status(500).json({message: 'Error obteniendo suma gastada'});
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
            ],
            order:[
                ['fecha', 'DESC']
            ]
        })
        if((await allPagos).length===0){
            return res.status(404).json({message: 'No se encontraron pagos a nombre de este user'});
        }
        return res.status(200).json(allPagos);

    }catch(error){
        return res.status(500).json({message: 'Error obteniendo pagos ', error});
    }
}

//Get de Pagos Programados
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
            ],
            order:[
                ['fecha', 'DESC']
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

//Get un solo pago
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
                    attributes: ['nombre'],
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


//Get pagos por Categoria
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

//Get pagos por Subcategoria
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

//Get pagos por categoria y subcategoria
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

//Aplicar Pagos programados
const applyProgrammedPagos = async()=>{
    const hoy = new Date();
    const dia= hoy.getDate();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth();

    const getLastDayOfMonth = (year: number, month: number)=>{
        return new Date(year, month +1, 0).getDate();
    }

    try{

        const lastDayOfCurrentMonth = getLastDayOfMonth(anioActual, mesActual);

        const pagosToApply = await pagosprogramados.findAll({
            where:{
                [Op.or]:[
                    {dia_programado: dia},
                    {dia_programado: {[Op.gt]: lastDayOfCurrentMonth}},
                ],
                //dia_programado: dia,
                estatus_pago:1
            }
        });
        if(pagosToApply.length===0){
            console.log("No hay pagos para aplicar hoy");
        }
        //console.log(pagosToApply);
        for(const pago of pagosToApply){
            let {id_usuario, no_cuenta, descripcion, categoria, subcategoria, monto, pagos_hechos, total_pagos, dia_programado} = pago;

            if(dia_programado > lastDayOfCurrentMonth){
                dia_programado=lastDayOfCurrentMonth;
            }

            if(dia_programado!== dia) continue;
            const cuentaFound = await cuenta.findOne({
                where:{
                    no_cuenta: no_cuenta
                }
            });
            if(cuentaFound){
                cuentaFound.saldo -= monto;
                await cuentaFound.save();
            }
            else{
                console.log(`Cuenta ${no_cuenta}, no encontrada`);
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

//Reembolsar Pago
const reemboslarPago = async(req:Request, res:Response)=>{
    try{
        //Obtenemos Id del Usuario
        const userId = (req as any).user.id;
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

//Pagos Por  Cuenta
const getPagosByCuenta = async(req: Request, res:Response)=>{
    try {
        const userID = (req as any).user.id;
        const {noCuenta} = req.body;

        const pagosFound = await pagos.findAll({
            where:{
                no_cuenta: noCuenta
            },
            include:[
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
        return res.status(200).json(pagosFound);
    } catch (error) {
        console.log("Error obteniendo pagos por no de cuenta", error);
        return res.status(500).json({message:"ERROR OBTENIENDO PAGOS POR NO DE CUENTA"});
    }
}

export{getTotalGastado,postPago, postPagoProgramado, updatePago, getPagos, getSinglePago, getPagosCategory, getPagosSubcategory, getPagosCatSub, applyProgrammedPagos, reemboslarPago, getPagosProgramados, updatePagoProgramado, getPagosByCuenta}
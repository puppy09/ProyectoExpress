import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model"; // Ensure this is correctly imported
import { error } from "console";
import { category } from "../models/category.model";
import { tipospagos } from "../models/tipo_pagos.model";
import { estatuspagos } from "../models/estatus_pagos.model";
import { pagos } from "../models/pagos.model";
import moment from 'moment';
import { DATE } from "sequelize";
import { subcategory } from "../models/subcategory.model";
import { negocio } from "../models/negocio.model";

const postPago = async(req: Request, res:Response)=>{  
    try{
        //Obtenemos id del usuario
            const userId = (req as any).user.id;

            //Obtenemos Parametros del pago
            const {num_cuenta, descripcion, monto, categoria, subcategoria, tipo_pago, dia_pago, total_pagos, estatus_pago} = req.body;
            

            // Validate existence of user
            const userFound = await user.findByPk(userId);
            if (!userFound) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
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

            //Validar Tipo de Pago
            const tipoPagoFound = await tipospagos.findByPk(tipo_pago);
            if(!tipoPagoFound){
                return res.status(404).json({message: 'Tipo Pago invalido'});
            }

            //Validar Estatus de pago
            /*const estatusPago = await estatuspagos.findByPk(estatus_pago);
            if(!estatusPago){
                return res.status(404).json({message:'Estatus de Pago invalido'});
            }*/

            //Validar que el monto no sea mayor la cantidad con la que cuenta en la cuenta asociada
            /*const saldoCuenta = await cuenta.findOne({
                where:{
                    no_cuenta: num_cuenta,
                    id_usuario: userId
                }
            });*/
            /*if(!saldoCuenta){
                return res.status(500).json({message:'Error'});
            }*/

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

            //Si es un pago de unica exibicion
            /*if(tipo_pago == 1){
                const dia: number = currentDate.getDate();
                 numPagosHechos = 1;
                 numPagoTotales = 1;
                 auxEstatusPago = 2;
            }*/

            if (tipo_pago == 2){
                //La fecha de pago sera la brindada por el usuario
                dia = dia_pago;
                numPagosHechos = 1;
                numPagoTotales = total_pagos;
                auxEstatusPago = 1 
            }
            //Valores por default en caso de que no entre al if (pago periodico)
            numPagosHechos = numPagosHechos || 1;
            numPagoTotales = numPagoTotales || 1;
            auxEstatusPago = auxEstatusPago || 2;
   
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
                dia_pago: dia,
                pagos_hechos: numPagosHechos,
                total_pagos: numPagoTotales,
                estatus_pago: auxEstatusPago

            });

            cuentaFound.saldo = cuentaFound.saldo-monto;
            cuentaFound.save();
            return res.status(201).json(newPago);
        }catch(error){
        handleHttp(res, 'ERROR_POSTING_PAGO'); // Handle error properly
    }
}

const updatePago = async(req:Request, res:Response)=>{
    try{
        //Obtenemos Id del Usuario
        const userId = (req as any).user.id;
        
        //Obtenemos el ID del pago
        const {pagoId} = req.params;

        //Obtenemos los datos del pago que se modificaran
        const {descripcion, monto, categoria, subcategoria, estatus_pago, tipo_pago, dia_pago}=req.body;

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
            return res.status(403).json({ message: 'No se puede modificar un pago que no sea del mes actual' });
        }
        //Si no se ingresa un monto valido
        if (!monto || isNaN(monto) || monto<=0) {
            return res.status(400).json({ message: 'Cantidad inválida' });
        }
        pagoFound.descripcion = descripcion || pagoFound.descripcion;
        pagoFound.categoria = categoria || pagoFound.categoria;
        pagoFound.subcategoria = subcategoria || pagoFound.subcategoria;
        pagoFound.tipo_pago = tipo_pago || pagoFound.tipo_pago;
        pagoFound.dia_pago = dia_pago || pagoFound.dia_pago;

        pagoFound.save();
        return res.status(200).json(pagoFound);

    }catch(error){
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'});
    }
}

const deletePago = async(req:Request, res:Response)=>{
    try{
        const userId = (req as any).user.id;

         //Obtenemos el ID del pago
         const {pagoId} = req.params;

         //Buscamos el pago que coincida y pertenezca al usuario
         const pagoFound = await pagos.findOne({
            where:{
                id_pago: pagoId,
                id_usuario: userId
            }
        });

        //Si el pago no se encuentra
        if (!pagoFound) {
            return res.status(404).json({ message: 'Pago no encontrado o no pertenece a este usuario' });
        }

        const paymentDate = new Date(pagoFound.fecha);

        const currentDate = new Date();
        const isSameMonth = paymentDate.getMonth() === currentDate.getMonth() && 
        paymentDate.getFullYear() === currentDate.getFullYear();
        
        if (!isSameMonth) {
            return res.status(403).json({ message: 'No se puede modificar un pago que no sea del mes actual' });
        }
        
        //Reembolsamos dinero del pago a la cuenta de donde se desconto
        const cuentaFound = await cuenta.findOne({
            where:{
                no_cuenta: pagoFound.no_cuenta
            }
        });
        if(!cuentaFound){
            return res.status(500).json({message:'Esto no tendria porque pasar pero si no lo pongo no le gusta a typescript, esto sale porque no se encontro la cuenta para reemboslar'});
        }

        let auxCurrentSaldo = cuentaFound.saldo;
        let auxNewSaldo = auxCurrentSaldo + pagoFound.monto;
        cuentaFound.saldo = auxNewSaldo;
        cuentaFound.save();
        await pagoFound.destroy();
        return res.status(200).json({message:'El pago ha sido eliminado exitosamente', cuentaFound});
        
    }catch(error){
        console.log('Error eliminando pago ', error);
        return res.status(500).json({message:'Internal Server Error al eliminar pago', error});
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
export{postPago, updatePago, deletePago, getPagos, getSinglePago, getPagosCategory}
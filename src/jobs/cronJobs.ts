import { CronJob } from 'cron';
import { applyPagosPendientes, applyProgrammedPagos } from '../controllers/pagos';
import { applyProgrammedDeposits } from '../controllers/cuentas';

const scheduledPaymentJob = new CronJob('0 0 * * *', () =>{
    console.log('Aplicando pagos programados...');
    applyProgrammedPagos();
    applyProgrammedDeposits();
    console.log('Aplicando pagos pendientes...');
    applyPagosPendientes();
});

export default scheduledPaymentJob;
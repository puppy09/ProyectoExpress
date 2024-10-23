import { CronJob } from 'cron';
import { applyPagosPendientes, applyProgrammedPagos } from '../controllers/pagos';
import { applyProgrammedDeposits } from '../controllers/cuentas';
import { applyGruProgrammedPagos } from '../controllers/pagosGrupos';
import { applyGruPendientesPagos } from '../controllers/pagosGrupos';
import { applyFondosGrupales } from '../controllers/movimientosGrupos';

const scheduledPaymentJob = new CronJob('* * * * *', () =>{
    //console.log('Aplicando pagos programados...');
    //applyProgrammedPagos();
    //applyProgrammedDeposits();
    //console.log('Aplicando pagos pendientes...');
    //applyPagosPendientes();
    //console.log('Aplicando pagos grupales programados...');
    //applyGruProgrammedPagos();
    //console.log('Aplcicando pagos grupales pendientes...');
    //applyGruPendientesPagos();
    applyFondosGrupales();
});

export default scheduledPaymentJob;
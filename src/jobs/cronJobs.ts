import { CronJob } from 'cron';
import { applyProgrammedPagos } from '../controllers/pagos';
import { applyProgrammedDeposits } from '../controllers/cuentas';
import { applyGruProgrammedPagos } from '../controllers/pagosGrupos';
//import { applyGruPendientesPagos } from '../controllers/pagosGrupos';
import { applyFondosGrupales } from '../controllers/movimientosGrupos';

const scheduledPaymentJob = new CronJob('0 0 * * *', () =>{
    //console.log('Aplicando pagos programados...');
    applyProgrammedPagos();
    applyProgrammedDeposits();
    //console.log('Aplicando pagos grupales programados...');
    applyGruProgrammedPagos();
    applyFondosGrupales();
});

export default scheduledPaymentJob;
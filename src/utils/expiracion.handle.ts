export const isFutureDate = (fecha: string): boolean =>{
    const [month, year] = fecha.split("/").map(Number);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear() % 100

    return year > currentYear || (year === currentYear && month >= currentMonth);
};

export const validateFechaExpiracion = (fecha:string): boolean=>{
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if(!regex.test(fecha)){
        return false;
    }

    return isFutureDate(fecha);
}
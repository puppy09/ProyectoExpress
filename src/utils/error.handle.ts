import { Response } from "express";

const handleHttp = (res:Response, error:String) => {
    res.status(500);
    res.send({error});
} 

export {handleHttp};
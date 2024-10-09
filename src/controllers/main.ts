import { Request, Response } from "express";
import { handleHttp } from "../utils/error.handle";
import { user } from "../models/user.model";
import { cuenta } from "../models/cuentas.model"; // Ensure this is correctly imported
import { error } from "console";
import { JwtPayload } from "jsonwebtoken";

interface RequestExt extends Request{
    user?: string | JwtPayload ;
}

const getAll = async (req: RequestExt, res: Response) => {
    try {
        res.send({
            data: 'Pantalla de información financiera',
            user: req.user
        });
    } catch (e) {
        handleHttp(res, "No puedes ver la informacion financiera, no tienes una sesion activa");
    }
}
export{getAll}
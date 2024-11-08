import { Request, Response, Router } from "express";
import { getSelfData, loginCtrl, recoverPsw, registerCtrl } from "../controllers/auth";
import { checkJwt } from "../middleware/session";

const router = Router();
router.get("/", checkJwt, getSelfData);
router.post("/login", loginCtrl);
router.post("/register", registerCtrl);
router.put('/recuperarContra', recoverPsw);

export {router};

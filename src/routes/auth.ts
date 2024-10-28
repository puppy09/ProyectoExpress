import { Request, Response, Router } from "express";
import { loginCtrl, recoverPsw, registerCtrl } from "../controllers/auth";

const router = Router();
router.post("/login", loginCtrl);
router.post("/register", registerCtrl);
router.put('/recuperarContra', recoverPsw);

export {router};

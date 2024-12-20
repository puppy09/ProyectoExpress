import { Router } from "express";
import { readdirSync } from "fs";

const PATH_ROUTES = `${__dirname}`;

const cleanFileName = (fileName: string) => {
    const file = fileName.split('.').shift();
    return file;
}

const router = Router();

readdirSync(PATH_ROUTES).filter((fileName) => {
    const cleanName = cleanFileName(fileName);
    if(cleanName !== 'index') {
        import(`./${cleanName}`).then((moduleRouter) => {
            console.log(`Se esta cargando la ruta:/${cleanName}`);
            router.use(`/${cleanName}`, moduleRouter.router);
        })

    }
})
export { router };
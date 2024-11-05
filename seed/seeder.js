import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";

import db from "../config/db.js";
import {Categoria, Precio, Usuario} from "../models/index.js"

const importarDatos = async () => {
    try {
        //Autenticar
        await db.authenticate();

        //Generar Columnas
        await db.sync();

        //Insertar Datos
        await Promise.all([
            Categoria.bulkCreate(categorias),
            Precio.bulkCreate(precios),
            Usuario.bulkCreate(usuarios)
        ])

        console.log("Datos Importados");
        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }

}

const eliminarDatos = async () => {
    try {

        //Insertar Datos
        db.query("SET FOREIGN_KEY_CHECKS = 0")
        .then(() => {
        return Categoria.truncate();
        })
        .then(() => {
        return Precio.truncate();
        })
        .then(() => {
        return db.query("SET FOREIGN_KEY_CHECKS = 1");
        })
        .then(() => {
        console.log("Datos eliminados correctamente");
        process.exit();
        })

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

if(process.argv[2] === "-i"){
    importarDatos();
}

if(process.argv[2] === "-e"){
    eliminarDatos();
}
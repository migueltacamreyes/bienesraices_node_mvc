import express from "express"
import { body } from "express-validator";
import { admin, agregarImagen, almacenarImagen, crear, editar, eliminar, guardar, guardarCambios, mostrarPropiedad } from "../controllers/propiedaController.js";
import protegerRuta from "../middleware/protegerRuta.js";
import upload from "../middleware/subirimagen.js";
import identificarUsuario from "../middleware/indentificarUsuario.js";



const router = express.Router();

router.get("/mis-propiedades", protegerRuta, admin)
router.get("/propiedades/crear", protegerRuta, crear)
router.post("/propiedades/crear", protegerRuta,
    body('titulo').notEmpty().withMessage("El titulo es Obligatorio"),
    body('descripcion').notEmpty().withMessage("La descripcion es Obligatorio").isLength({ max: 200 }).withMessage('La descripcion es my larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona una precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona cantidad de estacionamiento'),
    body('wc').isNumeric().withMessage('Selecciona cantidad de wc'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el mapa'),
    guardar)
    
router.get("/propiedades/agregar-imagen/:id", protegerRuta, agregarImagen)

router.post("/propiedades/agregar-imagen/:id",
    protegerRuta,
    upload.single('imagen'), almacenarImagen)

router.get("/propiedades/editar/:id", protegerRuta, 
    editar)

router.post("/propiedades/editar/:id", protegerRuta,
    body('titulo').notEmpty().withMessage("El titulo es Obligatorio"),
    body('descripcion').notEmpty().withMessage("La descripcion es Obligatorio").isLength({ max: 200 }).withMessage('La descripcion es my larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona una precio'),
    body('habitaciones').isNumeric().withMessage('Selecciona cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona cantidad de estacionamiento'),
    body('wc').isNumeric().withMessage('Selecciona cantidad de wc'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el mapa'),
    guardarCambios)

router.post('/propiedades/eliminar/:id', protegerRuta, eliminar);

router.get('/propiedad/:id', identificarUsuario, mostrarPropiedad);

export default router
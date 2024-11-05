import express from 'express'

import { buscar, categoria, inicio, noEncontrado } from '../controllers/appController.js'

const router = express.Router()

//Pagina de Inicio
router.get('/', inicio);

//Categorias
router.get('/categorias/:id', categoria);

//Pagina 404
router.get('/404', noEncontrado);

//Buscador
router.post('/buscador', buscar);



export default router
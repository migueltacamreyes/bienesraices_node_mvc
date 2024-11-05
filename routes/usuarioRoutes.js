//const express = require('express') //CommanSJ
import express from 'express'
import { autenticar, cerrarSesion, comprobarTocken, confirmar, formularioLogin, formularioOlvidePassword, formularioRegistro, nuevoPassword, registrar, resetPassword } from '../controllers/usuarioController.js';

const router = express.Router();

//Routing

router.get('/login', formularioLogin);
router.post('/login', autenticar);

router.post('/cerrar-sesion', cerrarSesion);

router.get('/registro', formularioRegistro);
router.post('/registro', registrar);
router.get('/confirmar/:tocken', confirmar);

router.get('/olvide-password', formularioOlvidePassword);
router.post('/olvide-password', resetPassword);

//Almacena el nuevo password
router.get('/olvide-password/:tocken', comprobarTocken);
router.post('/olvide-password/:tocken', nuevoPassword);

/*
router.get('/', function(req, res) {
    res.json({msg: "Hola Mundo Express"})
});

router.post('/', function(req, res) {
    res.json({msg: "Respuesta de Tipo Post"})
});
*/
/*
router.route('/')
    .get(function(req, res) {
        res.json({msg: "Hola Mundo Express"})
    })
    .post(function(req, res) {
        res.json({msg: "Respuesta de Tipo Post"})
    })
*/

export default router
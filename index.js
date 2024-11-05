//const express = require('express') //CommanSJ
import express from 'express'
import csurf from 'csurf';
import cookieParser from 'cookie-parser';

import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRouters from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'

import db from './config/db.js';

//Crear Appp
const app = express();

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({ extended: true }));

//Habilita Cookies Parse
app.use(cookieParser())

//Habilitar CSRF
app.use(csurf({cookie: true}))

//Conexion Base de datos
try{
    await db.authenticate();
    db.sync()
    console.log("Conexion Correcta a la base de datos")
}catch(error){
    console.log(error)
}

//Habilitar Pug
app.set('view engine', 'pug');
app.set('views', './views');

//Carpeta Publica
app.use(express.static('public'));

//Routing
//app.use('/', usuarioRoutes);
app.use('/', appRouters);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);



//Definir puerto
const port = process.env.PORT || 3000;

app.listen(port, () =>{
    console.log(`Funcion en el puerto ${port}`)
});


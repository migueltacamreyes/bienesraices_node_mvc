import { check, validationResult } from "express-validator"
import bcrypt from 'bcrypt'

import Usuario from "../models/Usuario.js"
import { generarId, generartoJWT } from "../helpers/tockens.js"
import { emailOlvidePassword, emailRegistro } from "../helpers/emails.js"

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: "Iniciar Sesión",
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('password').notEmpty().withMessage("El password es obligatorio").run(req)

    let resultado = validationResult(req)

    //Verificar si resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/login', {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    //Comprobar si el usuario existe

    const { email, password } = req.body;

    const usuario = await Usuario.findOne({where: { email: email}})

    if(!usuario){
        return res.render('auth/login', {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario no Existe"}]
        })
    }
    

    //Comprobar Confirmacion de Usuario
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "Tu cuenta no a sido confirmado"}]
        })
    }

    //Revisar Password
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: "Iniciar Sesión",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El Email o Contraseña no son las correctas"}]
        })
    }

    const token = generartoJWT({ id: usuario.id, nombre: usuario.nombre });
    console.log(token);

    //Alamcenar en un cookie
    return res.cookie('_token', token, {
        httpOnly: true,
        //expires: 9000
    }).redirect('/mis-propiedades');

}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: "Crear Cuenta",
        csrfToken: req.csrfToken()

    })
}

const registrar = async (req, res) => {
   //console.log(req.body);

    //Validar Formulario
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacio').run(req)
    await check('email').isEmail().withMessage('El email debe ser un correo valido').run(req)
    await check('password').isLength({min: 6}).withMessage("El password deber tener mas de 6 caracteres").run(req)
    await check('repetir_password').equals(req.body.password).withMessage("Los password no son iguales").run(req)

    let resultado = validationResult(req)

    //Verificar si resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/registro', {
            pagina: "Crear Cuenta",
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //Verificar que el usuario no exista
    const existeUsuario = await Usuario.findOne({ where: { email: req.body.email }})

    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: "Crear Cuenta",
            csrfToken: req.csrfToken(),
            errores: [{msg: "El usuario ya esta registrado"}],
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    //res.json(resultado.array())
   //const usuario = await Usuario.create(req.body)
   //res.json(usuario)

   const usuario = await Usuario.create({
    nombre: req.body.nombre,
    email: req.body.email,
    password: req.body.password,
    tocken: generarId()
   });

   //Enviar Correo
   emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    tocken: usuario.tocken
   })

   //Mostrar mensaje de confirmación

   res.render('templates/mensaje',{
    pagina: "Cuenta Creada Correctamente",
    mensaje: "Hemos Enviado un Email de Confirmación, presiona en el enlace"
   })

}
//Funcion que confirma una cuenta

const confirmar = async (req, res) => {
    const { tocken } = req.params

    //Verificar si el tocken es valido

    const usuario = await Usuario.findOne({where: {tocken: tocken}})

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: "Error al confirmar tú cuenta",
            mensaje: "Hubo un error al confirmar tú cuenta, intenta  de nuevo",
            error: true
        })
    }

    //Confirmar la cuenta
    usuario.tocken = null;
    usuario.confirmado = true;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: "Cuenta Confirmada",
        mensaje: "La cuenta se confirmo correctamente",
        error: false
    });

}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: "Recuperar tu acceso a Bienes Raices",
        csrfToken: req.csrfToken()

    })
}

const resetPassword = async (req, res) =>{
    //Validar Formulario
   await check('email').isEmail().withMessage('El email debe ser un correo valido').run(req)
  
    let resultado = validationResult(req)

    //Verificar si resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/olvide-password', {
            pagina: "Recuperar tu acceso a Bienes Raices",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    //Buscar el usuario

    const {email} = req.body;

    const usuario = await Usuario.findOne({ where: { email: email }});

    if(!usuario){

        return res.render('auth/olvide-password', {
            pagina: "Recuperar tu acceso a Bienes Raices",
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email no Perteneces a ningun Usuario'}]
        })

    }

    //Generar Token y enviar EMAIL
    usuario.tocken = generarId();
    await usuario.save();

    //Enviar un Email
    emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        tocken: usuario.tocken
    })

    //Renderizar
    res.render('templates/mensaje',{
        pagina: "Reestablece tu password",
        mensaje: "Hemos Enviado un Email con las instrucciones"
       })


}

const comprobarTocken = async (req, res) => {
    const {tocken} = req.params;

    const usuario = await Usuario.findOne({where: {tocken}});

    if(!usuario){
        return res.render('auth/confirmar-cuenta', {
            pagina: "Reestablece tú password",
            mensaje: "Hubo un error al validar tú información",
            error: true
        })
    }

    //Mostrar Formulario para modificar Password
    res.render('auth/reset-password', {
        pagina: "Reestablece Tu Password",
        csrfToken: req.csrfToken(),
    })

}

const nuevoPassword = async (req, res) => {
    //Validar el password

    await check('password').isLength({min: 6}).withMessage("El password deber tener mas de 6 caracteres").run(req)

    let resultado = validationResult(req)

    //Verificar si resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/reset-password', {
            pagina: "Restablece tú password",
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    //Identificar quien hace el cambio
    const {tocken} = req.params;
    const {password} = req.body;
    
    const usuario = await Usuario.findOne({where: {tocken: tocken}});

    //Hashar cambios
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.tocken = null;

    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: "Password Reestablecido",
        mensaje: "El Password Se guardo correctamente",
        error: false
    });
}

const cerrarSesion = (req, res) => {
    
    return res.clearCookie('_token').status(200).redirect('/auth/login');
    //res.send('Cerrando Sesion')
}

export{
    formularioLogin,
    autenticar,
    formularioRegistro,
    formularioOlvidePassword,
    registrar,
    confirmar,
    resetPassword,
    comprobarTocken,
    nuevoPassword,
    cerrarSesion
}
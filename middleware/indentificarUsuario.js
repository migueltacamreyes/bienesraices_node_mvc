import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js';



const identificarUsuario = async (req, res, next) => {
    const { _token } = req.cookies;

    if(!_token){
        req.usuario = null;
        return next();
    }

    //Comprobar el token

    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id);

        //Almacenar el usuario al Req
        if(usuario){
            req.usuario = usuario;
        }

        return next();
    } catch (error) {
        console.log(error);
        return res.clearCookie('_token').redirect('/auth/login');
    }
    next();
}

export default identificarUsuario;

import { unlink } from 'node:fs/promises'
import { validationResult } from "express-validator"
import {Precio, Categoria, Propiedad} from '../models/index.js'


const admin = async (req, res) =>{
    //Leer QueryString
    console.log(req.query);

    const { pagina: paginaActual } = req.query;

    const expresion = /^[1-9]$/;

    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1');
    }
    try {
        const { id } = req.usuario;

        //Limites
        const limite = 4;
        const offset = ((paginaActual * limite) - limite)

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit: limite,
                offset: offset,
                where: { usuarioId:  id },
                include: [
                    { model: Categoria, as: 'categoria' },
                    { model: Precio, as: 'precio' }
                ]
            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ]);


        res.render('propiedades/admin', {
            pagina: "Mis Propiedades",
            propiedades: propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limite),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limite
        })
    } catch (error) {
        console.log(error);
    }

}

//Formulario para crear
const crear = async (req, res) =>{
    //Consultar Modelo de PRecios y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: "Crear Propiedad",
        csrfToken: req.csrfToken(),
        categorias: categorias,
        precios: precios,
        datos: {}
    })
}


const guardar = async (req, res) =>{

    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        //Consultar Modelo de PRecios y Categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: "Crear Propiedad",
            csrfToken: req.csrfToken(),
            categorias: categorias,
            precios: precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id: usuarioId } = req.usuario;
    
    //Crear Registro
    try {
        console.log(req.body);
        const propiedaGuardar = await Propiedad.create({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            habitaciones: req.body.habitaciones,
            estacionamiento: req.body.estacionamiento,
            wc: req.body.wc,
            calle: req.body.calle,
            lat: req.body.lat,
            lng: req.body.lng,
            categoriaId: req.body.categoria,
            precioId: req.body.precio,
            usuarioId,
            imagen: ''
        });

        const { id } = propiedaGuardar


        res.redirect(`/propiedades/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error);
    }

    
}
const agregarImagen = async (req, res) =>{

    const { id } = req.params;

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    //Validar que la propiedad no existas publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    }

    //validar que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');
    }
    
    return res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen ${propiedad.titulo}`,
        propiedad,
        csrfToken: req.csrfToken(),
    })
}

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params;

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mis-propiedades');
    }
    //Validar que la propiedad no existas publicada
    if(propiedad.publicado){
        return res.redirect('/mis-propiedades');
    }

    //validar que la propiedad pertenece a quien visita esta pagina
    if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades');
    }
    
    try {
        //console.log(req.file)

        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        next();

    } catch (error) {
        console.log(error);
    }
}

const editar = async (req, res) => {

    const { id } = req.params;

    //validar propuedad
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //Revisar quien visita la URL
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }


    //Consultar Modelo de PRecios y Categoria
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias: categorias,
        precios: precios,
        datos: propiedad
    })
}

const guardarCambios = async (req, res) => {
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){
        //Consultar Modelo de PRecios y Categoria
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: "Editar Propiedad",
            csrfToken: req.csrfToken(),
            categorias: categorias,
            precios: precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params;

    //validar propuedad
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //Revisar quien visita la URL
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    const { id: usuarioId } = req.usuario;

    //Editar Registro
    try {
        console.log(req.body);
        propiedad.set({
            titulo: req.body.titulo,
            descripcion: req.body.descripcion,
            habitaciones: req.body.habitaciones,
            estacionamiento: req.body.estacionamiento,
            wc: req.body.wc,
            calle: req.body.calle,
            lat: req.body.lat,
            lng: req.body.lng,
            categoriaId: req.body.categoria,
            precioId: req.body.precio
        });

        await propiedad.save();

        res.redirect(`/mis-propiedades`)

    } catch (error) {
        console.log(error);
    }

}

const eliminar = async (req, res) => {

    const { id } = req.params;

    //validar propuedad
    const propiedad = await Propiedad.findByPk(id);
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    //Revisar quien visita la URL
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Eliminar imagen
    await unlink(`public/uploads/${propiedad.imagen}`);

    //Eliminar la propiedad
    await propiedad.destroy();
    res.redirect('/mis-propiedades');

}

//Mostrar Propiedad

const mostrarPropiedad = async (req, res) => {
    const { id } = req.params;
    //validar propuedad
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as: 'precio' }
        ]
    });

    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404')
    }

    res.render('propiedades/mostrar', {
        propiedad,
        pagina:  propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario
    })
}


export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad
}
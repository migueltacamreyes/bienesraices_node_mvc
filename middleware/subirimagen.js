/*import multer from "multer";
import path from 'path';
import { generarId } from '../helpers/tockens.js'

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/uploads/')
    },
    filename: function(req, file, cb){
        cb(null, generarId() + path.extname(file.originalname))
    }
})

const upload = multer( { storage });

export default upload*/

import multer from 'multer'
import path from 'path'
import { generarId } from '../helpers/tockens.js'
 
//* Configuración de multer
const storage = multer.diskStorage({
  //? Carpeta donde se guardan los archivos
  destination: function (req, file, cb) {
    //console.log('Calling internal', file)
    //console.log('Value req', req)
    // Se llama cuando se subió correctamente la imagen
    /*
            Primer argumento un error,
            segundo argumento es la ruta a guardar
        */
    cb(null, 'public/uploads')
  },
  //? Nombre del archivo
  filename: function (req, file, cb) {
    /**
     * Se generaId para evitar duplicidad en el nombre de la imagen
     * extname - extrae la extensión del archivo para concatenarlo al nombre de la imagen
     */
    if (file) {
      cb(null, generarId() + path.extname(file.originalname))
    }
  }
})
 
//* Pasando la configuración
const upload = multer({ storage: storage })
// const upload = multer({ dest: 'public/a' })
 
export default upload
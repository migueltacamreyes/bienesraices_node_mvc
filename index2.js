const express = require('express') //CommanSJ

//Crear Appp
const app = express();

//Routing
app.get('/', function(req, res) {
    res.json({msg: "Hola Mundo Express"})
});

app.get('/nosotros', function(req, res) {
    res.send("Informacion de Nosotros")
});

//Definir puerto
const port = 3000;


app.listen(port, () =>{
    console.log(`Funcion en el puerto ${port}`)
})



import bcrypt from 'bcrypt'

const usuarios = [
    {
        nombre: "Miguel",
        email: "alejandro@gmail.com",
        confirmado: 1,
        password: bcrypt.hashSync('123456', 10)
    }
]

export default usuarios
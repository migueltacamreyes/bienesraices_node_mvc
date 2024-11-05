import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {


    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
        }
    });
    const { email, nombre, tocken } = datos;

    //Enviar Email

    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirma tu cuenta en BinesRaices.com',
        text: 'Confirma tu CUenta en BienesRaices.com',
        html: `<p> Hola ${nombre}, comprueba tu cuenta en bienesRaices.com </p>
            <p> Tu cuenta ya esta lista, solo debes confirmar en el siguentes enlace:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${tocken}"> Conforma Cuenta </a> </p>
            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>`
    })
}

const emailOlvidePassword = async (datos) => {


    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
        }
    });
    const { email, nombre, tocken } = datos;

    //Enviar Email

    await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Restablece tu Password en BinesRaices.com',
        text: 'Restablece tu Password en BienesRaices.com',
        html: `<p> Hola ${nombre}, has solicitado restablecer tu password en bienesRaices.com </p>
            <p> Sigue el siguentes enlace para generar un password Nuevo:
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${tocken}"> Restablecer Password </a> </p>
            <p>Si tu no solicitaste el cambio de password, puedes ignorar el mensaje</p>`
    })
}

export{
    emailRegistro, emailOlvidePassword
}
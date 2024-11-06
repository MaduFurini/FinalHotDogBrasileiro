const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'madufurini@gmail.com',
        pass: 'cwdy pkvd miff fpup'
    }
});

const sendOtpEmail = (to, otp) => {
    const mailOptions = {
        from: 'madufurini@gmail.com',
        to: to,
        subject: 'Recuperação de Senha - OTP',
        text: `Seu código OTP para recuperação de senha é: ${otp}`
    };

    return transporter.sendMail(mailOptions);
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

module.exports = { sendOtpEmail, generateOtp };
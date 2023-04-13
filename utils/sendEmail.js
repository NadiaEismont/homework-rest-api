const nodemailer = require('nodemailer');

require('dotenv').config();

const { EMAIL_USER } = process.env;

const config = {
    host: 'smtp.meta.ua',
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(config);



exports.sendVerificationEmail = (email, verificationToken) => {
    // відправити email на пошту користувача
    const emailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: "Verify account on homework-rest-api",
        text: `Your verification link is http://localhost:3000/api/users/verify/${verificationToken}`
    };

    transporter
        .sendMail(emailOptions)
        .then(info => console.log(info))
        .catch(err => console.log(err));
}

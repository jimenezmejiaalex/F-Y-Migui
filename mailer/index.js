import { createTransport } from 'nodemailer';

const transport = createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASSWORD
    }
});

export const sendEmail = (receivers, subject, template) => transport.sendMail({
    from: `"Frutas & Verduras Migui 🥑" <${process.env.MAILER_EMAIL}>`,
    to: receivers,
    subject,
    html: template
});
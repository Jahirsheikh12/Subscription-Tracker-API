import transporter, { accountEmail } from "../config/nodemailer.js";
import { emailTemplates } from "./email-template.js";

export const sendReminderEmail = async ({ to, type, subscription }) => {

    if (!to || !type) throw new Error('Email and type are required');

    const template = emailTemplates.find((t) => t.label === type);

    if (!template) throw new Error('Email template not found');

    const mailInfo = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: subscription.renewalDate,
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.paymentMethod
    }

    const subject = template.generateSubject(mailInfo);

    const message = template.generateBody(mailInfo);

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error, 'Error while sending email')
        }

        console.log(`Email sent successfully ${info.response}`)
    })
}
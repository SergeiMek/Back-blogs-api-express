import nodemailer, {SentMessageInfo} from "nodemailer";
import {EMAIL_ADAPTER_DATA} from "../settings";


export const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string) {
        let transporter = nodemailer.createTransport({
            service: "Mail.ru",
            //host:"smtp.mail.ru",
            auth: {
                user: EMAIL_ADAPTER_DATA.EMAIL,
                pass: EMAIL_ADAPTER_DATA.PASSWORD,
            },

        })
        await new Promise((resolve, reject) => {
            // verify connection configuration
            transporter.verify(function (error: Error | null, success: boolean) {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log("Server is ready to take our messages");
                    resolve(success);
                }
            });
        });

        const mailData = {
            ///from: '"IT-INC Admin" <EMAIL_ADAPTER_DATA.EMAIL>',
            from: "IT-INC Admin " +  EMAIL_ADAPTER_DATA.EMAIL,
            to: email,
            subject: subject,
            html: message,
        };

        await new Promise((resolve, reject) => {
            // send mail
            transporter.sendMail(
                mailData,
                (err: Error | null, info: SentMessageInfo) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log(info);
                        resolve(info);
                    }
                }
            );
        });
    }
}
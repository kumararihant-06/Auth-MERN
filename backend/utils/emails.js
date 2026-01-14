import { MailtrapClient } from "mailtrap"
import { sender, client } from "../config/mailtrap.config.js"
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js"

export const sendVerificationEmail = async (email,verificationToken) => {
    const recipient =[{email}] 

    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            subject: "Verify your e-mail.",
            html:VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification."
        })
        console.log("E-mail Sent Successfully.", response);
    } catch (error) {
        console.log("E-mail not Sent: ", error);
        throw new Error(`E-mail not sent, An error occurred : ${error}`)
    }
}

export const sendWelcomeEmail = async (email,userName) => {
    const recipient = [{email}]

    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            template_uuid: "3eab245d-91e7-4f17-ab19-76e15a602525",
            template_variables: {
                "company_info_name": "Auth_Test_Company",
                "name": userName
            }
        })
        console.log("Welcome E-mail Sent successfully.", response);
    } catch (error) {
        console.log("E-mail not sent", error);
        throw new Error(`Welcome E-mail Not sent, an error occurred: ${error}`);
    }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient  = [{email}]
    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            subject: "Password Reset Request",
            category: "Password Reset"
        })
        
    } catch (error) {
        console.log("Password Reset E-mail not sent: ", error);
        throw new Error(`Password Reset E-mail not sent, An error occurred: ${error}`)
    }
}

export const sendResetSuccessEmail = async (email) => {
    const recipient = [{email}]

    try {
        const response = await client.send({
            from: sender,
            to: recipient,
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            subject: "Password Reset Successful",
            category: "Password Reset"
        })

        console.log("Password Reset Success E-mail sent successfully.", response);
    } catch (error) {
        console.log("Password Reset aSuccess Email not sent. ",error);
        throw new Error(`Password Reset Success E-mail not sent, An error occurred: ${error}`)
    }
}
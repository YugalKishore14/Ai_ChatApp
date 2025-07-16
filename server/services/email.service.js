const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();


const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.sendEmail = async (to, subject, html) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = { name: 'YUG-AI', email: 'yugaldhiman14@gmail.com' }; // ✅ change this
    sendSmtpEmail.to = [{ email: to }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully:', data.messageId);
    } catch (error) {
        console.error('Brevo Email Error:', error.message);
        throw new Error('Email sending failed');
    }
};

import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Helps with local certificate issues
      },
    });



    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    await transporter.sendMail(message);
    console.log(`✅ Email sent successfully to ${options.email}`);
  } catch (error) {
    // Backup logging for development if credentials are missing/wrong
    console.log("\n--- [EMAIL SYSTEM - OTP BACKUP] ---");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log("-----------------------------------\n");
    
    console.error(`❌ Email Login Error: ${error.message}`);
    // We don't throw the error here so the registration process can still finish
  }
};

export default sendEmail;

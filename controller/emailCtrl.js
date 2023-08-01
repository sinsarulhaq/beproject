const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          user: 'sinsarulhaq.pro@gmail.com',
          pass: 'xrppdbsqdwsqrhim'
        }
      });
      
      // async..await is not allowed in global scope, must use a wrapper
      
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: '"Hey 👻" <abc@example.com>', // sender address
          to: data.to, // list of receivers
          subject: data.subject, // Subject line
          text: data.text, // plain text body
          html: data.html, // html body
        });
      console.log(info);
        console.log("Message sent: %s", info.messageId);
    
});

module.exports = sendEmail
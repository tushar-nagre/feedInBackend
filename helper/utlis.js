let nodemailer = require("nodemailer");
const generatePassword = () => {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal + "@";
};

const sendMail = async (mailObject) => {
  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tnspace02@gmail.com",
        pass: "fzyosaeenadoxbhh",
      },
    });

    var mailOptions = mailObject;

    const rr = await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = { generatePassword, sendMail };

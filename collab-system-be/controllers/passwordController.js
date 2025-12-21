import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { findUserByEmail, updateUserPassword } from "../models/userModel.js";


// Setup SMTP
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP
export const sendOtp = async (req, res) => {
    try {
    const { email } = req.body;
  // Check if email exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({ success: false, message: "Email not registered" });
    }
    //create otp
    const otp = Math.floor(100000 + Math.random() * 900000);

    req.session.otp = otp;
    req.session.email = email;

     req.session.save(async () => {
            try {
                await transporter.sendMail({
                    from: "Collaborative System",
                    to: email,
                    subject: "Your OTP Code",
                    text: `Your OTP is ${otp}`
                });

                res.json({ success: true, message: "OTP sent to email." });
            } catch (err) {
                
                res.json({ success: false, message: "Email sending failed." });
            }
        });

    } catch (err) {
        res.json({ success: false, message: "Server error" });
    }
};

// Verify OTP 
export const verifyOtp = (req, res) => {
    const { otp } = req.body;

    if (parseInt(otp) === req.session.otp) {
        return res.json({ success: true, message: "OTP verified" });
    }

    res.json({ success: false, message: "Invalid OTP" });
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
    const { newPassword } = req.body;
    const email = req.session.email;
    const hashed = await bcrypt.hash(newPassword, 10);
     await updateUserPassword(email, hashed);

    req.session.destroy();

        res.json({ success: true, message: "Password updated!" });

    } catch (err) {
        res.json({ success: false, message: "Server error" });
    }
};

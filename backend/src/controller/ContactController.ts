import { Request, Response } from "express";
import { EmailService } from "../services/EmailService.js";

export class ContactController {
  static async submitForm(req: Request, res: Response) {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ 
          message: "Please provide all required fields: name, email, and message." 
        });
      }

      await EmailService.sendContactEmail({
        fromEmail: email,
        fromName: name,
        subject: subject || "Contact Inquiry",
        message: message,
        phone: phone,
      });

      return res.status(200).json({ 
        message: "Thank you! Your message has been sent successfully." 
      });
    } catch (error: any) {
      console.error("Contact Form Error:", error);
      return res.status(500).json({ 
        message: "Failed to send message. Please try again later.",
        error: error.message 
      });
    }
  }
}

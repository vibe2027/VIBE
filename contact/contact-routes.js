/**
 * VIBE Contact Routes
 * Formulaire de contact → Email support@vibegay.ca
 */

const express = require('express');
const sgMail = require('@sendgrid/mail');

const router = express.Router();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * POST /contact
 * Recevoir les messages du formulaire de contact
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Tous les champs sont requis: name, email, subject, message'
      });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    if (message.length < 10) {
      return res.status(400).json({ error: 'Le message doit avoir au moins 10 caractères' });
    }

    // Envoyer via SendGrid
    const msg = {
      to: 'support@vibegay.ca',
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@vibegay.ca',
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>📧 Nouveau message de contact</h2>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>De :</strong> ${name}</p>
            <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Sujet :</strong> ${subject}</p>
          </div>

          <div style="background: #fff; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
            <p><strong>Message :</strong></p>
            <p style="white-space: pre-wrap; word-break: break-word;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            ⏰ Envoyé via formulaire de contact vibegay.ca
          </p>
        </div>
      `,
      text: `Nouveau message de contact\n\nDe: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}`
    };

    await sgMail.send(msg);

    console.log(`✅ Email de contact reçu de ${email}`);
    res.status(200).json({
      success: true,
      message: 'Merci ! Votre message a été envoyé. Nous vous répondrons bientôt.',
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`❌ Erreur contact: ${err.message}`);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi du message. Veuillez réessayer plus tard.'
    });
  }
});

module.exports = router;

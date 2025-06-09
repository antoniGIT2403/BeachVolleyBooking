// emailService.js
const sgMail = require('@sendgrid/mail');
require('dotenv').config(); // au cas où ce fichier est utilisé indépendamment

const FROM_EMAIL = process.env.EMAIL_FROM || 'no-reply@ton-app.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(to, token) {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  const msg = {
    to,
    from: FROM_EMAIL,
    subject: '✅ Vérifie ton adresse email',
    html: `
      <p>Bonjour,</p>
      <p>Merci de t'être inscrit ! Clique sur le lien suivant pour vérifier ton adresse email :</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>Si tu n'es pas à l'origine de cette inscription, tu peux ignorer ce message.</p>
      <hr>
      <small>Ce lien expirera après 24 heures.</small>
    `
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email de vérification envoyé à ${to}`);
  } catch (err) {
    console.error(`❌ Erreur d'envoi de mail à ${to} :`, err.response?.body || err);
    throw new Error('Échec de l’envoi de l’email');
  }
}

module.exports = { sendVerificationEmail };

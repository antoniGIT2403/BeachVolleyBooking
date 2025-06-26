// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const bcrypt = require('bcryptjs');
const rateLimit = require("express-rate-limit");
const { authMiddleware, isAdmin } = require("./middlewares/auth");
require('dotenv').config();
const crypto = require('crypto');
const { sendVerificationEmail } = require('./emailService');
const uriDb = process.env.MONGODB_URI

const jwt = require("jsonwebtoken");
const JWT_SECRET = "super-secret-djolet-key"; //TODO à sécuriser plus tard

const app = express();



const allowedOrigins = ["https://beachvolleyplanner.netlify.app", "http://localhost:4200", 'http://localhost:3000']; // Remplace par ton vrai domaine déployé

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // si tu utilises les cookies ou sessions
  })
);

app.options("*", cors()); // <== pour les requêtes OPTIONS

app.use(express.json());

// 🔒 Limiter à 100 requêtes par IP par 15 minutes
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: "Trop de requêtes, réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { error: "Trop de tentatives de connexion. Attendez un peu." },
});


// Connexion à MongoDB
//
mongoose.connect(uriDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Event = mongoose.model(
  "Event",
  new mongoose.Schema({
    title: String,
    date: Date,
    endDate: Date,
    maxParticipants: Number,
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    level: {
      type: String,
      enum: ["debutant", "intermediaire", "avance"],
      required: true,
    },
    location: { type: String, required: true },
  })
);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: String,
    password: String,
    credits: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    sexe: { type: String, enum: ["homme", "femme"], default: "homme" },
    niveau: {
      type: String,
      enum: ["débutant", "intermédiaire", "avancé"],
      default: "débutant",
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
    },
    prenom: String,
    nom: String,
    emailVerified: { type: Boolean, default: true }, // TODO: à changer en false
    emailVerificationToken: String,
    emailVerificationExpires: Date,
  })
);

// ROUTE: inscription
app.post("/api/register", async (req, res) => {
  const { email, password, prenom, nom, role, sexe, niveau } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).send({ error: "Utilisateur déjà existant" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = new User({
    email,
    password: hashedPassword,
    prenom,
    nom,
    role: role || "user",
    sexe: sexe || "homme",
    niveau: niveau || "débutant",
    status: "pending",
    emailVerificationToken: verificationToken, //TODO: à changer en verificationToken
    isEmailVerified: true, // TODO: à changer en false
  });

  await user.save();

  // try {
  //   await sendVerificationEmail(email, verificationToken);
  // } catch (err) {
  //   console.error("Erreur envoi mail:", err);
  //   return res.status(500).send({ error: "Erreur lors de l'envoi de l'email" });
  // }

  // res.send({ message: "Inscription réussie, vérifie ton email 📧" });
});


function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

app.post("/api/verify-email", async (req, res) => {
  const { token } = req.body;

  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    return res.status(400).send({ error: "Token invalide ou expiré" });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.status = "active";
  await user.save();

  const authToken = generateToken(user);

  res.send({
    message: "Email vérifié avec succès",
    token: authToken,
    user: {
    _id: user._id,
      email: user.email,
      credits: user.credits,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom,
      sexe: user.sexe,
      niveau: user.niveau,
      status: user.status,
    },
  });
});


app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).send({ error: "Utilisateur non trouvé" });
  if (!user.emailVerified)
  return res.status(401).send({ error: "Email non vérifié" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).send({ error: "Mot de passe incorrect" });

  // Générer un token JWT
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.send({
    message: "Connexion réussie",
    token,
    user: {
      _id: user._id,
      email: user.email,
      credits: user.credits,
      role: user.role,
      prenom: user.prenom,
      nom: user.nom,
      sexe: user.sexe,
      niveau: user.niveau,
      status: user.status,
    },
  });
});

app.get("/api/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).send({ error: "Token manquant" });

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) return res.status(400).send({ error: "Token invalide" });

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  await user.save();

  res.send({ message: "Email vérifié avec succès ✅" });
});



app.get("/api/events", authMiddleware, rateLimiter, async (req, res) => {
  try {
    const events = await Event.find().populate(
      "registeredUsers",
      "prenom nom email"
    );
    res.send(events);
  } catch (err) {
    res.status(500).send({ error: "Erreur serveur" });
  }
});


app.post(
  "/api/events",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    try {
      const { title, dateStart, dateEnd, maxParticipants, level, location } =
        req.body;

      const event = new Event({
        title,
        date: dateStart,
        endDate: dateEnd, // ← ajoute ce champ à ton schéma Mongoose
        maxParticipants,
        level, // ⬅️ obligatoire
        location, // ⬅️ obligatoire
        registeredUsers: [],
      });

      await event.save();
      res.status(201).send(event);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send({ error: "Erreur lors de la création de l’événement" });
    }
  }
);

app.post(
  "/api/users/:id/credits",
  authMiddleware,
  rateLimiter,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).send({ error: "User not found" });

      const { amount } = req.body;
      user.credits = (user.credits || 0) + amount;
      await user.save();

      res.send(user);
    } catch (err) {
      res.status(500).send({ error: "Erreur ajout crédits" });
    }
  }
);
app.delete(
  "/api/events/:id",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    try {
      const deleted = await Event.findByIdAndDelete(req.params.id);
      if (!deleted)
        return res.status(404).send({ error: "Événement non trouvé" });

      res.send({ message: "Événement supprimé", event: deleted });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Erreur serveur lors de la suppression" });
    }
  }
);

app.post(
  "/api/events/:id/unregister",
  authMiddleware,
  rateLimiter,
  async (req, res) => {
    try {
      const { userId } = req.body;
      const event = await Event.findById(req.params.id);
      const user = await User.findById(userId);

      if (!event || !user) {
        return res
          .status(404)
          .send({ error: "Événement ou utilisateur introuvable" });
      }

      // Vérifie si inscrit
      const index = event.registeredUsers.indexOf(userId);
      if (index === -1) {
        return res
          .status(400)
          .send({ error: "Utilisateur non inscrit à cet événement" });
      }

      // Supprimer l'inscription
      event.registeredUsers.splice(index, 1);
      await event.save();

      // Rendre le crédit
      user.credits += 1;
      await user.save();

      res.send({ message: "Désinscription réussie", event, user });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send({ error: "Erreur serveur lors de la désinscription" });
    }
  }
);
app.get(
  "/api/users",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    try {
      const users = await User.find(
        {},
        "prenom nom credits sexe niveau status"
      );
      res.send(users);
    } catch (err) {
      res
        .status(500)
        .send({ error: "Erreur lors de la récupération des utilisateurs" });
    }
  }
);

app.post(
  "/api/events/:id/register",
  authMiddleware,
  rateLimiter,
  async (req, res) => {
    try {
      const { userId } = req.body;
      const event = await Event.findById(req.params.id);
      const user = await User.findById(userId);

      if (!event || !user) {
        return res
          .status(404)
          .send({ error: "Événement ou utilisateur introuvable" });
      }

      // Vérifie si déjà inscrit
      if (event.registeredUsers.includes(userId)) {
        return res.status(400).send({ error: "Déjà inscrit à cet événement" });
      }

      // Vérifie s'il reste de la place
      if (event.registeredUsers.length >= event.maxParticipants) {
        return res.status(400).send({ error: "Événement complet" });
      }

      // Vérifie si le user a des crédits
      if (user.credits < 1) {
        return res.status(400).send({ error: "Crédits insuffisants" });
      }

      // Inscription
      event.registeredUsers.push(userId);
      await event.save();

      // Retirer 1 crédit
      user.credits -= 1;
      await user.save();

      // Renvoie l'event peuplé
      const updatedEvent = await Event.findById(req.params.id).populate(
        "registeredUsers",
        "prenom nom email"
      );

      res.send({ message: "Inscription réussie", event: updatedEvent, user });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .send({ error: "Erreur serveur lors de l’inscription: " + err });
    }
  }
);

app.post(
  "/api/events/clone-last-week",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // dimanche
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfLastWeek = new Date(startOfWeek);
      startOfLastWeek.setDate(startOfWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 7);

      // Récupère les events de la semaine dernière
      const lastWeekEvents = await Event.find({
        date: { $gte: startOfLastWeek, $lt: endOfLastWeek },
      });

      // Clone chaque événement avec une date + 7 jours
      const clonedEvents = await Promise.all(
        lastWeekEvents.map((event) => {
          const newDate = new Date(event.date);
          newDate.setDate(newDate.getDate() + 7);
          return Event.create({
            title: event.title,
            date: newDate,
            dateEnd: new Date(event.dateEnd).setDate(
              new Date(event.dateEnd).getDate() + 7
            ),
            level: event.level,
            location: event.location,
            maxParticipants: event.maxParticipants,
            registeredUsers: [],
          });
        })
      );

      res.send({ message: "Clonage effectué ✅", events: clonedEvents });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Erreur lors du clonage des événements" });
    }
  }
);

app.get(
  "/api/users/pending",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    const users = await User.find(
      { status: "pending" },
      "prenom nom email sexe niveau"
    );
    res.send(users);
  }
);
app.patch(
  "/api/users/:id/approve",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { status: "active" });
    res.send({ message: "Utilisateur approuvé" });
  }
);
app.put("/api/events/:id", authMiddleware, rateLimiter, async (req, res) => {
  await Event.findByIdAndUpdate(req.params.id, req.body);
  res.send({ message: "Événement mis à jour" });
});

app.patch(
  "/api/users/:id/reject",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { status: "rejected" });
    res.send({ message: "Utilisateur rejeté" });
  }
);

app.post(
  "/api/users/:id/status",
  authMiddleware,
  isAdmin,
  rateLimiter,
  async (req, res) => {
    const { status } = req.body;
    await User.findByIdAndUpdate(req.params.id, { status });
    res.send({ message: "Statut mis à jour" });
  }
);

// Démarrage du serveur
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`)
);

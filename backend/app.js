// Importer le module express (framework web Node.js)
const express = require("express");
const app = express(); // Créer une instance de l'application express
const mongoose = require("mongoose"); // Importer le module mongoose (ODM pour MongoDB)
const bookRoutes = require('./routes/book'); // Importer les routes pour les objets "book"
const userRoutes = require('./routes/user'); // Importer les routes pour les utilisateurs
const path = require('path'); // Importer le module path (pour manipuler les chemins de fichiers)
require('dotenv').config()
// Connexion à la base de données MongoDB
mongoose
  .connect(
    process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Middleware pour parser les données JSON dans les requêtes
app.use(express.json());

// Middleware pour gérer les en-têtes CORS et autoriser les requêtes de différentes origines
app.use((req, res, next) => {
  //'Access-Control-Allow-Origin' = origine, '*' = tout le monde
  // Autorisation d'accès à l'API pour tout le monde
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Autorisation d'utiliser certains Headers dans l'objet requête
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  // Autorisation d'utiliser certaines méthodes (verbes de requête)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Utiliser les routes définies pour les objets "book"
app.use('/api/books', bookRoutes);

// Utiliser les routes définies pour les utilisateurs
app.use('/api/auth', userRoutes);

// Servir les images statiques depuis le répertoire 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app; // Exporter l'application express pour pouvoir l'utiliser dans d'autres fichiers

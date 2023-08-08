// Importer le module express (framework web Node.js)
const express = require("express");
const app = express(); // Créer une instance de l'application express
const mongoose = require("mongoose"); // Importer le module mongoose (ODM pour MongoDB)
const bookRoutes = require('./routes/book'); // Importer les routes pour les objets "stuff"
const userRoutes = require('./routes/user'); // Importer les routes pour les utilisateurs
const path = require('path'); // Importer le module path (pour manipuler les chemins de fichiers)

// Connexion à la base de données MongoDB
mongoose
  .connect(
    "mongodb+srv://agathemazuret:299110mazgathe@cluster0.aktvwed.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Middleware pour parser les données JSON dans les requêtes
app.use(express.json());

// Middleware pour gérer les en-têtes CORS et autoriser les requêtes de différentes origines
app.use((req, res, next) => {
  //'Access-Control-Allow-Origin' = origine, '*' = tout le monde
  //origine qui a le droit d'accéder à l'API c'est tout le monde
  res.setHeader('Access-Control-Allow-Origin', '*');
  //autorisation d'utiliser certains Headers sur l'objet requête
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  //autorisation d'utiliser certaines méthodes (verbes de requête)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Utiliser les routes définies pour les objets "stuff"
app.use('/api/books', bookRoutes);

// Utiliser les routes définies pour les utilisateurs
app.use('/api/auth', userRoutes);

// Servir les images statiques depuis le répertoire 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app; // Exporter l'application express pour pouvoir l'utiliser dans d'autres fichiers

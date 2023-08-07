// Importer le module bcrypt (pour le chiffrement des mots de passe)
const bcrypt = require("bcrypt");

// Importer le modèle User depuis le fichier ../models/User.js
const User = require("../models/User");

// Importer le module jwt (JSON Web Token)
const jwt = require('jsonwebtoken');

// Fonction pour s'inscrire (créer un nouvel utilisateur)
exports.signup = (req, res, next) => {
  // Hasher le mot de passe (10 salages)
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // Créer une nouvelle instance d'utilisateur avec l'email et le mot de passe hashé
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // Sauvegarder le nouvel utilisateur dans la base de données
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Fonction pour se connecter (authentifier un utilisateur)
exports.login = (req, res, next) => {
  // Rechercher l'utilisateur dans la base de données par son email
  User.findOne({ email: req.body.email })
      .then(user => {
          // Vérifier si l'utilisateur existe
          if (!user) {
              return res.status(401).json({ error: 'Utilisateur non trouvé !' });
          }
          // Comparer le mot de passe fourni avec le mot de passe stocké hashé
          bcrypt.compare(req.body.password, user.password)
              .then(valid => {
                  // Vérifier si le mot de passe est valide
                  if (!valid) {
                      return res.status(401).json({ error: 'Mot de passe incorrect !' });
                  }
                  // Si le mot de passe est valide, générer un token JWT pour l'authentification
                  res.status(200).json({
                      userId: user._id,
                      token: jwt.sign(
                          { userId: user._id },
                          'RANDOM_TOKEN_SECRET', // Clé secrète pour signer le token (à remplacer par une clé sécurisée en production)
                          { expiresIn: '24h' } // Durée de validité du token (24 heures)
                      )
                  });
              })
              .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

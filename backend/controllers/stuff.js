// Importer les modules requis
const Thing = require("../models/thing");
const fs = require('fs');

// Fonction pour créer un nouvel objet "thing"
exports.createThing = (req, res, next) => {
  // Analyser le corps de la requête pour extraire l'objet "thing"
  const thingObject = JSON.parse(req.body.thing);

  // Supprimer les propriétés _id et _userId de l'objet "thing"
  delete thingObject._id;
  delete thingObject._userId;

  // Créer une nouvelle instance de "Thing" avec les données fournies
  const thing = new Thing({
    ...thingObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });

  // Sauvegarder le nouvel objet "thing" dans la base de données
  thing
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour modifier un objet "thing" existant
exports.modifyThing = (req, res, next) => {
  // Vérifier si un fichier est inclus dans la requête et construire l'objet "thing" en conséquence
  const thingObject = req.file ? {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  // Supprimer la propriété _userId de l'objet "thing"
  delete thingObject._userId;

  // Trouver l'objet "thing" existant par son ID
  Thing.findOne({_id: req.params.id})
      .then((thing) => {
          // Vérifier si l'utilisateur authentifié est autorisé à modifier l'objet "thing"
          if (thing.userId != req.auth.userId) {
              res.status(401).json({ message : 'Non autorisé' });
          } else {
              // Mettre à jour l'objet "thing" existant avec les nouvelles données
              Thing.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id })
              .then(() => res.status(200).json({ message : 'Objet modifié !' }))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

// Fonction pour supprimer un objet "thing"
exports.deleteThing = (req, res, next) => {
  // Trouver l'objet "thing" à supprimer par son ID
  Thing.findOne({ _id: req.params.id})
      .then(thing => {
          // Vérifier si l'utilisateur authentifié est autorisé à supprimer l'objet "thing"
          if (thing.userId != req.auth.userId) {
              res.status(401).json({ message: 'Non autorisé' });
          } else {
              // Extraire le nom de fichier de l'imageUrl et supprimer le fichier correspondant du serveur
              const filename = thing.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  // Supprimer l'objet "thing" de la base de données
                  Thing.deleteOne({ _id: req.params.id })
                      .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

// Fonction pour obtenir un objet "thing" spécifique par son ID
exports.getOneThing = (req, res, next) => {
  // Trouver l'objet "thing" par son ID et le renvoyer en réponse
  Thing.findOne({ _id: req.params.id })
    .then((thing) => res.status(200).json(thing))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour obtenir tous les objets "thing"
exports.getAllThings = (req, res, next) => {
  // Trouver tous les objets "thing" dans la base de données et les renvoyer en réponse
  Thing.find()
    .then((things) => res.status(200).json(things))
    .catch((error) => res.status(400).json({ error }));
};
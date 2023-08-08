// Importer les modules requis
const Book = require("../models/Book");
const fs = require("fs");

// Fonction pour créer un nouvel objet "object"
exports.createBook = (req, res, next) => {
  console.log(req.body.book);

  // Analyser le corps de la requête pour extraire l'objet "object"
  const bookObject = JSON.parse(req.body.book);

  // Supprimer les propriétés _id et _userId de l'objet "object"
  delete bookObject._id;
  delete bookObject._userId;

  // Créer une nouvelle instance de "object" avec les données fournies
  const object = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  // Sauvegarder le nouvel objet "object" dans la base de données
  object
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour modifier un objet "object" existant
exports.modifyBook = (req, res, next) => {
  // Vérifier si un fichier est inclus dans la requête et construire l'objet "object" en conséquence
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.object),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  // Supprimer la propriété _userId de l'objet "object"
  delete bookObject._userId;

  // Trouver l'objet "object" existant par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur authentifié est autorisé à modifier l'objet "object"
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // Mettre à jour l'objet "object" existant avec les nouvelles données
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour supprimer un objet "object"
exports.deleteBook = (req, res, next) => {
  // Trouver l'objet "object" à supprimer par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur authentifié est autorisé à supprimer l'objet "object"
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // Extraire le nom de fichier de l'imageUrl et supprimer le fichier correspondant du serveur
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          // Supprimer l'objet "object" de la base de données
          book
            .deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Fonction pour obtenir un objet "object" spécifique par son ID
exports.getOneBook = (req, res, next) => {
  // Trouver l'objet "object" par son ID et le renvoyer en réponse
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour obtenir tous les objets "object"
exports.getAllBooks = (req, res, next) => {
  // Trouver tous les objets "object" dans la base de données et les renvoyer en réponse
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.setRatingBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Livre non trouvé !" });
      } else if (
        book.ratings.includes((rating) => rating.userId == req.body.userId)
      ) {
        return res
          .status(400)
          .json({ error: "Vous avez déjà noté ce livre !" });
      } else if (1 > req.body.rating > 5) {
        return res
          .status(400)
          .json({ error: "La note doit être comprise entre 1 et 5 !" });
      } else {
        book.ratings.push({
          userId: req.body.userId,
          grade: req.body.rating,
        });
      }

      let sum = 0;

      let ratingCopy = [...book.ratings];

      while (ratingCopy.length != 0) {
        sum += ratingCopy.pop().grade;
      }

      let calc = sum / book.ratings.length;
      let result = calc.toFixed(1);

      book.averageRating = result;
      return book.save();
    })
    .then((book) => res.status(200).json(book))
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getBestRating = (req, res, next) => {
  Book.find()
  .then((books) => {
    books.sort((a, b) => b.averageRating - a.averageRating);
    const top3 = books.slice(0, 3);
    console.log
    res.status(200).json(top3);
  })
  .catch((error) => res.status(400).json({ error }));
}
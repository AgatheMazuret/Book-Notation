// Importer les modules requis
const Book = require("../models/Book");
const fs = require("fs");

// Fonction pour créer un nouveau book "book"
exports.createBook = (req, res, next) => {

  // Analyser le corps de la requête pour extraire le book "book"
  const bookObject = JSON.parse(req.body.book);

  // Supprimer les propriétés _id et _userId du book "book"
  delete bookObject._id;
  delete bookObject._userId;

  const newFilename = `${req.file.filename.split('.')[0]}.webp`;

  // Créer une nouvelle instance de "object" avec les données fournies
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/${req.file.destination}/modified_${newFilename}`
  });

  // Sauvegarder le nouvel objet "object" dans la base de données
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour modifier un book "book" existant
exports.modifyBook = (req, res, next) => {

  // On crée un nouveau nom de fichier en changeant l'extension du fichier téléchargé en ".webp"
  const newFilename = `${req.file.filename.split('.')[0]}.webp`;

  // On vérifie si un fichier est inclus dans la requête et on construit l'objet "modifiedBook" en conséquence
  let modifiedBook = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/${req.file.destination}/modified_${newFilename}`
      }
    : { ...req.body };

  // On supprime une propriété "_userId" de l'objet "modifiedBook"
  delete modifiedBook._userId;

  // On cherche l'objet "book" existant par son ID dans la base de données
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // On vérifie si l'utilisateur authentifié est autorisé à modifier le livre
      if (book.userId.toString() !== req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      // Mettre à jour le livre existant avec les nouvelles données
      Book.updateOne({ _id: req.params.id }, { ...modifiedBook, _id: req.params.id })
        .then(() => {
          res.status(200).json({ message: "Livre modifié !" });
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    })
    .catch((error) => {
      res.status(400).json({ error: "Livre non trouvé" });
    });
};


// Fonction pour supprimer un book "book"
exports.deleteBook = (req, res, next) => {
  // Trouver le book "Book" à supprimer par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur authentifié est autorisé à supprimer le book "book"
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        // Extraire le nom de fichier de l'imageUrl et supprimer le fichier correspondant du serveur
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          // Supprimer l'image "images" de la base de données
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

// Fonction pour obtenir tous les objets "Books"
exports.getAllBooks = (req, res, next) => {
  // Trouver tous les objets "Books" dans la base de données et les renvoyer en réponse
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
        book.ratings.some((rating) => rating.userId == req.auth.userId)
      ) {
        return res
          .status(400)
          .json({ error: "Vous avez déjà noté ce livre !" });
      } else if (req.body.rating < 1 || req.body.rating > 5) {
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

      while (ratingCopy.length !== 0) {
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
      res.status(200).json(top3);
    })
    .catch((error) => res.status(400).json({ error }));
};

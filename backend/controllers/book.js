// Import des modules requis
const Book = require("../models/Book");
const fs = require("fs");

// Fonction pour créer un nouveau livre ("book")
exports.createBook = (req, res, next) => {
  // Analyse du corps de la requête pour extraire le livre ("book")
  const bookObject = JSON.parse(req.body.book);

  // Suppression des propriétés _id et _userId du livre ("book")
  delete bookObject._id;
  delete bookObject._userId;

  const newFilename = `${req.file.filename.split(".")[0]}.webp`;

  // Création d'une nouvelle instance de "Book" avec les données fournies
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/${
      req.file.destination
    }/modified_${newFilename}`,
  });

  // Sauvegarde du nouveau livre dans la base de données
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour modifier un livre ("book") existant
exports.modifyBook = (req, res, next) => {
  // Création d'un nouveau nom de fichier en changeant l'extension du fichier téléchargé en ".webp"
  // Vérification de l'existence d'un fichier dans la requête et construction de l'objet "modifiedBook" en conséquence
  let modifiedBook = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/${
          req.file.destination
        }/modified_${req.file.filename.split(".")[0]}.webp`,
      }
    : { ...req.body };

  // Suppression de la propriété "_userId" de l'objet "modifiedBook"
  delete modifiedBook._userId;

  // Recherche du livre existant par son ID dans la base de données
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      console.log(book);
      // Vérification si l'utilisateur authentifié est autorisé à modifier le livre
      if (book.userId.toString() !== req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      // Récupération du nom de fichier de l'ancienne image avant la mise à jour
      const oldPhotoFileName = book.imageUrl.split("/modified_")[1];

      // Mise à jour du livre existant avec les nouvelles données
      Book.updateOne(
        { _id: req.params.id },
        { ...modifiedBook, _id: req.params.id }
      )
        .then(() => {
          // Suppression de l'ancienne image du dossier "images" si elle existe
          if (req.file) {
            const oldPhotoPath = `images/modified_${oldPhotoFileName}`;
            fs.unlink(oldPhotoPath, (err) => {
              if (err) {
                console.error("Erreur lors de la suppression de l'ancienne image :", err);
              } else {
                console.log("Ancienne image supprimée avec succès.");
              }
            });
          }

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

// Fonction pour supprimer un livre ("book")
exports.deleteBook = (req, res, next) => {
  // Trouver le livre "Book" à supprimer par son ID
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur authentifié est autorisé à supprimer le livre "book"
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

// Fonction pour obtenir un livre spécifique par son ID
exports.getOneBook = (req, res, next) => {
  // Trouver le livre par son ID et le renvoyer en réponse
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour obtenir tous les livres
exports.getAllBooks = (req, res, next) => {
  // Trouver tous les livres dans la base de données et les renvoyer en réponse
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Fonction pour attribuer une note à un livre
exports.setRatingBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        //return res.status(404).json({ error: "Livre non trouvé !" });
        throw {message :"Livre non trouvé !" }
      } else if (
        book.ratings.some((rating) => rating.userId == req.auth.userId)
      ) {
        // return res
        //   .status(400)
        //   .json({ error: "Vous avez déjà noté ce livre !" });
          throw {message : "Vous avez déjà noté ce livre!"}
      } else if (req.body.rating < 1 || req.body.rating > 5) {
        // return res
        //   .status(400)
        //   .json({ error: "La note doit être comprise entre 1 et 5 !" });
        throw {message : "La note doit être comprise entre 1 et 5 !"}
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

// Fonction pour obtenir les livres avec les meilleures notes
exports.getBestRating = (req, res, next) => {
  Book.find()
    .then((books) => {
      books.sort((a, b) => b.averageRating - a.averageRating);
      const top3 = books.slice(0, 3);
      res.status(200).json(top3);
    })
    .catch((error) => res.status(400).json({ error }));
};

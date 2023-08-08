// Importer le module http (serveur HTTP Node.js)
const http = require('http');

// Importer l'application express depuis le fichier app.js
const app = require('./app');

// Fonction pour normaliser le port d'écoute
const normalizePort = val => {
  const port = parseInt(val, 10);

  // Vérifier si le port est un nombre valide
  if (isNaN(port)) {
    return val;
  }
  
  // Vérifier si le port est un nombre positif
  if (port >= 0) {
    return port;
  }
  
  // Si le port n'est pas valide, retourner false
  return false;
};

// Récupérer le port d'écoute à partir des variables d'environnement ou utiliser le port 3000 par défaut
const port = normalizePort(process.env.PORT || '4000');

// Définir le port d'écoute de l'application express
app.set('port', port);

// Fonction pour gérer les erreurs liées au serveur
const errorHandler = error => {
  // Vérifier si l'erreur n'est pas liée à la mise en écoute du serveur
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  // Obtenir les informations de l'adresse du serveur
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  
  // Gérer différentes erreurs de mise en écoute du serveur
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' nécessite des privilèges élevés.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' est déjà utilisé.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

// Créer un serveur HTTP avec l'application express
const server = http.createServer(app);

// Gérer les erreurs liées à la mise en écoute du serveur
server.on('error', errorHandler);

// Lorsque le serveur est en écoute, afficher le port ou l'adresse sur lequel il écoute
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('En écoute sur ' + bind);
});

// Mettre le serveur en écoute sur le port spécifié
server.listen(port);

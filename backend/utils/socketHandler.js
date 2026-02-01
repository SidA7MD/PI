const socketIo = require('socket.io');

let io;

// Stocker les utilisateurs connectés
// Map<userId, socketId>
const connectedUsers = new Map();

// Initialiser Socket.io
exports.init = (httpServer) => {
  io = socketIo(httpServer, {
    cors: {
      origin: "*", // A ajuster en production
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🔗 Client connecté:', socket.id);

    // Authentification simple via l'ID utilisateur envoyé par le client
    socket.on('join', (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        console.log(`👤 Utilisateur ${userId} associé au socket ${socket.id}`);
        // Rejoindre une room spécifique à l'utilisateur
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client déconnecté:', socket.id);
      // Nettoyer la map des utilisateurs
      for (const [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          connectedUsers.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

// Obtenir l'instance IO
exports.getIO = () => {
  if (!io) {
    throw new Error("Socket.io n'est pas initialisé !");
  }
  return io;
};

// Envoyer une notification à un utilisateur spécifique
exports.emitToUser = (userId, event, data) => {
  if (!io) {
      console.error('❌ Socket.io not initialized when trying to emit', event);
      return;
  }
  
  // Utiliser la room user:userId
  const room = `user:${userId}`;
  io.to(room).emit(event, data);
  console.log(`📤 Emitting ${event} to room ${room} for user ${userId}`);
  
  // Debug: check if room has members
  const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
  console.log(`ℹ️ Room ${room} has ${roomSize} connected clients`);
};

// Helper spécifique pour les notifications d'absence
exports.emitAbsenceNotification = (parentId, notificationData) => {
    exports.emitToUser(parentId, 'notification:absence', notificationData);
};

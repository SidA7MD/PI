const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Route pour enregistrer le push token (SANS authentification pour le moment)
router.post('/register', async (req, res) => {
    try {
        const { pushToken, userId } = req.body;

        if (!pushToken || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Push token et userId requis'
            });
        }

        // Mettre à jour le push token de l'utilisateur
        const user = await User.findByIdAndUpdate(
            userId,
            { pushToken: pushToken },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }

        console.log(`✅ Push token enregistré pour l'utilisateur ${userId}`);

        res.json({
            success: true,
            message: 'Push token enregistré avec succès'
        });
    } catch (error) {
        console.error('Error registering push token:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'enregistrement du push token'
        });
    }
});

// Route optionnelle pour supprimer le push token (lors de la déconnexion)
router.post('/unregister', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId requis'
            });
        }

        await User.findByIdAndUpdate(userId, {
            pushToken: null
        });

        res.json({
            success: true,
            message: 'Push token supprimé avec succès'
        });
    } catch (error) {
        console.error('Error unregistering push token:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du push token'
        });
    }
});

module.exports = router;
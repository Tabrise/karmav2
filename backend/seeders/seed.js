const { User } = require('../models');

const seedDatabase = async () => {
    try {
        // Création d'un utilisateur admin par défaut
        await User.create({
            login: 'admin',
            password: 'admin123',
            role: 'admin',
            nom: 'Admin',
            prenom: 'System',
            email: 'admin@karma.com'
        });

        console.log('Base de données initialisée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
    }
};

module.exports = seedDatabase; 
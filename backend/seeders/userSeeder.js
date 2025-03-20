const { User } = require('../models');
const { faker } = require('@faker-js/faker/locale/fr');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
    try {
        // Supprime tous les utilisateurs existants
        await User.destroy({ where: {} });

        const users = [];

        // Crée l'utilisateur admin par défaut
        users.push({
            nom: 'Admin',
            prenom: 'User',
            email: 'admin@example.com',
            login: 'admin',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        for (let i = 0; i < 5; i++) {
            const prenom = faker.person.firstName();
            const nom = faker.person.lastName();
            const login = faker.internet.userName({ firstName: prenom, lastName: nom }).toLowerCase();
            
            users.push({
                nom: nom,
                prenom: prenom,
                email: faker.internet.email({ firstName: prenom, lastName: nom }).toLowerCase(),
                login: login,
                password: await bcrypt.hash('password123', 10),
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        // Insère tous les utilisateurs
        await User.bulkCreate(users);
        console.log(`${users.length} utilisateurs ont été créés avec succès.`);

    } catch (error) {
        console.error('Erreur lors de la création des utilisateurs:', error);
    }
};

module.exports = seedUsers; 
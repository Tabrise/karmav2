const { Patient } = require('../models');
const { faker } = require('@faker-js/faker/locale/fr');

const seedPatients = async () => {
    try {
        // Supprimer tous les patients existants
        await Patient.destroy({ where: {} });

        // Créer 50 patients de test
        const patients = [];
        for (let i = 0; i < 50; i++) {
            patients.push({
                nom: faker.person.lastName(),
                prenom: faker.person.firstName(),
                email: faker.internet.email(),
                telephone: faker.phone.number('0# ## ## ## ##'),
                adresse: `${faker.location.streetAddress()}, ${faker.location.zipCode()} ${faker.location.city()}`,
                dateNaissance: faker.date.between({ 
                    from: '1940-01-01', 
                    to: '2005-12-31' 
                }),
                commentaire: Math.random() > 0.7 ? faker.lorem.paragraph() : null
            });
        }

        // Insérer les patients dans la base de données
        await Patient.bulkCreate(patients);

        console.log('Base de données initialisée avec 50 patients de test');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des patients:', error);
    }
};

module.exports = seedPatients; 
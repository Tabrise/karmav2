const { Rdv, Patient, User } = require('../models');
const { faker } = require('@faker-js/faker/locale/fr');
const { addDays, setHours, setMinutes, addMinutes, format } = require('date-fns');

const durees = [15, 30, 45, 60, 90, 120];

const seedRdvs = async () => {
    try {
        // Supprime tous les rendez-vous existants
        await Rdv.destroy({ where: {} });

        // Récupère tous les patients et praticiens
        const patients = await Patient.findAll();
        const praticiens = await User.findAll();

        if (patients.length === 0 || praticiens.length === 0) {
            console.log('Aucun patient ou praticien trouvé. Impossible de créer des rendez-vous.');
            return;
        }

        const rdvs = [];
        const startDate = new Date();

        // Crée des rendez-vous pour les 30 prochains jours
        for (let i = 0; i < 30; i++) {
            const currentDate = addDays(startDate, i);
            
            // 3 à 8 rendez-vous par jour
            const numberOfRdvs = faker.number.int({ min: 3, max: 8 });

            for (let j = 0; j < numberOfRdvs; j++) {
                // Heure de début entre 9h et 17h
                const heureDebut = setMinutes(
                    setHours(currentDate, faker.number.int({ min: 9, max: 17 })),
                    faker.number.int({ min: 0, max: 3 }) * 15 // Minutes par tranches de 15
                );

                const duree = faker.helpers.arrayElement(durees);
                const heureFin = addMinutes(heureDebut, duree);

                rdvs.push({
                    patientId: faker.helpers.arrayElement(patients).id,
                    praticienId: faker.helpers.arrayElement(praticiens).id,
                    date: format(currentDate, 'yyyy-MM-dd'),
                    heureDebut: format(heureDebut, 'HH:mm'),
                    heureFin: format(heureFin, 'HH:mm'),
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        // Insère tous les rendez-vous
        await Rdv.bulkCreate(rdvs);
        console.log(`${rdvs.length} rendez-vous ont été créés avec succès.`);

    } catch (error) {
        console.error('Erreur lors de la création des rendez-vous:', error);
    }
};

module.exports = seedRdvs; 
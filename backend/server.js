const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const { Patient, User, Service, Rdv } = require('./models');
const seedDatabase = require('./seeders/userSeeder');
const seedPatients = require('./seeders/patientSeeder');
const seedRdvs = require('./seeders/rdvSeeder');

// Import des routes
const patientRoutes = require('./routes/patientRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const rdvRoutes = require('./routes/rdvRoutes');
const disponibilitesRoutes = require('./routes/disponibilitesRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test de la connexion à la base de données
sequelize.authenticate()
    .then(() => {
        console.log('Connection to database has been established successfully.');
        return sequelize.sync({ alter: true });
    })
    .then(async () => {
        console.log('Database synchronized');
        // Exécution des seeders dans l'ordre
        try {
            await seedDatabase();
            console.log('Users seeded successfully');
            
            await seedPatients();
            console.log('Patients seeded successfully');
            
        } catch (error) {
            console.error('Error seeding database:', error);
        }
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/rdvs', rdvRoutes);
app.use('/api/disponibilites', disponibilitesRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API Karma' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 
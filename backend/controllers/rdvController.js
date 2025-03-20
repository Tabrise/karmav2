const { Rdv, Patient, User } = require('../models');
const { Op } = require('sequelize');

// Obtenir tous les rendez-vous
exports.getAllRdvs = async (req, res) => {
    try {
        const rdvs = await Rdv.findAll({
            include: [
                { model: Patient },
                { model: User }
            ]
        });
        res.json(rdvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un rendez-vous par son ID
exports.getRdvById = async (req, res) => {
    try {
        const rdv = await Rdv.findByPk(req.params.id, {
            include: [
                { model: Patient },
                { model: User }
            ]
        });
        if (!rdv) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json(rdv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouveau rendez-vous
exports.createRdv = async (req, res) => {
    try {
        // Vérifier que le patient et le praticien existent
        const patient = await Patient.findByPk(req.body.PatientId);
        const praticien = await User.findByPk(req.body.UserId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient non trouvé' });
        }
        if (!praticien) {
            return res.status(404).json({ message: 'Praticien non trouvé' });
        }

        console.log('Date reçue:', req.body.date); // Debug

        // Créer le rendez-vous en s'assurant que la date est au bon format
        const rdv = await Rdv.create({
            PatientId: req.body.PatientId,
            UserId: req.body.UserId,
            date: req.body.date,
            heureDebut: req.body.heureDebut,
            heureFin: req.body.heureFin
        }, {
            // Désactiver la conversion automatique des dates par Sequelize
            raw: true,
            plain: true
        });

        // Récupérer le rendez-vous avec ses relations
        const rdvWithRelations = await Rdv.findByPk(rdv.id, {
            include: [
                { model: Patient },
                { model: User }
            ],
            // Désactiver la conversion automatique des dates
            raw: true,
            nest: true
        });

        console.log('RDV créé:', rdvWithRelations); // Debug

        res.status(201).json(rdvWithRelations);
    } catch (error) {
        console.error('Erreur lors de la création du rendez-vous:', error);
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un rendez-vous
exports.updateRdv = async (req, res) => {
    try {
        const rdv = await Rdv.findByPk(req.params.id);
        if (!rdv) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        await rdv.update(req.body);
        const updatedRdv = await Rdv.findByPk(req.params.id, {
            include: [
                { model: Patient },
                { model: User }
            ]
        });
        res.json(updatedRdv);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un rendez-vous
exports.deleteRdv = async (req, res) => {
    try {
        const rdv = await Rdv.findByPk(req.params.id);
        if (!rdv) {
            return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        await rdv.destroy();
        res.json({ message: 'Rendez-vous supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les rendez-vous d'un praticien
exports.getRdvsByPraticien = async (req, res) => {
    try {
        const rdvs = await Rdv.findAll({
            where: {
                userId: req.params.praticienId
            },
            include: [
                {
                    model: Patient,
                    attributes: ['id', 'nom', 'prenom']
                },
                {
                    model: User,
                    attributes: ['id', 'nom', 'prenom']
                }
            ],
            order: [
                ['date', 'ASC'],
                ['heureDebut', 'ASC']
            ]
        });
        res.json(rdvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les rendez-vous d'une semaine pour un praticien
exports.getRdvsSemaine = async (req, res) => {
    try {
        const { startDate, endDate, praticienId } = req.params;
        
        const rdvs = await Rdv.findAll({
            where: {
                UserId: praticienId,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: Patient,
                    attributes: ['id', 'nom', 'prenom']
                },
                {
                    model: User,
                    attributes: ['id', 'nom', 'prenom']
                }
            ],
            order: [
                ['date', 'ASC'],
                ['heureDebut', 'ASC']
            ]
        });
        res.json(rdvs);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous de la semaine:', error);
        res.status(500).json({ message: error.message });
    }
}; 
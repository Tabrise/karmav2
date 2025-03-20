const { Disponibilite, User } = require('../models');
const { Op } = require('sequelize');

// Obtenir toutes les disponibilités d'un utilisateur
exports.getDisponibilitesUser = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log('Recherche des disponibilités:', {
            userId: req.params.userId,
            startDate,
            endDate
        });

        const disponibilites = await Disponibilite.findAll({
            where: {
                UserId: req.params.userId,
                dateSpecifique: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [{ model: User }],
            order: [['dateSpecifique', 'ASC'], ['heureDebut', 'ASC']]
        });

        console.log('Disponibilités trouvées:', disponibilites);
        res.json(disponibilites);
    } catch (error) {
        console.error('Erreur lors de la récupération des disponibilités:', error);
        res.status(500).json({ message: error.message });
    }
};

// Créer une nouvelle disponibilité
exports.createDisponibilite = async (req, res) => {
    try {
        const { dateSpecifique, heureDebut, heureFin, UserId } = req.body;

        // Vérifier si une disponibilité existe déjà pour cette plage horaire
        const existingDisponibilite = await Disponibilite.findOne({
            where: {
                UserId,
                dateSpecifique,
                [Op.or]: [
                    {
                        heureDebut: {
                            [Op.between]: [heureDebut, heureFin]
                        }
                    },
                    {
                        heureFin: {
                            [Op.between]: [heureDebut, heureFin]
                        }
                    }
                ]
            }
        });

        if (existingDisponibilite) {
            return res.status(400).json({ message: 'Une disponibilité existe déjà sur ce créneau' });
        }

        const disponibilite = await Disponibilite.create({
            dateSpecifique,
            heureDebut,
            heureFin,
            UserId
        });

        res.status(201).json(disponibilite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer une disponibilité
exports.deleteDisponibilite = async (req, res) => {
    try {
        const disponibilite = await Disponibilite.findByPk(req.params.id);
        if (!disponibilite) {
            return res.status(404).json({ message: 'Disponibilité non trouvée' });
        }
        await disponibilite.destroy();
        res.json({ message: 'Disponibilité supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vérifier la disponibilité pour un créneau
exports.checkDisponibilite = async (req, res) => {
    try {
        const { userId, dateSpecifique, heureDebut, heureFin } = req.query;

        const disponibilite = await Disponibilite.findOne({
            where: {
                UserId: userId,
                dateSpecifique: dateSpecifique,
                heureDebut: {
                    [Op.lte]: heureDebut
                },
                heureFin: {
                    [Op.gte]: heureFin
                }
            }
        });

        res.json({ disponible: !!disponibilite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
const { Service, Patient } = require('../models');

// Obtenir tous les services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll({
            include: [Patient]
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un service par son ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id, {
            include: [Patient]
        });
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouveau service
exports.createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un service
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        await service.update(req.body);
        res.json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un service
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        await service.destroy();
        res.json({ message: 'Service supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
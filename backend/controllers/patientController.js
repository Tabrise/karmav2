const { Patient, Service } = require('../models');

// Obtenir tous les patients
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [Service]
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un patient par son ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [Service]
        });
        if (!patient) {
            return res.status(404).json({ message: 'Patient non trouvé' });
        }
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouveau patient
exports.createPatient = async (req, res) => {
    try {
        const patient = await Patient.create(req.body);
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un patient
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient non trouvé' });
        }
        await patient.update(req.body);
        res.json(patient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un patient
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient non trouvé' });
        }
        await patient.destroy();
        res.json({ message: 'Patient supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 
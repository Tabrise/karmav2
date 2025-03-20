const express = require('express');
const router = express.Router();
const rdvController = require('../controllers/rdvController');

// Routes pour les rendez-vous
router.get('/', rdvController.getAllRdvs);
router.get('/semaine/:startDate/:endDate/:praticienId', rdvController.getRdvsSemaine);
router.get('/praticien/:praticienId', rdvController.getRdvsByPraticien);
router.get('/:id', rdvController.getRdvById);
router.post('/', rdvController.createRdv);
router.put('/:id', rdvController.updateRdv);
router.delete('/:id', rdvController.deleteRdv);

module.exports = router; 
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Alert,
    Autocomplete
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fr } from 'date-fns/locale';
import api from '../config/api';

const NewPatientDialog = ({ open, onClose, onPatientAdded }) => {
    const initialFormData = {
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        dateNaissance: null,
        commentaire: '',
        service: null
    };

    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [services, setServices] = useState([]);

    useEffect(() => {
        if (open) {
            fetchServices();
        }
    }, [open]);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des services:', error);
            setSubmitError('Erreur lors de la récupération des services');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nom) newErrors.nom = 'Le nom est requis';
        if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
        if (!formData.email) {
            newErrors.email = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'L\'email n\'est pas valide';
        }
        if (!formData.telephone) {
            newErrors.telephone = 'Le téléphone est requis';
        } else if (!/^0[1-9][0-9]{8}$/.test(formData.telephone.replace(/\s/g, ''))) {
            newErrors.telephone = 'Le numéro de téléphone n\'est pas valide';
        }
        if (!formData.adresse) newErrors.adresse = 'L\'adresse est requise';
        if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
        if (!formData.service) newErrors.service = 'Le service est requis';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const patientData = {
                ...formData,
                serviceId: formData.service.id
            };
            delete patientData.service;

            const response = await api.post('/patients', patientData);
            onPatientAdded(response.data);
            handleClose();
        } catch (error) {
            setSubmitError(error.response?.data?.message || 'Une erreur est survenue lors de la création du patient');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData(initialFormData);
        setErrors({});
        setSubmitError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Nouveau patient</DialogTitle>
            <DialogContent>
                {submitError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {submitError}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <Autocomplete
                            options={services}
                            getOptionLabel={(service) => service.nom}
                            value={formData.service}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    service: newValue
                                }));
                                if (errors.service) {
                                    setErrors(prev => ({
                                        ...prev,
                                        service: ''
                                    }));
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Service"
                                    required
                                    error={!!errors.service}
                                    helperText={errors.service}
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="nom"
                            label="Nom"
                            value={formData.nom}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.nom}
                            helperText={errors.nom}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="prenom"
                            label="Prénom"
                            value={formData.prenom}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.prenom}
                            helperText={errors.prenom}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="telephone"
                            label="Téléphone"
                            value={formData.telephone}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.telephone}
                            helperText={errors.telephone}
                            placeholder="0X XX XX XX XX"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="adresse"
                            label="Adresse"
                            value={formData.adresse}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.adresse}
                            helperText={errors.adresse}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                            <DatePicker
                                label="Date de naissance"
                                value={formData.dateNaissance}
                                onChange={(newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        dateNaissance: newValue
                                    }));
                                    if (errors.dateNaissance) {
                                        setErrors(prev => ({
                                            ...prev,
                                            dateNaissance: ''
                                        }));
                                    }
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!errors.dateNaissance,
                                        helperText: errors.dateNaissance
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="commentaire"
                            label="Commentaire"
                            value={formData.commentaire}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Annuler</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Création...' : 'Créer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewPatientDialog; 
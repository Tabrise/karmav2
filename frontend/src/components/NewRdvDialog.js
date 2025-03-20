import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Alert,
    TextField,
    Autocomplete,
    MenuItem
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { fr } from 'date-fns/locale';
import { format, addMinutes } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const durees = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 heure' },
    { value: 90, label: '1 heure 30' },
    { value: 120, label: '2 heures' },
    { value: 150, label: '2 heures 30' },
    { value: 180, label: '3 heures' },
    { value: 210, label: '3 heures 30' },
    { value: 240, label: '4 heures' },
    { value: 270, label: '4 heures 30' },
    { value: 300, label: '5 heures' },
    { value: 330, label: '5 heures 30' },
    { value: 360, label: '6 heures' },
    { value: 390, label: '6 heures 30' },
    { value: 420, label: '7 heures' },
    { value: 450, label: '7 heures 30' },
    { value: 480, label: '8 heures' },
    { value: 510, label: '8 heures 30' },
    { value: 540, label: '9 heures' },
    { value: 570, label: '9 heures 30' },
    { value: 600, label: '10 heures' }
];

const NewRdvDialog = ({ open, onClose, onRdvAdded, initialData }) => {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [praticiens, setPraticiens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        patient: null,
        date: new Date(),
        heureDebut: new Date(),
        duree: 30,
        praticien: user
    });

    useEffect(() => {
        if (open) {
            fetchPatients();
            fetchPraticiens();
        }
    }, [open]);

    useEffect(() => {
        if (initialData && initialData.date && initialData.heureDebut) {
            // Créer la date sans le décalage horaire
            const [year, month, day] = initialData.date.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const heureDebut = new Date(year, month - 1, day);
            const [heures, minutes] = initialData.heureDebut.split(':');
            heureDebut.setHours(parseInt(heures), parseInt(minutes), 0);

            console.log('Date initiale:', initialData.date); // Debug
            console.log('Date créée:', dateObj); // Debug

            setFormData(prev => ({
                ...prev,
                date: dateObj,
                heureDebut: heureDebut,
                praticien: praticiens.find(p => p.id === initialData.praticienId) || user
            }));
        }
    }, [initialData, praticiens, user]);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des patients:', error);
            setError('Erreur lors de la récupération des patients');
        }
    };

    const fetchPraticiens = async () => {
        try {
            const response = await api.get('/users');
            setPraticiens(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des praticiens:', error);
            setError('Erreur lors de la récupération des praticiens');
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const heureFin = addMinutes(formData.heureDebut, formData.duree);
            
            // S'assurer que la date est au bon format sans décalage horaire
            const dateToSend = format(formData.date, 'yyyy-MM-dd');
            
            // Vérifier d'abord la disponibilité
            const disponibiliteResponse = await api.get('/disponibilites/check', {
                params: {
                    userId: formData.praticien.id,
                    dateSpecifique: dateToSend,
                    heureDebut: format(formData.heureDebut, 'HH:mm'),
                    heureFin: format(heureFin, 'HH:mm')
                }
            });

            if (!disponibiliteResponse.data.disponible) {
                setError('Le praticien n\'est pas disponible sur ce créneau');
                setLoading(false);
                return;
            }

            const rdvData = {
                PatientId: formData.patient.id,
                UserId: formData.praticien.id,
                date: dateToSend,
                heureDebut: format(formData.heureDebut, 'HH:mm'),
                heureFin: format(heureFin, 'HH:mm')
            };

            const response = await api.post('/rdvs', rdvData);
            if (onRdvAdded) {
                onRdvAdded(response.data);
            }
            handleClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la création du rendez-vous');
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.patient) {
            setError('Veuillez sélectionner un patient');
            return false;
        }
        if (!formData.date) {
            setError('Veuillez sélectionner une date');
            return false;
        }
        if (!formData.heureDebut) {
            setError('Veuillez sélectionner une heure de début');
            return false;
        }
        return true;
    };

    const handleClose = () => {
        setFormData({
            patient: null,
            date: new Date(),
            heureDebut: new Date(),
            duree: 30,
            praticien: user
        });
        setError('');
        onClose();
    };

    const getHeureFinPreview = () => {
        if (!formData.heureDebut || !formData.duree) return '';
        const heureFin = addMinutes(formData.heureDebut, formData.duree);
        return format(heureFin, 'HH:mm');
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Nouveau rendez-vous</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <Autocomplete
                            options={patients}
                            getOptionLabel={(patient) => `${patient.nom} ${patient.prenom}`}
                            value={formData.patient}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    patient: newValue
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Patient"
                                    required
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            options={praticiens}
                            getOptionLabel={(praticien) => `${praticien.nom} ${praticien.prenom}`}
                            value={formData.praticien}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    praticien: newValue || user
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Praticien"
                                    required
                                    fullWidth
                                />
                            )}
                            defaultValue={user}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                            <DatePicker
                                label="Date"
                                value={formData.date}
                                onChange={(newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        date: newValue
                                    }));
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                            <TimePicker
                                label="Heure de début"
                                value={formData.heureDebut}
                                onChange={(newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        heureDebut: newValue
                                    }));
                                }}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Durée"
                            value={formData.duree}
                            onChange={(e) => {
                                setFormData(prev => ({
                                    ...prev,
                                    duree: parseInt(e.target.value)
                                }));
                            }}
                            fullWidth
                            required
                        >
                            {durees.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Heure de fin (calculée)"
                            value={getHeureFinPreview()}
                            fullWidth
                            disabled
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Annuler</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={loading}
                >
                    {loading ? 'Création...' : 'Créer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewRdvDialog; 
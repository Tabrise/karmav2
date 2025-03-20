import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Button,
    Grid,
    TextField,
    Box,
    Alert,
    Typography,
    styled
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '../config/api';

const Header = styled(Box)(({ theme }) => ({
    backgroundColor: '#00BCD4',
    color: 'white',
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        maxWidth: '600px',
        width: '100%'
    }
}));

const RdvDetailsDialog = ({ open, onClose, rdv, onRdvUpdated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Reset states when rdv changes
    React.useEffect(() => {
        if (rdv) {
            setRdvData({
                date: rdv.date ? new Date(rdv.date) : new Date(),
                heureDebut: rdv.heureDebut || '',
                heureFin: rdv.heureFin || '',
                commentaire: rdv.commentaire || ''
            });
            setPatientData({
                nom: rdv.Patient?.nom || '',
                prenom: rdv.Patient?.prenom || '',
                dateNaissance: rdv.Patient?.dateNaissance ? new Date(rdv.Patient.dateNaissance) : null,
                telephone: rdv.Patient?.telephone || '',
                telephoneUrgence: rdv.Patient?.telephoneUrgence || '',
                email: rdv.Patient?.email || '',
                ville: rdv.Patient?.ville || '',
                service: rdv.Patient?.service || '',
                commentaire: rdv.Patient?.commentaire || ''
            });
        }
    }, [rdv]);

    const [rdvData, setRdvData] = useState({
        date: new Date(),
        heureDebut: '',
        heureFin: '',
        commentaire: ''
    });

    const [patientData, setPatientData] = useState({
        nom: '',
        prenom: '',
        dateNaissance: null,
        telephone: '',
        telephoneUrgence: '',
        email: '',
        ville: '',
        service: '',
        commentaire: ''
    });

    const handleRdvUpdate = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.put(`/rdvs/${rdv.id}`, {
                date: format(rdvData.date, 'yyyy-MM-dd'),
                heureDebut: rdvData.heureDebut,
                heureFin: rdvData.heureFin,
                commentaire: rdvData.commentaire
            });
            onRdvUpdated(response.data);
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la mise à jour du rendez-vous');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose}>
            <Header>
                <Typography variant="h6">
                    Rendez-vous
                </Typography>
                <Typography>
                    {rdvData.date && !isNaN(rdvData.date) ? format(rdvData.date, 'dd/MM/yyyy') : ''} 
                    {rdvData.heureDebut ? ` - ${rdvData.heureDebut}` : ''}
                </Typography>
            </Header>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Informations du rendez-vous
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Patient*"
                                fullWidth
                                value={`${patientData.nom} ${patientData.prenom}`}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                                <DatePicker
                                    label="Date*"
                                    value={rdvData.date}
                                    onChange={(newValue) => {
                                        setRdvData(prev => ({
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
                                    label="Heure*"
                                    value={rdvData.heureDebut ? new Date(`2000-01-01T${rdvData.heureDebut}`) : null}
                                    onChange={(newValue) => {
                                        if (newValue && !isNaN(newValue)) {
                                            setRdvData(prev => ({
                                                ...prev,
                                                heureDebut: format(newValue, 'HH:mm'),
                                                heureFin: format(new Date(newValue.getTime() + 30 * 60000), 'HH:mm')
                                            }));
                                        }
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
                                label="Durée*"
                                fullWidth
                                value={(() => {
                                    try {
                                        if (!rdvData.heureDebut || !rdvData.heureFin) return "30";
                                        const debut = new Date(`2000-01-01T${rdvData.heureDebut}`);
                                        const fin = new Date(`2000-01-01T${rdvData.heureFin}`);
                                        const diffMinutes = (fin - debut) / (1000 * 60);
                                        return String(diffMinutes);
                                    } catch (e) {
                                        return "30";
                                    }
                                })()}
                                onChange={(e) => {
                                    try {
                                        const minutes = parseInt(e.target.value);
                                        const debutDate = new Date(`2000-01-01T${rdvData.heureDebut || '09:00'}`);
                                        const finDate = new Date(debutDate.getTime() + minutes * 60000);
                                        setRdvData(prev => ({
                                            ...prev,
                                            heureFin: format(finDate, 'HH:mm')
                                        }));
                                    } catch (e) {
                                        console.error('Erreur lors du calcul de la durée:', e);
                                    }
                                }}
                                SelectProps={{
                                    native: true
                                }}
                            >
                                <option value="30">30 minutes</option>
                                <option value="60">1 heure</option>
                                <option value="90">1 heure 30</option>
                                <option value="120">2 heures</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Commentaire"
                                fullWidth
                                multiline
                                rows={4}
                                value={rdvData.commentaire}
                                onChange={(e) => setRdvData(prev => ({
                                    ...prev,
                                    commentaire: e.target.value
                                }))}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
                        Coordonnées du patient
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Prénom"
                                fullWidth
                                value={patientData.prenom}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    prenom: e.target.value
                                }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Nom*"
                                fullWidth
                                required
                                value={patientData.nom}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    nom: e.target.value
                                }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Email"
                                fullWidth
                                value={patientData.email}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    email: e.target.value
                                }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                                <DatePicker
                                    label="Date de naissance"
                                    value={patientData.dateNaissance}
                                    onChange={(newValue) => {
                                        setPatientData(prev => ({
                                            ...prev,
                                            dateNaissance: newValue
                                        }));
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Téléphone*"
                                fullWidth
                                required
                                value={patientData.telephone}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    telephone: e.target.value
                                }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Téléphone entourage"
                                fullWidth
                                value={patientData.telephoneUrgence}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    telephoneUrgence: e.target.value
                                }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Ville*"
                                fullWidth
                                required
                                value={patientData.ville}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    ville: e.target.value
                                }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Service*"
                                fullWidth
                                required
                                value={patientData.service}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    service: e.target.value
                                }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Commentaire"
                                fullWidth
                                multiline
                                rows={4}
                                value={patientData.commentaire}
                                onChange={(e) => setPatientData(prev => ({
                                    ...prev,
                                    commentaire: e.target.value
                                }))}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={onClose}>
                    Fermer
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleRdvUpdate}
                    disabled={loading}
                >
                    Enregistrer
                </Button>
            </Box>
        </StyledDialog>
    );
};

export default RdvDetailsDialog; 
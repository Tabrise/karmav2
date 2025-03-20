import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    IconButton,
    Typography
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { format, parse } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../config/api';

const DisponibiliteDialog = ({ open, onClose, disponibilite, onSave, onDelete, jourSemaine }) => {
    const [heureDebut, setHeureDebut] = useState(null);
    const [heureFin, setHeureFin] = useState(null);
    const [recurrent, setRecurrent] = useState(true);
    const [dateSpecifique, setDateSpecifique] = useState('');

    useEffect(() => {
        if (disponibilite) {
            // Convertir les heures en objets Date pour le TimePicker
            setHeureDebut(parse(disponibilite.heureDebut, 'HH:mm', new Date()));
            setHeureFin(parse(disponibilite.heureFin, 'HH:mm', new Date()));
            setRecurrent(disponibilite.recurrent);
            setDateSpecifique(disponibilite.dateSpecifique || '');
        } else {
            // Valeurs par défaut pour une nouvelle disponibilité
            setHeureDebut(parse('09:00', 'HH:mm', new Date()));
            setHeureFin(parse('10:00', 'HH:mm', new Date()));
            setRecurrent(true);
            setDateSpecifique('');
        }
    }, [disponibilite]);

    const handleSave = async () => {
        const disponibiliteData = {
            jourSemaine: jourSemaine,
            heureDebut: format(heureDebut, 'HH:mm'),
            heureFin: format(heureFin, 'HH:mm'),
            recurrent,
            dateSpecifique: dateSpecifique || null
        };

        onSave(disponibiliteData);
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
            onDelete();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {disponibilite ? 'Modifier la disponibilité' : 'Nouvelle disponibilité'}
                {disponibilite && (
                    <IconButton onClick={handleDelete} color="error">
                        <DeleteIcon />
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TimePicker
                                label="Heure de début"
                                value={heureDebut}
                                onChange={setHeureDebut}
                                format="HH:mm"
                                ampm={false}
                                sx={{ flex: 1 }}
                            />
                            <TimePicker
                                label="Heure de fin"
                                value={heureFin}
                                onChange={setHeureFin}
                                format="HH:mm"
                                ampm={false}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={recurrent}
                                    onChange={(e) => setRecurrent(e.target.checked)}
                                />
                            }
                            label="Récurrent chaque semaine"
                        />
                        {!recurrent && (
                            <TextField
                                label="Date spécifique"
                                type="date"
                                value={dateSpecifique}
                                onChange={(e) => setDateSpecifique(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        )}
                    </Box>
                </LocalizationProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {disponibilite ? 'Modifier' : 'Ajouter'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DisponibiliteDialog; 
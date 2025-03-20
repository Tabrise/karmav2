import React, { useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    Select,
    MenuItem,
    Paper,
    Typography,
    Button,
    IconButton,
    TextField,
    Stack
} from '@mui/material';
import { ChevronLeft, ChevronRight, Add, Delete } from '@mui/icons-material';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '../../config/api';

const DisponibilitesPraticiens = () => {
    const [praticienId, setPraticienId] = useState('');
    const [praticiens, setPraticiens] = useState([]);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [disponibilites, setDisponibilites] = useState([]);

    // Charger les praticiens
    useEffect(() => {
        const fetchPraticiens = async () => {
            try {
                const response = await api.get('/users');
                setPraticiens(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des praticiens:', error);
            }
        };
        fetchPraticiens();
    }, []);

    // Charger les disponibilités du praticien
    useEffect(() => {
        const fetchDisponibilites = async () => {
            if (!praticienId) {
                setDisponibilites([]);
                return;
            }
            try {
                const startDate = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                const endDate = format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');
                const response = await api.get(`/disponibilites/user/${praticienId}`, {
                    params: {
                        startDate,
                        endDate
                    }
                });
                setDisponibilites(response.data);
            } catch (error) {
                console.error('Erreur lors du chargement des disponibilités:', error);
            }
        };
        fetchDisponibilites();
    }, [praticienId, currentWeek]);

    const handlePreviousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
    const handleNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));

    const getDaysOfWeek = () => {
        const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
        return Array.from({ length: 5 }, (_, i) => addDays(start, i));
    };

    const handleAddDisponibilite = async (date, heureDebut, heureFin) => {
        try {
            await api.post('/disponibilites', {
                UserId: praticienId,
                dateSpecifique: format(date, 'yyyy-MM-dd'),
                heureDebut,
                heureFin
            });

            // Recharger les disponibilités
            const startDate = format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const endDate = format(addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');
            const response = await api.get(`/disponibilites/user/${praticienId}`, {
                params: {
                    startDate,
                    endDate
                }
            });
            setDisponibilites(response.data);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la disponibilité:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Erreur lors de l\'ajout de la disponibilité');
            }
        }
    };

    const handleDeleteDisponibilite = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette disponibilité ?')) {
            try {
                await api.delete(`/disponibilites/${id}`);
                setDisponibilites(prev => prev.filter(d => d.id !== id));
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression de la disponibilité');
            }
        }
    };

    const getDisponibilitesForDay = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return disponibilites.filter(d => format(new Date(d.dateSpecifique), 'yyyy-MM-dd') === dateStr);
    };

    return (
        <Box sx={{ p: 2, maxWidth: '95%', margin: '0 auto' }}>
            {/* En-tête */}
            <Paper sx={{ mb: 2, backgroundColor: theme => theme.palette.primary.main, color: 'white' }}>
                <Box sx={{ p: 1.5 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontSize: '1.1rem' }}>
                        DISPONIBILITÉS DE LA SEMAINE
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <FormControl size="small" sx={{ minWidth: 180, backgroundColor: 'white', borderRadius: 1 }}>
                            <Select
                                value={praticienId}
                                onChange={(e) => setPraticienId(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Sélectionner un praticien</MenuItem>
                                {praticiens.map((praticien) => (
                                    <MenuItem key={praticien.id} value={praticien.id}>
                                        {praticien.nom} {praticien.prenom}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={handlePreviousWeek} sx={{ color: 'white', padding: 0.5 }}>
                                <ChevronLeft />
                            </IconButton>
                            <Typography sx={{ fontSize: '0.9rem' }}>
                                Semaine du {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'dd/MM/yyyy')}
                            </Typography>
                            <IconButton onClick={handleNextWeek} sx={{ color: 'white', padding: 0.5 }}>
                                <ChevronRight />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Grille des jours */}
            <Box sx={{ display: 'flex', gap: 1 }}>
                {getDaysOfWeek().map((date) => (
                    <Paper 
                        key={date} 
                        sx={{ 
                            p: 1.5, 
                            flex: 1,
                            minWidth: 0,
                            maxWidth: '20%'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontSize: '0.9rem', mb: 1.5 }}>
                            {format(date, 'EEEE dd/MM', { locale: fr })}
                        </Typography>

                        <Stack spacing={1}>
                            {/* Formulaire d'ajout */}
                            {praticienId && (
                                <Box 
                                    component="form" 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        mb: 1,
                                        backgroundColor: 'background.default',
                                        p: 1,
                                        borderRadius: 1
                                    }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.target);
                                        handleAddDisponibilite(
                                            date,
                                            formData.get('heureDebut'),
                                            formData.get('heureFin')
                                        );
                                        e.target.reset();
                                    }}
                                >
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <TextField
                                            name="heureDebut"
                                            type="time"
                                            defaultValue="09:00"
                                            size="small"
                                            sx={{ width: '40%', '& input': { py: 0.5, px: 0.5 } }}
                                            inputProps={{ step: 300 }}
                                        />
                                        <TextField
                                            name="heureFin"
                                            type="time"
                                            defaultValue="18:00"
                                            size="small"
                                            sx={{ width: '40%', '& input': { py: 0.5, px: 0.5 } }}
                                            inputProps={{ step: 300 }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="small"
                                            startIcon={<Add />}
                                            sx={{ flexGrow: 1, minWidth: 0, px: 0.5 }}
                                        >
                                            +
                                        </Button>
                                    </Box>
                                </Box>
                            )}

                            {/* Liste des disponibilités */}
                            {getDisponibilitesForDay(date).map((dispo) => (
                                <Box
                                    key={dispo.id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 0.75,
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText',
                                        borderRadius: 1,
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <Typography sx={{ fontSize: 'inherit' }}>
                                        {dispo.heureDebut} - {dispo.heureFin}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteDisponibilite(dispo.id)}
                                        sx={{ color: 'inherit', padding: 0.25 }}
                                    >
                                        <Delete sx={{ fontSize: '1.1rem' }} />
                                    </IconButton>
                                </Box>
                            ))}

                            {getDisponibilitesForDay(date).length === 0 && (
                                <Typography 
                                    color="text.secondary" 
                                    sx={{ 
                                        textAlign: 'center', 
                                        py: 1,
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Aucune disponibilité
                                </Typography>
                            )}
                        </Stack>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

export default DisponibilitesPraticiens; 
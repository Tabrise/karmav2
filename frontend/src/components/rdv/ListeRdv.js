import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Typography,
    TextField,
    InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import RdvDetailsDialog from '../RdvDetailsDialog';
import api from '../../config/api';

const ListeRdv = () => {
    const [rdvs, setRdvs] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRdv, setSelectedRdv] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        fetchRdvs();
    }, []);

    const fetchRdvs = async () => {
        try {
            const response = await api.get('/rdvs');
            setRdvs(response.data);
        } catch (error) {
            console.error('Erreur lors du chargement des rendez-vous:', error);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRdvClick = (rdv) => {
        setSelectedRdv(rdv);
        setIsDetailsOpen(true);
    };

    const handleRdvUpdate = (updatedRdv) => {
        fetchRdvs(); // Recharger la liste après une mise à jour
    };

    const filteredRdvs = rdvs.filter(rdv => {
        const searchStr = searchTerm.toLowerCase();
        return (
            rdv.Patient?.nom?.toLowerCase().includes(searchStr) ||
            rdv.Patient?.prenom?.toLowerCase().includes(searchStr) ||
            rdv.User?.nom?.toLowerCase().includes(searchStr) ||
            rdv.User?.prenom?.toLowerCase().includes(searchStr) ||
            format(new Date(rdv.date), 'dd/MM/yyyy').includes(searchStr)
        );
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Liste des rendez-vous
            </Typography>

            {/* Barre de recherche */}
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un rendez-vous..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Tableau des rendez-vous */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Horaire</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Praticien</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRdvs
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((rdv) => (
                                <TableRow
                                    key={rdv.id}
                                    hover
                                    onClick={() => handleRdvClick(rdv)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>
                                        {format(new Date(rdv.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                                    </TableCell>
                                    <TableCell>
                                        {rdv.heureDebut} - {rdv.heureFin}
                                    </TableCell>
                                    <TableCell>
                                        {rdv.Patient ? `${rdv.Patient.nom} ${rdv.Patient.prenom}` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {rdv.User ? `${rdv.User.nom} ${rdv.User.prenom}` : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredRdvs.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Lignes par page"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                />
            </TableContainer>

            {/* Dialog de détails du rendez-vous */}
            <RdvDetailsDialog
                open={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedRdv(null);
                }}
                rdv={selectedRdv}
                onRdvUpdated={handleRdvUpdate}
            />
        </Box>
    );
};

export default ListeRdv; 
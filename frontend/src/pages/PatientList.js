import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Typography,
    Paper,
    CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import api from '../config/api';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 10,
        page: 0,
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            field: 'nom', 
            headerName: 'Nom', 
            flex: 1,
            minWidth: 130 
        },
        { 
            field: 'prenom', 
            headerName: 'Prénom', 
            flex: 1,
            minWidth: 130 
        },
        { 
            field: 'dateNaissance', 
            headerName: 'Date de naissance', 
            flex: 1,
            minWidth: 130,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return new Date(params.value).toLocaleDateString('fr-FR');
            }
        },
        { 
            field: 'telephone', 
            headerName: 'Téléphone', 
            flex: 1,
            minWidth: 130 
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            flex: 1,
            minWidth: 200 
        },
        { 
            field: 'adresse', 
            headerName: 'Adresse', 
            flex: 1.5,
            minWidth: 200 
        }
    ];

    const filteredPatients = patients.filter(patient => {
        const searchStr = searchTerm.toLowerCase();
        return (
            patient.nom?.toLowerCase().includes(searchStr) ||
            patient.prenom?.toLowerCase().includes(searchStr) ||
            patient.email?.toLowerCase().includes(searchStr) ||
            patient.telephone?.toLowerCase().includes(searchStr)
        );
    });

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Liste des patients
            </Typography>

            <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
            />

            <Paper sx={{ height: 'calc(100vh - 250px)', width: '100%' }}>
                {loading ? (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        height="100%"
                    >
                        <CircularProgress />
                    </Box>
                ) : (
                    <DataGrid
                        rows={filteredPatients}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[10, 25, 50]}
                        localeText={{
                            noRowsLabel: 'Aucun patient',
                            noResultsOverlayLabel: 'Aucun résultat trouvé.',
                            errorOverlayDefaultLabel: 'Une erreur est survenue.',
                            
                            // Pagination
                            MuiTablePagination: {
                                labelRowsPerPage: 'Lignes par page:',
                                labelDisplayedRows: ({ from, to, count }) =>
                                    `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`,
                            },
                            
                            // Colonnes
                            columnMenuLabel: 'Menu',
                            columnMenuShowColumns: 'Afficher les colonnes',
                            columnMenuFilter: 'Filtrer',
                            columnMenuHideColumn: 'Cacher',
                            columnMenuUnsort: 'Non trié',
                            columnMenuSortAsc: 'Tri croissant',
                            columnMenuSortDesc: 'Tri décroissant',
                            
                            // Filtres
                            filterOperatorContains: 'Contient',
                            filterOperatorEquals: 'Égal à',
                            filterOperatorStartsWith: 'Commence par',
                            filterOperatorEndsWith: 'Se termine par',
                            filterOperatorIs: 'Est',
                            filterOperatorNot: 'N\'est pas',
                            filterOperatorAfter: 'Postérieur',
                            filterOperatorOnOrAfter: 'Postérieur ou égal',
                            filterOperatorBefore: 'Antérieur',
                            filterOperatorOnOrBefore: 'Antérieur ou égal',
                            filterOperatorIsEmpty: 'Est vide',
                            filterOperatorIsNotEmpty: 'N\'est pas vide',
                        }}
                        disableRowSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={{
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none'
                            }
                        }}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default PatientList; 
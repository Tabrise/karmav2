const { User, Rdv } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [Rdv]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un utilisateur par son ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [Rdv]
        });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Si le mot de passe est modifié, le hasher
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        
        await user.update(req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        await user.destroy();
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Authentification d'un utilisateur
exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;
        const user = await User.findOne({ where: { login } });
        
        if (!user) {
            return res.status(401).json({ message: 'Login ou mot de passe incorrect' });
        }
        
        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Login ou mot de passe incorrect' });
        }

        // Création du token JWT
        const token = jwt.sign(
            { 
                id: user.id,
                login: user.login,
                nom: user.nom,
                prenom: user.prenom
            },
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: '24h' }
        );
        
        res.json({
            user: {
                id: user.id,
                login: user.login,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Déconnexion
exports.logout = (req, res) => {
    // Le token est géré côté client, donc on renvoie simplement un message de succès
    res.json({ message: 'Déconnexion réussie' });
};

// Vérifier le token
exports.verifyToken = (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt');
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ message: 'Token invalide ou expiré' });
    }
}; 
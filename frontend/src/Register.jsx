import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('visitor');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // ✅ Validation manuelle
    if (!email || !password || !nom || !prenom || !telephone || !adresse) {
      setError('❗ Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/users/register', {
        email,
        password,
        role,
        nom,
        prenom,
        telephone,
        adresse,
      });
      setSuccess(true);
      setEmail('');
      setPassword('');
      setNom('');
      setPrenom('');
      setTelephone('');
      setAdresse('');

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/rdv');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          📝 Inscription
        </Typography>
        <Box component="form" onSubmit={handleRegister}>
          <TextField
            label="Prénom"
            fullWidth
            required
            margin="normal"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
          <TextField
            label="Nom"
            fullWidth
            required
            margin="normal"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <TextField
            label="Téléphone"
            fullWidth
            required
            margin="normal"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Adresse"
            fullWidth
            required
            margin="normal"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            select
            label="Rôle"
            value={role}
            fullWidth
            margin="normal"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="visitor">Visiteur</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>

          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? 'Création...' : "S'inscrire"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              ✅ Compte créé avec succès !
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

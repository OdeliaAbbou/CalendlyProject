import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    // Validation simple
    if (!email || !password) {
      setError('❗ Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/users/login', {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem('token', token); // Stocker le token dans localStorage
      localStorage.setItem('email', email);


      const decoded = jwtDecode(token);
      const userRole = decoded.role;
      const adminId = decoded.userId; // Supposons que l'ID de l'administrateur soit dans le champ `userId` du token

      // Stocker l'ID de l'administrateur dans localStorage
      localStorage.setItem('adminId', adminId);

      if (userRole === 'admin') {
        window.location.href = '/admin'; // Rediriger vers l'interface admin
      } else {
        window.location.href = '/rdv'; // Rediriger vers la page de RDV
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          🔐 Connexion
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
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
            label="Mot de passe"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box sx={{ mt: 2 }}>
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => window.location.href = '/signup'}
              sx={{ mt: 1 }}
            >
              Pas encore de compte ? S’inscrire
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {status && (
            <Alert severity={status.includes('ACCES') ? 'success' : 'info'} sx={{ mt: 2 }}>
              {status}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

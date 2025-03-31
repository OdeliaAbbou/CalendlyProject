import React, { useEffect, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Container,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Box,
  TextField
} from '@mui/material';

export default function VisitorView() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [status, setStatus] = useState('');
  const [adminId, setAdminId] = useState('67e8405cb9b7cc969cebe12f');
  const [visitorName, setVisitorName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🎫 Décodé depuis VisitorView :", decoded);

        if (decoded.role === 'admin') {
          window.location.href = '/admin';
        }
      } catch (err) {
        console.warn("Token invalide ou mal décodé :", err.message);
      }
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminIdFromUrl = urlParams.get('adminId') || adminId;
    setAdminId(adminIdFromUrl);

    if (selectedDay) {
      fetchSlots(adminIdFromUrl);
    }
  }, [selectedDay]);

  const fetchSlots = async (adminId) => {
    if (!selectedDay) return;
    const dateStr = selectedDay.toLocaleDateString('fr-CA'); // Format YYYY-MM-DD

    try {
      const modelRes = await axios.get(`http://localhost:3000/api/weekTemplate/${adminId}/${dateStr}`);
      const weekArray = modelRes.data.availability || [];

      const bookedRes = await axios.get(`http://localhost:3000/api/availabilities?date=${dateStr}`);
      const avaArray = bookedRes.data.map(slot => slot.time);

      console.log("🌼 weekArray (modèle):", weekArray);
      console.log("🌸 avaArray (déjà en base):", avaArray);

      const finalSlots = weekArray.map(time => ({
        date: dateStr,
        time,
        isBooked: avaArray.includes(time),
        _id: bookedRes.data.find(slot => slot.time === time)?._id || null
      }));

      console.log("✅ Résultat final (créneaux affichés) :", finalSlots);
      setAllSlots(finalSlots);
    } catch (err) {
      console.error("Erreur chargement slots :", err.message);
      setAllSlots([]);
    }
  };

  const handleReserve = async (slotId) => {
    setStatus('');
  
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('❌ Vous devez être connecté pour réserver un créneau.');
      return;
    }
  
    setLoadingId(slotId);  // Affiche le loader pour indiquer que la réservation est en cours
    try {
      // Appel à l'API pour réserver le créneau
      await axios.put(
        `http://localhost:3000/api/availabilities/book/${slotId}`,  // ID du créneau
        { visitorName: localStorage.getItem('email') },  // Nom du visiteur (utilisé ici l'email)
        { headers: { Authorization: `Bearer ${token}` } }  // Authentification avec le token
      );
  
      setStatus('✅ Rendez-vous réservé avec succès !');
      fetchSlots(adminId);  // Rafraîchit la liste des créneaux pour afficher les créneaux mis à jour
    } catch (err) {
      setStatus('❌ Erreur lors de la réservation : ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingId(null);  // Réinitialise l'état de chargement
    }
  };
  

  
  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        📅 Prise de rendez-vous
      </Typography>

      <Box sx={{ display: 'flex', gap: 5 }}>
        <Box sx={{ flex: 1 }}>
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
          />

          <TextField
            fullWidth
            label="Votre nom"
            sx={{ mt: 3 }}
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
          />
        </Box>

        <Box sx={{ flex: 2 }}>
          {selectedDay && (
            <>
              <Typography sx={{ mt: 1 }}>
                Créneaux disponibles pour le {selectedDay.toLocaleDateString()} :
              </Typography>

              {allSlots.length === 0 ? (
                <Typography sx={{ mt: 2 }}>
                  Aucun créneau disponible ce jour-là.
                </Typography>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {allSlots.map((slot) => (
                    <Grid item xs={12} sm={6} md={4} key={slot.time}>
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={slot.isBooked || loadingId === slot.time}
                        onClick={() => handleReserve(slot.time)}
                        sx={{
                          backgroundColor: slot.isBooked ? 'gray' : 'primary.main',
                          '&:hover': {
                            backgroundColor: slot.isBooked ? 'gray' : 'primary.dark',
                          },
                        }}
                      >
                        {loadingId === slot.time ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          slot.time
                        )}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Box>

      {status && (
        <Alert severity={status.startsWith('✅') ? 'success' : 'error'} sx={{ mt: 3 }}>
          {status}
        </Alert>
      )}
    </Container>
  );
}

import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Grid,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';

export default function ClientRdv() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [visitorName, setVisitorName] = useState('');
  const [status, setStatus] = useState('');
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/availabilities')
      .then((res) => setAllSlots(res.data))
      .catch((err) => console.error(err));
  }, []);

  const daySlots = () => {
    if (!selectedDay) return [];
    const dateStr = selectedDay.toISOString().split('T')[0];
    return allSlots.filter(s => s.date === dateStr && !s.isBooked);
  };

  const handleReserve = async (slotId) => {
    if (!visitorName) {
      setStatus('❗ Veuillez entrer votre nom');
      return;
    }

    setLoadingId(slotId);
    setStatus('');

    try {
        await axios.put(
            `http://localhost:3000/api/availabilities/book/${slotId}`,
            { visitorName },
            { headers: {} } // 👈 force sans Auth
          );
          
          

      setStatus('✅ RDV réservé avec succès');
      const updated = await axios.get('http://localhost:3000/api/availabilities');
      setAllSlots(updated.data);
    } catch (err) {
      setStatus('❌ Erreur : ' + (err.response?.data?.error || err.message));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Container sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        📅 Prendre un rendez-vous
      </Typography>

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

      {selectedDay && (
        <>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Horaires disponibles le {selectedDay.toLocaleDateString()} :
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {daySlots().map((slot) => (
              <Grid item xs={6} md={3} key={slot._id}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={loadingId === slot._id}
                  onClick={() => handleReserve(slot._id)}
                >
                  {loadingId === slot._id ? <CircularProgress size={20} /> : slot.time}
                </Button>
              </Grid>
            ))}
          </Grid>

          {daySlots().length === 0 && (
            <Typography sx={{ mt: 2 }}>Aucun créneau disponible ce jour-là</Typography>
          )}
        </>
      )}

{status && (
  <Alert severity={status.startsWith('✅') ? 'success' : 'error'} sx={{ mt: 3 }}>
    {status}
  </Alert>
)}
    </Container>
  );
}
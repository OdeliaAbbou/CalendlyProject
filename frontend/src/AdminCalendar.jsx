import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Paper,
  Stack,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import { Add, Close, ContentCopy } from '@mui/icons-material';
import axios from 'axios';

const dayNames = [
  { short: 'S', name: 'Sunday' },
  { short: 'M', name: 'Monday' },
  { short: 'T', name: 'Tuesday' },
  { short: 'W', name: 'Wednesday' },
  { short: 'T', name: 'Thursday' },
  { short: 'F', name: 'Friday' },
  { short: 'S', name: 'Saturday' },
];

const AdminCalendar = () => {
  const [availability, setAvailability] = useState({
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  });
  const [copyStatus, setCopyStatus] = useState('');
  const [adminId] = useState(localStorage.getItem('adminId'));
  const [link, setLink] = useState('');

  // 🟡 Charge le modèle de disponibilité depuis le backend (WeekTemplate)
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!adminId) return;

      try {
        const res = await axios.get(`http://localhost:3000/api/weekTemplate/${adminId}`);
        const backendAvailability = res.data.availability;

        const transformed = {};

        Object.entries(backendAvailability).forEach(([day, times]) => {
          if (!times || times.length === 0) {
            transformed[day] = [];
            return;
          }

          const slots = [];
          let i = 0;
          while (i < times.length) {
            const start = times[i];
            let end = times[i];

            while (i + 1 < times.length) {
              const currentHour = parseInt(times[i].split(':')[0]);
              const nextHour = parseInt(times[i + 1].split(':')[0]);
              if (nextHour === currentHour + 1) {
                end = times[i + 1];
                i++;
              } else {
                break;
              }
            }

            slots.push({ start, end });
            i++;
          }

          transformed[day] = slots;
        });

        setAvailability((prev) => ({
          ...prev,
          ...transformed,
        }));
      } catch (err) {
        console.error("❌ Erreur récupération modèle admin:", err.message);
      }
    };

    fetchTemplate();
  }, [adminId]);

  const handleAddSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }],
    }));
  };

  const handleRemoveSlot = (day, index) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (day, index, field, value) => {
    const updatedSlots = [...availability[day]];
    const [hour, minute] = value.split(':').map((part) => part.padStart(2, '0'));
    updatedSlots[index][field] = `${hour}:${minute}`;
    setAvailability((prev) => ({
      ...prev,
      [day]: updatedSlots,
    }));
  };

  const handleCopy = (sourceDay) => {
    const sourceSlots = availability[sourceDay];
    const updated = {};
    Object.keys(availability).forEach((day) => {
      if (day !== sourceDay) {
        updated[day] = [...sourceSlots];
      }
    });
    setAvailability((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const generateAndCopyLink = () => {
    if (adminId) {
      const generatedLink = `http://localhost:3000/booking?adminId=${adminId}`;
      setLink(generatedLink);
      navigator.clipboard
        .writeText(generatedLink)
        .then(() => {
          setCopyStatus('Lien copié avec succès !');
          setTimeout(() => setCopyStatus(''), 3000);
        })
        .catch((err) => {
          setCopyStatus('Échec de la copie.');
          console.error('Erreur lors de la copie du lien', err);
        });
    }
  };

  const handleSave = async () => {
    const availabilityData = {};

    dayNames.forEach(({ name }) => {
      const slots = availability[name];
      const times = [];

      slots.forEach(({ start, end }) => {
        let [startHour] = start.split(':').map(Number);
        const [endHour] = end.split(':').map(Number);

        while (startHour < endHour) {
          times.push(`${String(startHour).padStart(2, '0')}:00`);
          startHour++;
        }
      });

      availabilityData[name] = times;
    });

    const token = localStorage.getItem('token');
    if (!token) {
      alert('❌ Token manquant. Connecte-toi en tant qu’admin.');
      return;
    }

    if (!adminId) {
      alert("❌ ID d'administrateur manquant.");
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/templates',
        {
          adminId: adminId,
          availability: availabilityData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Modèle de disponibilité enregistré avec succès', response.data);
      alert('✔️ Modèle de disponibilité enregistré avec succès !');
    } catch (error) {
      console.error('❌ Erreur API:', error.response?.data || error.message);
      alert(
        '❌ Échec de l’enregistrement du modèle : ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" my={4} sx={{ backgroundColor: '#f4f6f9', borderRadius: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={1} color="#1976d2">
        Weekly hours
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Set when you are typically available for meetings
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateAndCopyLink}
          sx={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '18px',
            padding: 0,
          }}
        >
          <ContentCopy />
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, ml: 2 }}>
          {link || 'Lien de réservation'}
        </Typography>
      </Box>

      {copyStatus && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {copyStatus}
        </Alert>
      )}

      {dayNames.map(({ name, short }) => {
        const slots = availability[name];
        const isUnavailable = slots.length === 0;

        return (
          <Box key={name} display="flex" alignItems="flex-start" mb={3}>
            <Paper
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                mr: 2,
              }}
              elevation={3}
            >
              {short}
            </Paper>

            <Box flex={1}>
              {isUnavailable ? (
                <Typography color="text.disabled" fontStyle="italic">
                  Unavailable
                </Typography>
              ) : (
                <Stack spacing={1} mb={1}>
                  {slots.map((slot, index) => (
                    <Box key={index} display="flex" alignItems="center" gap={1}>
                      <TextField
                        type="time"
                        size="small"
                        value={slot.start}
                        onChange={(e) => handleTimeChange(name, index, 'start', e.target.value)}
                        sx={{ width: '120px', '& .MuiInputBase-root': { borderRadius: 2 } }}
                      />
                      <Typography variant="body2">-</Typography>
                      <TextField
                        type="time"
                        size="small"
                        value={slot.end}
                        onChange={(e) => handleTimeChange(name, index, 'end', e.target.value)}
                        sx={{ width: '120px', '& .MuiInputBase-root': { borderRadius: 2 } }}
                      />
                      <IconButton onClick={() => handleRemoveSlot(name, index)} size="small" color="error">
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}

              <Box display="flex" gap={1}>
                <IconButton onClick={() => handleAddSlot(name)} size="small" color="primary">
                  <Add fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleCopy(name)} size="small" color="inherit">
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        );
      })}

      <Divider sx={{ my: 4 }} />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{
          width: '100%',
          padding: '12px 20px',
          fontSize: '16px',
          borderRadius: 3,
        }}
      >
        Enregistrer
      </Button>
    </Box>
  );
};

export default AdminCalendar;

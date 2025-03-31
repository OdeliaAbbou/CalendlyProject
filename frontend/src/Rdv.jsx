import React from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Container, Typography } from '@mui/material';

export default function Rdv() {
  const [selectedDay, setSelectedDay] = React.useState(null);

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        📅 Prise de rendez-vous
      </Typography>
      <DayPicker
        mode="single"
        selected={selectedDay}
        onSelect={setSelectedDay}
      />
      {selectedDay && (
        <Typography sx={{ mt: 2 }}>
          Tu as sélectionné : {selectedDay.toLocaleDateString()}
        </Typography>
      )}
    </Container>
  );
}

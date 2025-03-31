
//app js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import VisitorView from './VisitorView';
import ClientRdv from './ClientRdv';
import AdminCalendar from './AdminCalendar';



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route path="/rdv" element={<VisitorView />} />
      <Route path="/client-rdv" element={<ClientRdv />} />
      <Route path="/admin" element={<AdminCalendar />} />



    </Routes>
  );
}

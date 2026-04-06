import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar, Toolbar, Typography, Button, Container, Card, CardContent,
  TextField, Select, MenuItem, InputLabel, FormControl, Grid, Box,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { LogOut, User, Activity, AlertTriangle } from 'lucide-react';

Chart.register(...registerables);

const API_URL = 'http://localhost:5000';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Healthcare AI Portal
            </Typography>
            {token ? (
              <>
                <Button color="inherit" onClick={logout} startIcon={<LogOut />}>Logout</Button>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/login">Login</Button>
            )}
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/login" element={!token ? <Login setToken={(t, r) => { setToken(t); setRole(r); }} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={token ? (role === 'clinician' ? <ClinicianDashboard /> : <PatientDashboard />) : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
};

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password');

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      setToken(res.data.token, res.data.role);
    } catch (err) { alert('Login failed'); }
  };

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 10 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <TextField fullWidth label="Username" margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
        <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleLogin}>Login</Button>
      </CardContent>
    </Card>
  );
};

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      // Using P0001 for demo
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/patients/P0001`, config);
      setPatient(res.data);
      const logRes = await axios.get(`${API_URL}/logs/P0001`, config);
      setLogs(logRes.data);

      const predRes = await axios.post(`${API_URL}/predict`, {
        age: res.data.age,
        blood_pressure_sys: res.data.blood_pressure_sys,
        blood_pressure_dia: res.data.blood_pressure_dia,
        cholesterol: res.data.cholesterol,
        glucose: res.data.glucose
      }, config);
      setPrediction(predRes.data);
    };
    fetchData();
  }, []);

  if (!patient) return <Typography>Loading...</Typography>;

  const chartData = {
    labels: logs.map(l => l.timestamp.split(' ')[1]),
    datasets: [{ label: 'Heart Rate', data: logs.map(l => l.heart_rate), borderColor: 'red' }]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6"><User /> Profile</Typography>
            <Typography>Name: {patient.name}</Typography>
            <Typography>Age: {patient.age}</Typography>
            <Typography>BP: {patient.blood_pressure_sys}/{patient.blood_pressure_dia}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ bgcolor: prediction?.prediction ? '#fff3f3' : '#f3fff3' }}>
          <CardContent>
            <Typography variant="h6"><AlertTriangle /> AI Risk Assessment</Typography>
            <Typography variant="h4">{prediction ? (prediction.prediction ? 'HIGH RISK' : 'LOW RISK') : 'Calculating...'}</Typography>
            <Typography>Probability: {prediction ? (prediction.probability * 100).toFixed(1) : 0}%</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6"><Activity /> Wearable Heart Rate</Typography>
            <Line data={chartData} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const ClinicianDashboard = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/patients`, { headers: { Authorization: `Bearer ${token}` } });
      setPatients(res.data);
    };
    fetchData();
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Clinician Dashboard</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>BP</TableCell>
              <TableCell>Risk Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map(p => (
              <TableRow key={p.patient_id}>
                <TableCell>{p.patient_id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.age}</TableCell>
                <TableCell>{p.blood_pressure_sys}/{p.blood_pressure_dia}</TableCell>
                <TableCell sx={{ color: p.disease_risk ? 'red' : 'green', fontWeight: 'bold' }}>
                  {p.disease_risk ? 'High' : 'Low'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default App;

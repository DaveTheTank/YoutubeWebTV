import { useState } from 'react';
import { TextInput, Button, Paper, Title, Container } from '@mantine/core';

export function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        onLogin();
      } else {
        alert('Login fehlgeschlagen');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login fehlgeschlagen');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Admin Login</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Benutzername"
            placeholder="admin"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextInput
            label="Passwort"
            type="password"
            placeholder="••••••••"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth mt="xl">
            Einloggen
          </Button>
        </form>
      </Paper>
    </Container>
  );
} 
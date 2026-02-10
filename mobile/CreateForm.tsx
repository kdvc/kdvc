// App.tsx or SomeScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';

const CreateForm: React.FC<CreateFormProps> = ({ onSubmitResponse }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // IMPORTANT: change this URL to match your server + device setup
      // e.g., use your machine IP instead of localhost for real devices
      const res = await fetch('http://192.168.1.107:8000/class', {
        // Android emulator: 10.0.2.2, iOS simulator: localhost
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }

      const json = await res.json();
      onSubmitResponse(json);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Evento</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do evento"
        value={name}
        onChangeText={setName}
      />

      <Button
        title={loading ? 'Registrando...' : 'Registrar'}
        onPress={handleSubmit}
        disabled={loading}
      />

      {error && <Text style={styles.error}>Error: {error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
  },
  error: {
    marginTop: 12,
    color: 'red',
  },
  responseBox: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  responseTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },
  responseText: {
    fontFamily: 'monospace',
  },
});

export default CreateForm;

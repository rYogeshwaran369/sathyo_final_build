import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const InstructorPage = () => {
  const [durationInMinutes, setDurationInMinutes] = useState('');
  const [selectedSong, setSelectedSong] = useState(null);
  const navigation = useNavigation();

  // Example song list
  const songs = [
    { id: '1', name: 'Calm Vibes', path: 'path-to-song1' },
    { id: '2', name: 'Nature Sounds', path: 'path-to-song2' },
    { id: '3', name: 'Meditation Music', path: 'path-to-song3' },
  ];

  const startMeditation = () => {
    if (selectedSong && durationInMinutes) {
      // Navigate to MeditationTimer page with selected song and timer duration
      navigation.navigate('MeditationTimer', {
        duration: durationInMinutes,
        song: selectedSong.path,
      });
    } else {
      alert('Please select a song and set a duration.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Instructor Controls</Text>

      <Text style={styles.label}>Set Timer (in minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={durationInMinutes}
        onChangeText={setDurationInMinutes}
      />

      <Text style={styles.label}>Select Song:</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.songItem,
              selectedSong?.id === item.id && styles.selectedSong,
            ]}
            onPress={() => setSelectedSong(item)}
          >
            <Text style={styles.songName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.startButton} onPress={startMeditation}>
        <Text style={styles.startButtonText}>Start Meditation</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  songItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedSong: {
    backgroundColor: '#d3f9d8',
  },
  songName: {
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default InstructorPage;

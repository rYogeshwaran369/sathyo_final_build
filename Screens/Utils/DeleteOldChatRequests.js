import React, { useState } from 'react';
import { View, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // Ensure your Firebase setup is correct

const DeleteOldChatRequests = () => {
  const [loading, setLoading] = useState(false);

  const deleteOldChatRequests = async () => {
    try {
      setLoading(true);

      // Get the current time
      const currentTime = Timestamp.now();
      // Calculate the time 5 minutes ago
      const fiveMinutesAgo = new Timestamp(currentTime.seconds - 5 * 60, currentTime.nanoseconds);

      // Create a query to fetch all chatRequests created more than 5 minutes ago
      const chatRequestQuery = query(
        collection(db, 'chatRequests'),
        where('timestamp', '<', fiveMinutesAgo)
      );

      // Get all the matching documents
      const querySnapshot = await getDocs(chatRequestQuery);

      if (querySnapshot.empty) {
        Alert.alert('Info', 'No chat requests older than 5 minutes found.');
        setLoading(false);
        return;
      }

      // Loop through each document and delete it
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      Alert.alert('Success', 'Old chat requests deleted successfully!');
    } catch (error) {
      console.error('Error deleting old chat requests:', error);
      Alert.alert('Error', 'Failed to delete old chat requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Delete Old Chat Requests" onPress={deleteOldChatRequests} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default DeleteOldChatRequests;

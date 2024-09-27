import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { db } from "../../firebase";

const UploadMp3 = () => {
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);

  const pickAndUploadFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
      });

      const fileUri = result[0].uri;
      const fileName = result[0].name;

      const uploadUri = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri;
      const storageRef = storage().ref(`audio/${fileName}`);

      setUploading(true);
      setTransferred(0);

      const task = storageRef.putFile(uploadUri);

      // Monitor the file upload progress
      task.on('state_changed', (snapshot) => {
        setTransferred(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
      });

      await task;

      const downloadUrl = await storageRef.getDownloadURL();

      // Store the download URL and metadata in Firestore
      await db.collection('songs').add({
        fileName: fileName,
        downloadUrl: downloadUrl,
        uploadedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'File uploaded successfully!');

    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('File selection was canceled');
      } else {
        console.error('Error picking or uploading file:', error);
        Alert.alert('Error', 'File upload failed: ' + error.message);
      }
    } finally {
      setUploading(false);
      setTransferred(0);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Upload MP3 to Firebase</Text>

      {uploading ? (
        <View style={{ alignItems: 'center' }}>
          <Text>{transferred}% completed</Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <Button title="Pick and Upload MP3" onPress={pickAndUploadFile} />
      )}
    </View>
  );
};

export default UploadMp3;
import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // Ensure your Firebase setup is correct

const UploadMp3 = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickAndUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (result.canceled) {
        console.log('File selection was canceled');
        return;
      }

      const { uri, name, mimeType } = result.assets[0];
      console.log(`File selected: ${name}, URI: ${uri}, MIME: ${mimeType}`);
      
      setUploading(true);
      setProgress(0);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('File info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(xhr.response);
        };
        xhr.onerror = function(e) {
          console.log(e);
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const storage = getStorage();
      const storageRef = ref(storage, `audio/${name}`);

      console.log('Starting upload...');
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${currentProgress}%`);
          setProgress(currentProgress);
        },
        (error) => {
          console.error('Upload error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', error.serverResponse);
          Alert.alert('Error', `Upload failed: ${error.message}`);
          setUploading(false);
          setProgress(0);
        },
        async () => {
          console.log('Upload completed successfully');
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Download URL:', downloadUrl);

          await addDoc(collection(db, 'songs'), {
            fileName: name,
            downloadUrl: downloadUrl,
            mimeType: mimeType,
            uploadedAt: serverTimestamp(),
          });

          Alert.alert('Success', 'File uploaded successfully!');
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (error) {
      console.error('Error in pickAndUploadFile:', error);
      Alert.alert('Error', `File upload failed: ${error.message}`);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload MP3 to Firebase</Text>

      {uploading ? (
        <View style={styles.progressContainer}>
          <Text>{`${Math.round(progress)}% completed`}</Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <Button title="Pick and Upload MP3" onPress={pickAndUploadFile} />
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
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
});

export default UploadMp3;
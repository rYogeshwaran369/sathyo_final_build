import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';

const ChatPage = ({ route }) => {
  const { chatRoomId, song, duration } = route.params;
  const [message, setMessage] = useState('');
  const db = getFirestore();

  const sendMessage = async () => {
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
    await updateDoc(chatRoomRef, {
      message: message
    });

    setMessage('');
  };

  return (
    <View>
      <Text>Chat with Meditators</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message"
      />
      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
};

export default ChatPage;

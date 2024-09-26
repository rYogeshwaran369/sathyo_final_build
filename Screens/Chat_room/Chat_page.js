import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

export default class ChatPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: '', 
      messages: [], 
      currentMessage: '',
      chatSessionId: '', 
      isTutor: false, // Add isTutor to state
    };
    this.intervalId = null;
  }

  componentDidMount() {
    this.getCurrentUser();
    this.startPolling();
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  getCurrentUser = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const userEmail = user.email;
  
      this.setState({ currentUser: userEmail });
  
      try {
        // Query the Users collection to find the document with the matching email
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where('email', '==', userEmail));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const { userType } = userData;
            console.log(userType);
  
            // Set isTutor based on userType
            this.setState({ isTutor: userType === 'Instructor' }, this.findChatSession);
          });
        } else {
          console.log('No user found with email:', userEmail);
        }
      } catch (error) {
        console.error('Error fetching user type:', error);
      }
    }
  };
  

  findChatSession = async () => {
    const { currentUser } = this.state;
    const db = getFirestore();
    
    try {
      const q = query(collection(db, 'chatSessions'), where('users', 'array-contains', currentUser));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const chatSessionId = doc.id;
          this.setState({ chatSessionId }, this.fetchMessages);
        });
      }
    } catch (error) {
      console.error('Error finding chat session:', error);
    }
  };

  fetchMessages = async () => {
    const { chatSessionId } = this.state;
    const db = getFirestore();
  
    if (!chatSessionId) return;
  
    try {
      const chatSessionRef = doc(db, 'chatSessions', chatSessionId);
      const docSnapshot = await getDoc(chatSessionRef);
  
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data();
        const { messages } = chatData;
  
        if (Array.isArray(messages)) {
          this.setState({ messages });
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  startPolling = () => {
    this.intervalId = setInterval(async () => {
      try {
        const { chatSessionId } = this.state;
        const db = getFirestore();

        if (chatSessionId) {
          await this.fetchMessages();
          const chatSessionRef = doc(db, 'chatSessions', chatSessionId);
          const docSnapshot = await getDoc(chatSessionRef);
          if (docSnapshot.exists()) {
            const chatData = docSnapshot.data();
            const { timer } = chatData;
            if (timer) {
              clearInterval(this.intervalId);
              this.props.navigation.navigate('MeditationTimer', { duration: 9 });
            }
          }
        }
      } catch (error) {
        console.error('Error during polling:', error);
      }
    }, 2000);
  };

  updateTimer = async () => {
    const { chatSessionId } = this.state;
    const db = getFirestore();

    if (!chatSessionId) return;

    try {
      const chatSessionRef = doc(db, 'chatSessions', chatSessionId);
      await updateDoc(chatSessionRef, { timer: true });
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  handleSend = () => {
    const { currentMessage, messages, currentUser } = this.state;

    if (currentMessage.trim().length > 0) {
      this.handleOptionClick(currentMessage);
    }
  };

  handleOptionClick = async (option) => {
    const { messages, currentUser, chatSessionId } = this.state;
    const db = getFirestore();

    if (!chatSessionId) return;

    try {
      const chatSessionRef = doc(db, 'chatSessions', chatSessionId);
      await updateDoc(chatSessionRef, { messages: [...messages, { text: option }] });
    } catch (error) {
      console.error('Error updating messages:', error);
    }

    if (option === 'Please Start Meditation') {
      this.updateTimer();
    } else if (option === 'Thanks for Joining') {
      const auth = getAuth();
      const userEmail = auth.currentUser?.email; // Get current user's email
    
      if (userEmail) {
        try {
          const chatSessionsRef = collection(db, 'chatSessions');
          const q = query(chatSessionsRef, where('users', 'array-contains', userEmail)); // Query chatSessions where current user is present
          const querySnapshot = await getDocs(q);
    
          if (!querySnapshot.empty) {
            // Loop through and delete each document where the user is found
            querySnapshot.forEach(async (doc) => {
              const data = doc.data(); // Get the document data
              const users = data.users; // Extract the users array from the document
            
              if (users.includes(userEmail)) { // Check if the current user's email is present
                console.log(`Deleting chat session for user: ${userEmail} in session: ${doc.id}`);
                
                // Delete the document
                await deleteDoc(doc.ref);
                console.log(`Deleted chat session: ${doc.id}`);
              }
            });
    
            // Navigate to Home after deleting the document
            this.props.navigation.navigate('Home');
          } else {
            console.log('No chat session found for the user.');
            this.props.navigation.navigate('Home'); // Navigate to Home even if no session is found
          }
        } catch (error) {
          console.error('Error fetching or deleting chat session:', error);
          this.props.navigation.navigate('Home'); // Navigate to Home in case of error
        }
      } else {
        // If no user email is found, navigate to Home
        this.props.navigation.navigate('Home');
      }
    }
  };

  renderTutorOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity style={styles.optionButton} onPress={() => this.handleOptionClick('Please Start Meditation')}>
        <Text style={styles.optionText}>Please Start Meditation</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => this.handleOptionClick('Thanks for Joining')}>
        <Text style={styles.optionText}>Thanks for Joining</Text>
      </TouchableOpacity>
    </View>
  );

  renderTrainerOptions = () => (
    <View style={styles.optionsContainer}>
      <TouchableOpacity style={styles.optionButton} onPress={() => this.handleOptionClick('Ready')}>
        <Text style={styles.optionText}>Ready</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => this.handleOptionClick('Wait')}>
        <Text style={styles.optionText}>Wait</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => this.handleOptionClick('I’ll join after sometime')}>
        <Text style={styles.optionText}>I’ll join after sometime</Text>
      </TouchableOpacity>
      <Text style={styles.optionPrompt}>Choose your option!</Text>
    </View>
  );

  render() {
    const { currentUser, messages, isTutor } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.chatContainer}>
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <View key={index} style={styles.optionButton}>
                <Text style={styles.optionText}>{message.text}</Text>
              </View>
            ))
          ) : (
            <Text>No messages</Text>
          )}
        </ScrollView>

        {isTutor ? (
          <>
            {this.renderTutorOptions()}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type the instruction..."
                value={this.state.currentMessage}
                onChangeText={(text) => this.setState({ currentMessage: text })}
              />
              <TouchableOpacity style={styles.sendButton} onPress={this.handleSend}>
                <Text style={styles.sendIcon}>🛩️</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          this.renderTrainerOptions()
        )}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '80%',
  },
  currentUserBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1f5d3',
  },
  tutorBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  trainerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
  },
  messageText: {
    fontSize: 16,
  },
  optionsContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    backgroundColor: '#0026b9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 5,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  optionPrompt: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#0000ff',
    borderRadius: 20,
    padding: 12,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
  },
});

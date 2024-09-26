import React, { Component } from 'react';
import { View, Text, Image, SafeAreaView, ScrollView, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import ImageSlideshow from '../../Components/ImageSlideshow';
import WebView from 'react-native-webview';
import { getFirestore, getDocs, collection, query, where, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default class MeditationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      durationModalVisible: false,
      feeds: [],
      users: [],
      modalUri: '', // To hold the WebView URL
    };
    this.intervalId = null; // Store the interval ID
  }

  async componentDidMount() {
    this.fetchFeeds();

    // Add event listener for screen focus
    this._focusListener = this.props.navigation.addListener('focus', () => {
      // Reset modal visibility when the screen comes into focus
      this.setState({ modalVisible: false, durationModalVisible: false });
    });

    // Check for request changes every 2 seconds
    // this.startRequestCheck();
  }

  componentWillUnmount() {
    // Clean up the event listener
    if (this._focusListener) {
      this._focusListener();
    }

    // Clear the interval when the component unmounts
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchFeeds = async () => {
    try {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'meditation'));
      const userquery = await getDocs(collection(db, 'Users'));

      const feedsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userData = userquery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.setState({ feeds: feedsData, users: userData });
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  };

  setModalVisible = (visible, uri = '') => {
    this.setState({ modalVisible: visible, modalUri: uri });
  };

  setDurationModalVisible = (visible) => {
    this.setState({ durationModalVisible: visible });
  };

  handleLogin = () => {
    this.setModalVisible(true);
  };

  handleOptionSelect = async (option) => {
    console.log(option);
    this.setModalVisible(false);

    if (option === 'Dhiyanam') {
      this.setDurationModalVisible(true);
    } else if (option === 'Thirayadhanam') {
      this.checkInstructorAvailability();
      // this.handleMeditatorClick();
    }
  };
  handleMeditatorClick = async () => {
    const instructor = await findAvailableInstructor();

    if (instructor) {
      const meditator = { email:auth.currentUser.email};
      await createChatRoomAndNavigate(instructor, meditator, navigation);
    } else {
      alert('No available instructor found!');
    }
  };
  handleDurationSelect = (duration) => {
    // Directly navigate to the MeditationTimer screen with the selected duration
    this.props.navigation.navigate('MeditationTimer', { duration });
    
    // Close the duration modal
    this.setDurationModalVisible(false);
  };

  // Check instructor availability for 'Thirayadhanam'
  checkInstructorAvailability = async () => {
    const db = getFirestore();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('No user is signed in.');
      return;
    }
  
    const userEmail = currentUser.email;
  
    try {
      // Fetch the signed-in user document
      const userQuerySnapshot = await getDocs(
        query(collection(db, 'Users'), where('email', '==', userEmail))
      );
  
      if (!userQuerySnapshot.empty) {
        const user = userQuerySnapshot.docs[0].data();
  
        if (user.userType === 'Meditator') {
          // Fetch available instructors
          const instructorsQuerySnapshot = await getDocs(
            query(collection(db, 'Users'), where('userType', '==', 'Instructor'))
          );
  
          if (!instructorsQuerySnapshot.empty) {
            let instructorFound = false;
  
            for (let instructorDoc of instructorsQuerySnapshot.docs) {
              const instructorData = instructorDoc.data();
  
              if (instructorData.availability === true) {
                // Get the instructor's email
                const instructorEmail = instructorData.email;
  
                // Query to find the instructor document based on the email
                const instructorQuerySnapshot = await getDocs(
                  query(collection(db, 'Users'), where('email', '==', instructorEmail))
                );
  
                if (!instructorQuerySnapshot.empty) {
                  const instructorDocToUpdate = instructorQuerySnapshot.docs[0];
                  const instructorRef = doc(db, 'Users', instructorDocToUpdate.id);
  
                  // Update the instructor document
                  await updateDoc(instructorRef, { request: true, chat: arrayUnion(userEmail) });
  
                  instructorFound = true;
  
                  Alert.alert(
                    'Wait for confirmation',
                    'An instructor is available. Wait for confirmation.',
                    [{ text: 'OK', onPress: () => this.pollRequestStatus(userEmail) }]
                  );
  
                  break; // Exit loop after finding the first available instructor
                }
              }
            }
  
            if (!instructorFound) {
              this.showQueueFullPopup();
            }
          } else {
            console.log('No instructors found in the database.');
          }
        } else {
          this.props.navigation.navigate('Chat_room');
        }
      } else {
        console.log('No matching user found.');
      }
    } catch (error) {
      console.error('Error checking instructor availability:', error);
    }
  };

  // Method to poll the request status every 2 seconds
  pollRequestStatus = (userEmail, duration) => {
    const db = getFirestore();

    this.intervalId = setInterval(async () => {
      try {
        const usersQuerySnapshot = await getDocs(
          query(collection(db, 'Users'), where('email', '==', userEmail))
        );

        if (!usersQuerySnapshot.empty) {
          const user = usersQuerySnapshot.docs[0].data();

          // Check if the request has been approved
          if (user.request === true) {
            clearInterval(this.intervalId); // Stop polling once the request is confirmed
            console.log('Request confirmed. Navigating to MeditationTimer.');

            // Navigate to the Meditation Timer screen with the selected duration
            this.props.navigation.navigate('Chat_room');
          }
        }
      } catch (error) {
        console.error('Error polling request status:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  // Method to show the "Queue is Full" popup
  showQueueFullPopup = () => {
    Alert.alert(
      'Queue is Full 😕',
      'Meditation discussion\nGet notified for the next discussion!',
      [
        {
          text: 'Notify',
          onPress: () => console.log('User will be notified'),
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ]
    );
  };

  render() {
    const { modalVisible, durationModalVisible, feeds } = this.state;

    return (
<SafeAreaView style={styles.safearea}>
  <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    {/* SlideShow */}
    <View style={styles.slider}>
      <ImageSlideshow />      
      {/* <Image source={{ uri: 'https://res.cloudinary.com/dkkkl3td3/image/upload/v1722857089/Sathyodhayam/ne9ynxthbeftiv98e7yv.png' }} style={styles.cardImage} /> */}
    </View>

    {/* Voice Section */}
    <View style={styles.voiceSection}>
      <View>
        <View style={styles.headerView}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: 'black' }}>Meditation of</Text>
            <Text style={[styles.headerText, { marginLeft: 3 }]}>Master Sri Ji</Text>
          </View>
        </View>
      </View>
    </View>

    {/* Meditation Options as Cards */}
    <View style={styles.meditationOptions}>

      <TouchableOpacity
        style={styles.meditationCard}
        onPress={() => this.handleOptionSelect('Dhiyanam')}
      >
        <Image source={{ uri: 'https://th.bing.com/th/id/R.02689a34f069c766adcfa1b9dd3bea7b?rik=h4uU3saqu5mCug&riu=http%3a%2f%2fwww.integrativewisdompath.com%2fsites%2fdefault%2ffiles%2fimages%2fel-meditation.png&ehk=g0FBNzI1fiexPSUktsjkSxFs8uS410r7rHurweOb6vA%3d&risl=&pid=ImgRaw&r=0' }} style={styles.cardImage} />
        <Text style={styles.meditationCardText}>Dhiyanam</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.meditationCard}
        onPress={() => this.handleOptionSelect('Thirayadhanam')}
      >
        <Image source={{ uri: 'https://srivedamaayu.com/wp-content/uploads/2016/11/meditation.jpg' }} style={styles.cardImage} />
        <Text style={styles.meditationCardText}>Thirayadhanam</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.meditationCard}
        onPress={() => this.props.navigation.navigate('Jabam')}
      >
        <Image source={{ uri: 'https://th.bing.com/th/id/R.e32cd820070c50dd42f9bf0e59c19f76?rik=MGhtsJyDKTNYtQ&riu=http%3a%2f%2ffreedesignfile.com%2fupload%2f2014%2f04%2fMeditation-design-elements-vector-graphics-01.jpg&ehk=Z9%2fTAnxPAZDFwLVnNgoY4BA8qQdTauQW927auiTbAis%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1' }} style={styles.cardImage} />
        <Text style={styles.meditationCardText}>Jabam</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.meditationCard}
        onPress={() => this.props.navigation.navigate('MeditatorPage')}
      >
        <Image source={{ uri: 'https://srivedamaayu.com/wp-content/uploads/2016/11/meditation.jpg' }} style={styles.cardImage} />
        <Text style={styles.meditationCardText}>MeditatorPage</Text>
      </TouchableOpacity>

    </View>

    {/* Duration Selection Modal */}
    <Modal
      animationType="slide"
      transparent={true}
      visible={durationModalVisible}
      onRequestClose={() => {
        this.setDurationModalVisible(!durationModalVisible);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Duration</Text>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => this.handleDurationSelect(9)}
          >
            <Text style={styles.modalOptionText}>9 Minutes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => this.handleDurationSelect(13)}
          >
            <Text style={styles.modalOptionText}>13 Minutes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => this.handleDurationSelect(19)}
          >
            <Text style={styles.modalOptionText}>19 Minutes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => this.setDurationModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </ScrollView>
</SafeAreaView>
    );
  }}    

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  slider: {
    marginHorizontal: '5%',
    marginTop: '2%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerView: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
    voiceSection: {
      marginBottom: 20,
    },
    headerView: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    headerText: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    meditationOptions: {
      flexDirection: 'column',
      justifyContent: 'space-around',
    },
    meditationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff', // Cleaner background
      borderRadius: 12, // More rounded corners
      padding: 20, // Increased padding for spacing
      marginBottom: 15,
      shadowColor: '#000', // Adding shadow for depth
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5, // Elevation for Android shadow
    },
    cardImage: {
      width: 60, // Slightly larger image
      height: 60,
      marginRight: 20, // Spacing between image and text
      borderRadius: 8, // Slightly more rounded image corners
    },
    meditationCardText: {
      fontSize: 18, // Increased font size for better readability
      fontWeight: '700', // Bolder text
      color: '#333', // Darker color for contrast
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: 300,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    modalOption: {
      width: '100%',
      padding: 10,
      backgroundColor: '#e0e0e0',
      borderRadius: 5,
      marginVertical: 5,
      alignItems: 'center',
    },
    modalOptionText: {
      fontSize: 16,
    },
    closeButton: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#ff5c5c',
      borderRadius: 5,
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
    },
  
});

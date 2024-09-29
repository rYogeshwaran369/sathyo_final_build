import React, { Component } from 'react';
import { View, Text, Image, SafeAreaView, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import ImageSlideshow from '../../Components/ImageSlideshow';
import { getFirestore, getDocs, collection } from 'firebase/firestore';

export default class MeditationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      durationModalVisible: false,
      feeds: [],
      users: [],
      modalUri: '',
      dhyanamTitles: [],
      filteredTitles: [], // New state to hold filtered titles
    };
    this.intervalId = null;
  }

  async componentDidMount() {
    this.fetchFeeds();
    this._focusListener = this.props.navigation.addListener('focus', () => {
      this.setState({ modalVisible: false, durationModalVisible: false });
    });
  }

  componentWillUnmount() {
    if (this._focusListener) {
      this._focusListener();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchFeeds = async () => {
    try {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'meditation'));
      const userquery = await getDocs(collection(db, 'Users'));
      const dhyanamQuery = await getDocs(collection(db, 'dhyanam'));

      const feedsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userData = userquery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const dhyanamTitles = dhyanamQuery.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        time: doc.data().time, // Assuming 'time' field exists
        music:doc.data().music_Link
      }));

      this.setState({ feeds: feedsData, users: userData, dhyanamTitles });
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

  handleOptionSelect = (option) => {
    if (option === 'Dhiyanam') {
      this.setDurationModalVisible(true);
    }
  };

  handleDurationSelect = (duration) => {
    // Filter titles based on selected duration
    console.log(duration)
    const filteredTitles = this.state.dhyanamTitles.filter(item => item.time == duration);
    this.setState({ filteredTitles }); // Update the filtered titles state

    // Show the song selection modal
    this.setModalVisible(true);
    this.setDurationModalVisible(false);
  };

  render() {
    const { modalVisible, durationModalVisible, feeds, filteredTitles } = this.state;
    const { navigation } = this.props;
    return (
      <SafeAreaView style={styles.safearea}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.slider}>
            <ImageSlideshow />
          </View>

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
              onPress={() => this.props.navigation.navigate('MeditatorPage')}
            >
              <Image source={{ uri: 'https://srivedamaayu.com/wp-content/uploads/2016/11/meditation.jpg' }} style={styles.cardImage} />
              <Text style={styles.meditationCardText}>MeditatorPage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.meditationCard}
              onPress={() => this.props.navigation.navigate('Jabam')}
            >
              <Image source={{ uri: 'https://th.bing.com/th/id/R.e32cd820070c50dd42f9bf0e59c19f76?rik=MGhtsJyDKTNYtQ&riu=http%3a%2f%2ffreedesignfile.com%2fupload%2f2014%2f04%2fMeditation-design-elements-vector-graphics-01.jpg&ehk=Z9%2fTAnxPAZDFwLVnNgoY4BA8qQdTauQW927auiTbAis%3d&risl=&pid=ImgRaw&r=0&sres=1&sresct=1' }} style={styles.cardImage} />
              <Text style={styles.meditationCardText}>Jabam</Text>
            </TouchableOpacity>
          </View>

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
                <TouchableOpacity style={styles.modalOption} onPress={() => this.handleDurationSelect(9)}>
                  <Text style={styles.modalOptionText}>9 Minutes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => this.handleDurationSelect(13)}>
                  <Text style={styles.modalOptionText}>13 Minutes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => this.handleDurationSelect(19)}>
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

          <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => {
    this.setModalVisible(!modalVisible);
  }}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalView}>
      <Text style={styles.modalTitle}>Select a Song</Text>
      {filteredTitles.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.modalOption}
          onPress={() => {
            const link = item.music; // Use const for link
            const duration = item.time; // Use const for duration
            console.log(link);
            navigation.navigate('MeditationTimer', {
              selectedSong: link, // Change to 'selectedSong' for clarity
              duration,
            });
            this.setModalVisible(false); // Use this.setModalVisible here
            console.log(`Selected song: ${item.title}`);
          }}
        >
          <Text style={styles.modalOptionText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => this.setModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

        </ScrollView>
      </SafeAreaView>
    );
  }
} 

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

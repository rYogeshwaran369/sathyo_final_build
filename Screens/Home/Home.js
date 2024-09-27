import React, { Component } from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, ScrollView, ImageBackground, Modal, Button, TouchableOpacity, Alert } from 'react-native';
import ImageSlideshow from '../../Components/ImageSlideshow';
import News_Details from '../../Components/News_Details';
import WebView from 'react-native-webview';
import Podcast_card from '../../Components/Podcast_card';
import { getFirestore, getDocs, collection, updateDoc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {auth,db} from "../../firebase"

const Top = StatusBar.currentHeight;

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      feeds: [],
      News: [],
      modalUri: '',
      isInstructor: false,
      isPopupVisible: false,
    };
    this.intervalId = null;
  }

  componentDidMount() {
    this.fetchFeeds();
    this.checkInstructorRequest();
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchFeeds = async () => {
    try {
      const db = getFirestore();
      const voiceSnapshot = await getDocs(collection(db, 'voice'));
      const voiceFeeds = voiceSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'voice',
        ...doc.data(),
      }));

      const newsSnapshot = await getDocs(collection(db, 'news_feeds'));
      const newsFeeds = newsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'news',
        ...doc.data(),
      }));

      this.setState({ feeds: voiceFeeds, News: newsFeeds });
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  };

  checkInstructorRequest = async () => {
    const auth = getAuth();
    const userEmail = auth.currentUser?.email;

    if (userEmail) {
      try {
        const db = getFirestore();
        const usersRef = collection(db, 'Users');

        const q = query(usersRef, where('email', '==', userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.userType === 'Instructor') {
              this.setState({ isInstructor: true });
              // this.startRequestCheck();
            }
          });
        } else {
          console.log('User not found in the Users database');
        }
      } catch (error) {
        console.error('Error checking user presence:', error);
      }
    }
  };

  // startRequestCheck = () => {
  //   const userEmail = auth.currentUser?.email;
  
  //   this.intervalId = setInterval(async () => {
  //     try {
  //       const db = getFirestore();
  //       const usersRef = collection(db, 'Users');
        
  //       const q = query(usersRef, where('email', '==', userEmail));
  //       const querySnapshot = await getDocs(q);
  
  //       if (!querySnapshot.empty) {
  //         querySnapshot.forEach(async (doc) => {
  //           const data = doc.data();
  //           if (data.request === true) {
  //             Alert.alert(
  //               'Meditation Request 😄',
  //               'Meditation discussion',
  //               [
  //                 {
  //                   text: 'Add',
  //                   onPress: async () => {
  //                     await updateDoc(doc.ref, { availability: false, request: false });
  
  //                     const q1 = query(usersRef, where('email', '==', data.chat[data.chat.length - 1]));
  //                     const querySnapshot1 = await getDocs(q1);
  //                     const users = [auth.currentUser.email]; // Only store the email, not the whole User object
  //                     const messages = [];
  //                     const timer = false;
  
  //                     try {
  //                       if (!querySnapshot1.empty) {
  //                         querySnapshot1.forEach((doc) => {
  //                           const userData = doc.data();
  //                           users.push(userData.email); // Only push the user's email to the array
  //                           updateDoc(doc.ref, { request: true });
  //                         });
  //                       }
  
  //                       messages.push({text : "New meditation request" });
  
  //                       // Create the chat session
  //                       const chatSessionRef = await addDoc(collection(db, "chatSessions"), {
  //                         users: users,
  //                         messages: messages,
  //                         timer:false // Use serverTimestamp to track when the chat session is created
  //                       });
  
  //                       clearInterval(this.intervalId);
  //                       this.props.navigation.navigate("Chat_room");
  
  //                     } catch (e) {
  //                       console.error('Error creating chat session:', e);
  //                     }
  //                   },
  //                 },
  //                 {
  //                   text: 'Close',
  //                   style: 'cancel',
  //                 },
  //               ]
  //             );
  //           }
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user details:', error);
  //     }
  //   }, 5000);
  // };
  

  setModalVisible = (visible, uri = '') => {
    this.setState({ modalVisible: visible, modalUri: uri });
  };


  render() {
    const { modalVisible, feeds,News, modalUri } = this.state;

    return (
      <SafeAreaView style={styles.safearea}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {/* SlideShow */}

          
          {/* //////////////////////// */}
          <View style={styles.slider}>
            <ImageSlideshow />
          </View>

          {/* Voice of Sri Ji */}
          <View style={styles.voiceSection}>

            {/* Voice of Sri Ji header View */}
            <View style={styles.headerView}>
              <View>
              <Text>Voice of</Text>
              <Text style={styles.headerText}>Master Sri Ji</Text>
              </View>
              <View style={{alignItems:'flex-end',justifyContent:'flex-end'}}>
              <Text onPress={()=>{this.props.navigation.navigate("Podcast")}} style={{fontSize:13,color:'#007DFE',fontWeight:'600'}}>View More</Text>
              </View>
            </View>

            {/* Voice of Sri Ji Podcast Links */}
            <View style={styles.podcastLinks}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {feeds.slice(0, 6).map((feed, id) => (
                <View key={feed.id} style={styles.boxContainer}>

                  <TouchableOpacity
                    title="Play Audiomack"
                    onPress={() => this.setModalVisible(true, feed.audio)}
                  >
                  <ImageBackground
                      source={{ uri: feed.image }} // Replace with your image URL
                      style={styles.imageBackground}
                    >
                    </ImageBackground>
                    <View style={{width:85}}>
                      <Text style={styles.title}>{feed.sub_title}</Text>
                    </View>

                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* WebView Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => this.setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.webviewContainer}>
                  <WebView
                    source={{ uri: modalUri }} // Use the modalUri from the state
                    style={{ width: '100%', height: '80%' }}
                    javaScriptEnabled={true}
                    scrollEnabled={false}
                  />
                  <Button title="Close" onPress={() => this.setModalVisible(false)} />
                </View>
              </View>
            </Modal>
          </View>

            {/* News Feeds */}
            <View>
                {/* News Feed header View */}
                <View style={[styles.headerView,{marginTop:'8%'}]}>
                <View>
                <Text style={{fontSize:13}}>Headlines of</Text>
                <Text style={styles.headerText}>Master Sri Ji</Text>
                </View>
                <View style={{alignItems:'flex-end',justifyContent:'flex-end'}}>
                <Text onPress={() => {this.props.navigation.navigate("News")}} style={{fontSize:13,color:'#007DFE',fontWeight:'600'}}>View More</Text>
                </View>
                </View>
                </View>
               
                <View style={{marginTop:'2%', alignItems:'center',justifyContent:'center'}}>
                    {News.slice(0, 6).map((feed) => (
                    <News_Details
                      key={feed.id} // Use the unique ID for the key
                      date={feed.date}
                      title={feed.title}
                      imageUri={feed.image} // Ensure this field exists in your feeds object
                      description={feed.paragraph} // Add description or any other detail
                      navigation={this.props.navigation} // Pass the navigation prop
                    />
                  ))}
                </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom:10
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  slider: {
    marginHorizontal: '5%',
    marginTop: '2%',
    height: '15%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  voiceSection: {
    paddingHorizontal: '5%',
    marginTop:'2%'
  },
  headerView: {
    marginBottom: 10,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  podcastLinks: {
    flexDirection: 'row',
    marginTop:'2%'
  },
  boxContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  imageBackground: {
    width: 85, 
    height: 85, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    overflow: 'hidden',
  },
  title: {
    fontSize: 10,
    color: 'black', 
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  webviewContainer: {
    width: '90%',
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
  },
  mediModalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mediCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  mediCloseButtonText: {
    fontSize: 20,
  },
  mediTitle: {
    fontSize: 20,
    color: '#79b796',
    marginBottom: 10,
  },
  mediDescription: {
    fontSize: 16,
    marginBottom: 20,
  },
});

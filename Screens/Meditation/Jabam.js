import React, { Component } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Button, Modal } from 'react-native';
import ImageSlideshow from '../../Components/ImageSlideshow';
import WebView from 'react-native-webview';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getFirestore, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';

import Jabam_Card from '../../Components/Jabam_Card';
import { getAuth } from 'firebase/auth';

export default class Jabam extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      feeds: [],
      modalUri: '', 
    };
  }

  componentDidMount() {  // TODO : useEffect use panalam la
    this.fetchFeeds();
  }

  fetchFeeds = async () => {
    try {
      const db = getFirestore(); // Get Firestore instance
      const querySnapshot = await getDocs(collection(db, "jabam"));
      const feedsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.setState({ feeds: feedsData });
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  };

  setModalVisible = (visible, uri = '') => {
    this.setState({ modalVisible: visible, modalUri: uri });
    if (visible && uri) {
      this.incrementUserPerformance(); // ++ song count if song played
    }
  };

  incrementUserPerformance = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getFirestore();
        const usersRef = collection(db, 'Users');

        // Query the user document by email
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userDocRef = userDoc.ref;

          // Increment the performance field by 1
          const currentPerformance = userDoc.data().performance || 0;
          await updateDoc(userDocRef, {
            performance: currentPerformance + 1,
          });
          console.log('Performance updated successfully');
        } else {
          console.log('No user document found for the current email');
        }
      } else {
        console.log('No user is signed in');
      }
    } catch (error) {
      console.error('Error updating performance: ', error);
    }
  };

  render() {
    const { modalVisible, feeds, modalUri } = this.state;
    console.log("fedds : ",feeds);

    return (
      <SafeAreaView style={styles.safearea}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {/* SlideShow */}
          <View style={styles.slider}>
            <ImageSlideshow />
          </View>

          {/* Voice Section */}
          <View style={styles.voiceSection}>
            <View>
              <View style={[styles.headerView]}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'black' }}>Jabam of</Text>
                  <Text style={[styles.headerText, { marginLeft: 3 }]}>Master Sri Ji</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Podcasts */}
          <View style={styles.podcastSection}>
            {/* Add your Podcast cards here */}
            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {feeds.map((feed) => (
                <View key={feed.id} style={styles.cardContainer}>
                  <TouchableOpacity
                    title="Play Audiomack"
                    onPress={() => this.setModalVisible(true, feed.music_Link)}
                  >
                    <Jabam_Card title={feed.title} image={feed.image_link} time={feed.time} />
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
                    source={{ uri: modalUri }}
                    style={{ width: '100%', height: '80%' }}
                    javaScriptEnabled={true}
                    scrollEnabled={false}
                  />
                  <Button title="Close" onPress={() => this.setModalVisible(false)} />
                </View>
              </View>
            </Modal>
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
    paddingHorizontal: '2%',
    justifyContent:'center',
    alignItems:'center'
  },
  podcastSection: {
    paddingHorizontal: '4%',
    marginTop: 20,
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

});

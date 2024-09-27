import React, { Component } from 'react';
import { View, Text, SafeAreaView, StyleSheet, StatusBar, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../../firebase'; // Import your Firebase auth instance
import { collection, query, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Top = StatusBar.currentHeight;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  componentDidMount() {
    // Check if the user is already signed in
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;
        
        try {
          const userType = await this.getUserTypeByEmail(email);
          await this.storeUserType(userType);
  
          this.props.navigation.navigate('Home');
        } catch (error) {
          console.error("Error fetching user type or storing it:", error);
        }
      }
    });
  }

  storeUserType = async (userType) => {
    try {
      await AsyncStorage.setItem('userType', userType);
    } catch (error) {
      console.error('Error saving userType:', error);
    }
  };

  getUserTypeByEmail = async (email) => {
    try {
      const usersRef = collection(db, 'Users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userType = userDoc.data().userType;
        return userType;
      } else {
        throw new Error('No user found with the given email.');
      }
    } catch (error) {
      console.error('Error getting user type:', error);
      throw error;
    }
  };

  handleLogin = async () => {
    const { email, password } = this.state;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userType = await this.getUserTypeByEmail(email);
      console.log("getUserTypeByEmail ",userType)
      await this.storeUserType(userType);

      console.log('User type set as:', userType);
      Alert.alert('Login successful!');

      this.props.navigation.navigate('Home');
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Something Wrong', 'Please check your credentials');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Incorrect password', 'The password is invalid for the email.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Signed out successfully!');
        this.props.navigation.navigate('Login'); 
      })
      .catch((error) => {
        Alert.alert('Error signing out', error.message);
        console.error(error);
      });
  };

  render() {
    return (
      <SafeAreaView style={styles.safearea}>
        {/* Image Container */}
        <View style={styles.ImageContainer}>
          <Image
            source={{ uri: "https://res.cloudinary.com/dkkkl3td3/image/upload/v1722784157/Sathyodhayam/mk2lpjcsc1oytupt3fxc.jpg" }}
            style={styles.image}
          />
        </View>

        {/* Input Container */}
        <ScrollView>
          <View style={styles.InputContainer}>
            <Text style={styles.Header}>User Login</Text>

            <View style={styles.Welcome_Text}>
              <Text>Hey, enter your details to sign</Text>
              <Text> into your account</Text>
            </View>

            <View style={styles.Input_Box_Container}>
              <TextInput
                placeholder='Enter Email'
                placeholderTextColor={"#858585"}
                style={styles.Input_Box}
                onChangeText={(email) => this.setState({ email })}
                value={this.state.email}
              />
              <TextInput
                placeholder='Password'
                placeholderTextColor={"#858585"}
                style={styles.Input_Box}
                secureTextEntry
                onChangeText={(password) => this.setState({ password })}
                value={this.state.password}
              />
              <Image
                style={{
                  width: 27,
                  height: 27,
                  marginLeft: "85%",
                  marginTop: -40,
                }}
                source={{
                  uri: "https://res.cloudinary.com/dxhmtgtpg/image/upload/v1681360562/Group254_uq1yhe.png",
                }}
              />
              <TouchableOpacity onPress={() => { this.props.navigation.navigate("Forget_Password") }}>
                <Text style={styles.Trouble_SignIn}>Having trouble in sign in?</Text>
              </TouchableOpacity>
              
              <View>
                <TouchableOpacity style={styles.Button} onPress={this.handleLogin}>
                  <Text style={styles.SignIn_Button_Text}>Sign In</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.Signup_Navigation}>
                <Text>Don’t have an account? 
                  <TouchableOpacity onPress={() => { this.props.navigation.navigate("Sign_up") }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}> Sign up</Text>
                  </TouchableOpacity>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safearea: {
    marginTop: Top,
    flex: 1,
    backgroundColor: "white",
    justifyContent: 'space-between',
  },

  ImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    height: '35%',
  },

  InputContainer: {
    height: '60%',
    alignContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  Header: {
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: '2%',
  },

  Welcome_Text: {
    alignItems: 'center',
    fontSize: 18,
    width: '100%',
    marginTop: '3%',
  },

  Input_Box_Container: {
    width: "100%",
    justifyContent: 'space-between',
    marginTop: '2.6%',
  },

  Input_Box: {
    width: "90%",
    height: 55,
    marginLeft: 20,
    borderWidth: 1,
    marginTop: '5%',
    borderColor: "#D6D6D6",
    borderRadius: 10,
    paddingLeft: 17,
  },

  Trouble_SignIn: {
    marginTop: '7%',
    marginLeft: '7%',
    fontSize: 13,
    fontWeight: 'bold',
  },

  Button: {
    width: "90%",
    height: 52,
    backgroundColor: "#10357E",
    marginLeft: 20,
    marginTop: "11%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  SignIn_Button_Text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFF',
  },

  Signup_Navigation: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '6%',
  }
});

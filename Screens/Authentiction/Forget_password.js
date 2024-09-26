import React, { Component } from 'react';
import { View, Text, SafeAreaView, StyleSheet, StatusBar, Image, ScrollView, TouchableOpacity, TextInput ,Alert} from 'react-native';
import { resetPassword } from "../../firebase";

const Top = StatusBar.currentHeight;

export default class Forget_Password extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '', 
    };
  }

  handleEmailChange = (email) => {
    this.setState({ email });
  };
  // TODO : write a email regex tovalidate email

  handleResetPassword = async () => {
    const { email } = this.state;
    console.log(email)
    try {
        await resetPassword(email);
        Alert.alert('Password Reset', 'A reset link has been sent to your email.');
        this.props.navigation.navigate("Email_Sent");
    } catch (error) {
        Alert.alert('Error', error.message);  
    }
  };

  render() {
    const { email } = this.state;
    const isButtonDisabled = email.trim() === '';

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
            <Text style={styles.Header}>Forgot Password</Text>

            <View style={styles.Welcome_Text}>
              <Text>Don’t worry! It happens. Please enter the</Text>
              <Text>address associated with your account.</Text>
            </View>

            <View style={styles.Input_Box_Container}>
              <TextInput
                placeholder='Enter Email'
                placeholderTextColor={"#858585"}
                style={styles.Input_Box}
                value={email}
                onChangeText={this.handleEmailChange}
              />

              {/* <View style={[styles.Button, isButtonDisabled && styles.ButtonDisabled]}>
                <TouchableOpacity
                  onPress={this.handleResetPassword }
                  disabled={isButtonDisabled} 
                >
                  <Text style={styles.SignIn_Button_Text}>Get Link</Text>
                </TouchableOpacity>
              </View> */}

              <TouchableOpacity
              onPress={this.handleResetPassword }
              disabled={isButtonDisabled}
              style={[styles.Button, isButtonDisabled && styles.ButtonDisabled]}
              >
              <Text style={styles.SignIn_Button_Text}>Get Link</Text>
              </TouchableOpacity>

              <View style={styles.Signup_Navigation}>
                <Text>Get back to Login? 
                  <TouchableOpacity onPress={() => { this.props.navigation.navigate("Login") }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 15, paddingTop: 15 }}> Login</Text>
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
    marginTop: '4%',
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
    fontWeight: 'black',
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
    marginRight: 20,
    borderWidth: 1,
    marginTop: '5%',
    borderColor: "#D6D6D6",
    borderRadius: 10,
    paddingLeft: 17,
  },

  Button: {
    width: "90%",
    height: 52,
    backgroundColor: "#10357E",
    marginLeft: 20,
    marginRight: 20,
    marginTop: "11%",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    alignContent: 'center',
  },

  ButtonDisabled: {
    backgroundColor: '#cccccc', 
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
  },
});

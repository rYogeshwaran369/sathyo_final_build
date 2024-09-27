
import React, { useState ,useEffect} from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, StatusBar, Alert, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import an icon library
import { getAuth, signOut, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase Auth functions
import AsyncStorage from '@react-native-async-storage/async-storage';
const Top = StatusBar.currentHeight;

export default function AppHeader({ navigation }) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [iconRotation] = useState(new Animated.Value(0)); // Animation for icon rotation
    const [userType, setUserType] = useState(null);
    const auth =getAuth();
    const getUserType = async () => {
        try {
          const value = await AsyncStorage.getItem('userType'); 
          console.log(value)
          return value;
        } catch (error) {
          console.error('Error retrieving userType:', error);
          return null;
        }
    };


    useEffect(() => {
        const fetchUserType = async () => {
          const type = await getUserType();
          setUserType(type);
        };
    
        fetchUserType();
      }, []);

    
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
        Animated.timing(iconRotation, {
            toValue: menuVisible ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeMenu = () => {
        setMenuVisible(false);
        Animated.timing(iconRotation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const navigateTo = (route) => {
        closeMenu();
        navigation.navigate(route);
    };

    const handleLogout = async () => {
        const auth = getAuth();
        try {
            await signOut(auth); // Sign out the user
            navigation.navigate('Login'); // Redirect to Login screen or another appropriate screen
        } catch (error) {
            console.error('Error signing out: ', error);
            Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
        }
    };

    const handleLogin = async (email, password) => {
        const auth = getAuth();
        try {
            await signInWithEmailAndPassword(auth, email, password); // Handle login here
            navigation.navigate('Home'); // Navigate to home or other screen upon successful login
        } catch (error) {
            console.error('Error signing in: ', error);
            Alert.alert('Login Error', 'Invalid credentials. Please check your email and password.');
        }
    };

    const rotation = iconRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View style={[styles.container, { marginTop: 40 }]}>
            <Image
                style={styles.backImage}
                source={{ uri: 'https://res.cloudinary.com/dkkkl3td3/image/upload/v1722829874/vayqnwazm9xtrmffrkqp.png' }}
            />
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <FontAwesome name={menuVisible ? "caret-up" : "bars"} size={24} color="black" />
                </Animated.View>
            </TouchableOpacity>

            {menuVisible && (
                <View style={styles.dropdownContainer}>
                    {userType==="Meditator" && <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('Meditation_page')}>
                        <Text style={styles.dropdownText}>Meditation</Text>
                    </TouchableOpacity>}
                    {userType==="Instructor" && <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('InstructorPage')}>
                        <Text style={styles.dropdownText}>Meditation</Text>
                    </TouchableOpacity>}
                    {userType==="Instructor" && <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('UploadMp3')}>
                        <Text style={styles.dropdownText}>Upload songs</Text>
                    </TouchableOpacity>}
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('SongPlayer')}>
                        <Text style={styles.dropdownText}>Song player</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('Profile_page')}>
                        <Text style={styles.dropdownText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                        <Text style={styles.dropdownText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Top,
        backgroundColor: 'white',
        paddingHorizontal: 10,
        height: 60,
        zIndex: 10, // Ensure the header stays above other elements
    },
    backImage: {
        width: 100,
        height: 40,
        resizeMode: 'contain',
    },
    menuButton: {
        paddingHorizontal: 10,
    },
    dropdownContainer: {
        position: 'absolute',
        top: 60, // Align dropdown below the header
        right: 10,
        backgroundColor: 'white',
        borderRadius: 10, // Rounded corners
        shadowColor: '#000', // For shadow effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5, // For Android shadow effect
        zIndex: 1,
    },
    dropdownItem: {
        padding: 15, // More padding for better spacing
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownText: {
        fontSize: 18,
        fontWeight: '500', // Bolder text
        color: '#333',
    },
});

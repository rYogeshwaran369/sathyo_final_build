import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from "../../firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(collection(db, 'Users'), where('email', '==', user.email));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        setUserData(doc.data());
                        AsyncStorage.setItem('userType', doc.data().userType);
                        AsyncStorage.setItem('userEmail', doc.data().email);
                    });
                } else {
                    console.log("No such user!");
                }
            }
            setLoading(false);
        };
        fetchUserData();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10357E" />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>User not found</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                style={styles.profileImage}
                source={{ uri: userData.profilePicture || 'https://static.vecteezy.com/system/resources/previews/018/765/757/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg' }}
            />
            <Text style={styles.nameText}>{userData.name}</Text>
            <Text style={styles.emailText}>{userData.email}</Text>
            {/* <Text style={styles.emailText}>{userData.mobile}</Text> */}

            {/* User details */}
            <View style={styles.detailsContainer}>
                <Text style={styles.detailLabel}>User Type:</Text>
                <Text style={styles.detailValue}>{userData.userType}</Text>

                <Text style={styles.detailLabel}>User Mobile:</Text>
                <Text style={styles.detailValue}>{userData.mobile}</Text>

                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{userData.address}</Text>

                <Text style={styles.detailLabel}>Total Meditations:</Text>
                <Text style={styles.detailValue}>{userData.totalMeditation}</Text>

                <Text style={styles.detailLabel}>Performance:</Text>
                <Text style={styles.detailValue}>{userData.performance}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff', // White background for a clean look
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
        borderColor: '#1E90FF', // Border color for the profile image
        borderWidth: 3,
    },
    nameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        color: '#1E90FF', // Blue color for the name
    },
    emailText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#f8f9fa', // Light background color for details
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // Adds shadow for Android
        marginTop: 20,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 5,
        color: '#10357E', // Dark blue for labels
    },
    detailValue: {
        fontSize: 16,
        color: '#555',
        marginBottom: 15,
        color: '#0d6efd', // Light blue for values
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import {auth,db} from "../../firebase"
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
                        console.log('Document found:', doc.id, ' => ', doc.data());
                        setUserData(doc.data());
                        AsyncStorage.setItem('userType', doc.data().userType);
                        AsyncStorage.setItem('userEmail', doc.data().email);
                        console.log(doc.data().userType)
                        console.log(doc.data().email)
                    });
                } else {
                    console.log("No such user!");
                }
            }
            // if(userData.userType==null)
            //     console.log(userData.userType)
            // else
            //     await AsyncStorage.setItem('userType', userData.userType);

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
        <View style={styles.container}>
            <Image
                style={styles.profileImage}
                source={{ uri: userData.profilePicture || 'https://via.placeholder.com/150' }} 
            />
            <Text style={styles.nameText}>{userData.name}</Text>
            <Text style={styles.emailText}>{userData.email}</Text>
            <Text style={styles.emailText}>{userData.mobile}</Text>
            {/* details and stuff add here , TODO : change frontend(subsi) */}
            <Text style={styles.bioText}>{userData.userType}</Text>
            <Text style={styles.bioText}>{userData.address}</Text>
            <Text style={styles.bioText}>{userData.totalMeditation}</Text>
            <Text style={styles.bioText}>{userData.performance}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emailText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 10,
    },
    bioText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginHorizontal: 20,
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

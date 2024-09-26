import React, { Component } from 'react';
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome icons

export default class Jabam_Card extends Component {
  render() {
    const { title, image, time } = this.props;
    return (
      <View style={styles.cardView}>
        <View style={styles.row}>
          <ImageBackground
            source={{ uri: image }}
            style={styles.imageBackground}
          />
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>{title}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>

        <TouchableOpacity style={styles.iconContainer}>
            <FontAwesome name="play" size={24} color="#898989" />
        </TouchableOpacity>

      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  cardView: {
    width: '130%',
    height: 70,
    borderRadius: 7,
    borderColor: '#CBCBCB',
    borderWidth: 1,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
  },
  imageBackground: {
    width: 50,
    height: 50,
    borderRadius: 5,
    overflow: 'hidden',
  },
  description: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
  },
  descriptionText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginLeft:'-50%' // Ensures text is centered within the description area
  },
  timeText: {
    fontSize: 10,
    color: '#BBBBBB',
    textAlign: 'center',
    marginLeft:'-50%' // Center the time text
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '9%',
  },
});

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ImageComponent = () => {
  const imageUri = "https://firebasestorage.googleapis.com/v0/b/reviewtest-5f0d8.appspot.com/o/communityImages%2Fimage_1725154614282.jpg?alt=media&token=6d69bc6a-f82c-423a-8b1e-3ea103a18761";

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
  },
});

export default ImageComponent;

import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking } from 'react-native';

const EventDetail = ({ route }) => {
  const { item } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* 대표 이미지 표시 */}
      {item.firstimage ? (
        <Image source={{ uri: item.firstimage }} style={styles.largeImage} />
      ) : (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      {/* 추가 이미지들 표시 */}
      {item.images && item.images.length > 0 && (
        <ScrollView horizontal style={styles.imageContainer}>
          {item.images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.additionalImage} />
          ))}
        </ScrollView>
      )}

      {/* 기타 정보 표시 */}
      <View style={styles.textContainer}>
        {item.title && <Text style={styles.detail}>✅ {item.title}</Text>}
        {item.addr1 && <Text style={styles.detail}>🏠 {item.addr1}</Text>}

        {item.tel && (
          <Text style={styles.detail} onPress={() => Linking.openURL(`tel:${item.tel}`)}>
            📞 {item.tel}
          </Text>
        )}
        {item.homepage && (
          <Text
            style={styles.detail}
            onPress={() => Linking.openURL(item.homepage)}
          >
            Homepage: {item.homepage}
          </Text>
        )}
        {item.overview && <Text style={styles.detail}>Overview: {item.overview}</Text>}
        {/* 추가적인 세부 정보 */}
        {item.eventstartdate && <Text style={styles.detail}>Start Date: {item.eventstartdate}</Text>}
        {item.eventenddate && <Text style={styles.detail}>End Date: {item.eventenddate}</Text>}
        {item.usetimefestival && <Text style={styles.detail}>Use Time: {item.usetimefestival}</Text>}
        {item.subevent && <Text style={styles.detail}>Sub Event: {item.subevent}</Text>}
        {item.playtime && <Text style={styles.detail}>Play Time: {item.playtime}</Text>}
        {item.bookingplace && <Text style={styles.detail}>Booking Place: {item.bookingplace}</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
   marginTop: 50, // 여기에 marginTop 추가
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  largeImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  noImageText: {
    fontSize: 16,
    color: '#fff',
  },
  imageContainer: {
    marginBottom: 16,
  },
  additionalImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  textContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
});

export default EventDetail;

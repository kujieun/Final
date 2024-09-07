//최신

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  ActivityIndicator,
  TouchableWithoutFeedback,
  BackHandler,
  ScrollView
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const API_KEY = 'AIzaSyBi7dTSWOJEE6JepCHm-ABWDjt2Yne_3cw'; // Replace with actual API key

// Button Component
const Button = React.memo(({ title, isSelected, onPress }) => (
  <TouchableOpacity
    style={[styles.button, isSelected && styles.selectedButton]}
    onPress={onPress}
  >
    <Text style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
));

// Custom Hook for fetching places
const useFetchPlaces = (type) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) return;

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
          params: {
            location: '37.7667,128.8833',
            radius: 5000,
            type,
            key: API_KEY,
            language: 'ko',
          },
        });
        setPlaces(data.results);
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [type]);

  return { places, loading };
};

// Fetch place details including photos
const fetchPlaceDetails = async (placeId) => {
  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: API_KEY,
        language: 'ko',
      },
    });
    return data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
  }
};

// Main Component
const BusInfo = () => {
  const [selectedTab, setSelectedTab] = useState('길찾기');
  const [selectedButton, setSelectedButton] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState('');
  const webViewRef = useRef(null);

  const pan = useRef(new Animated.ValueXY({ x: 0, y: screenHeight })).current;

const panResponder = useMemo(() => PanResponder.create({
  onStartShouldSetPanResponder: (evt, gestureState) => {
    // Check if touch is within the image container
    const { pageY } = evt.nativeEvent;
    const isInsideImageContainer = pageY < (screenHeight - 300); // Adjust the height according to your layout
    return !isInsideImageContainer;
  },
  onPanResponderMove: (_, gestureState) => {
    pan.setValue({ x: 0, y: gestureState.dy });
  },
  onPanResponderRelease: (_, gestureState) => {
    const toValue = gestureState.dy < -50 ? -300 : (gestureState.dy > 50 ? screenHeight : 0);
    Animated.spring(pan, {
      toValue: { x: 0, y: toValue },
      useNativeDriver: false
    }).start(() => {
      if (toValue === screenHeight) {
        setSelectedPlace(null);
        setIsPanelVisible(false);
      }
    });
  }
}), [pan]);


  const { places, loading } = useFetchPlaces(selectedButton);

  useEffect(() => {
    if (selectedPlace) {
      setIsPanelVisible(true);
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false
      }).start();
    }
  }, [selectedPlace]);

  // Handle marker press
  const handleMarkerPress = useCallback(async (place) => {
    const details = await fetchPlaceDetails(place.place_id);
    setSelectedPlace(details);
  }, []);

const getPhotoUrl = useCallback((photoReference) => (
  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`
), []);


const handleTouchOutside = useCallback((evt) => {
  const { pageY } = evt.nativeEvent;
  const isInsideImageContainer = pageY < (screenHeight - 300); // Adjust the height accordingly
  if (isPanelVisible && !isInsideImageContainer) {
    Animated.spring(pan, {
      toValue: { x: 0, y: screenHeight },
      useNativeDriver: false
    }).start(() => {
      setSelectedPlace(null);
      setIsPanelVisible(false);
    });
  }
}, [isPanelVisible, pan]);


  // Handle WebView open and close
  const handleWebViewOpen = (url) => {
    setWebViewUrl(url);
    setShowWebView(true);
  };

  const handleWebViewClose = () => {
    setShowWebView(false);
  };

  // Handle back press for WebView
  const handleBackPress = useCallback(() => {
    if (showWebView && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  }, [showWebView]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [handleBackPress]);

  // Render map and buttons
  const renderContent = useMemo(() => (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.7667,
          longitude: 128.8833,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {places.map(place => (
          <Marker
            key={place.place_id}
            coordinate={{
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
            }}
            pinColor="#6495ED"
          >
            <View style={styles.markerContainer}>
              <Image
                source={{ uri: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png' }}
                style={styles.markerImage}
              />
              <Text style={styles.markerText}>{place.name}</Text>
            </View>
            <Callout onPress={() => handleMarkerPress(place)}>
              <View style={styles.calloutView}>
                <Text style={styles.calloutText}>{place.name}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.buttonRow}>
        {['tourist_attraction', 'restaurant', 'cafe'].map(button => (
          <Button
            key={button}
            title={
              button === 'tourist_attraction'
                ? '여행지'
                : button === 'restaurant'
                ? '맛집'
                : '카페'
            }
            isSelected={selectedButton === button}
            onPress={() => setSelectedButton(button)}
          />
        ))}
      </View>
      {loading && <ActivityIndicator size="large" color="#6495ED" style={styles.loader} />}
    </View>
  ), [selectedButton, places, loading, handleMarkerPress]);

  return (
    <View style={styles.container}>
      {showWebView ? (
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            source={{ uri: webViewUrl }}
            style={styles.webView}
            onNavigationStateChange={(navState) => {
              if (!navState.url.startsWith('http')) {
                setShowWebView(false);
              }
            }}
          />
          <TouchableOpacity style={styles.closeButton} onPress={handleWebViewClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TouchableWithoutFeedback onPress={handleTouchOutside}>
            <View style={styles.topSection}>
              <View style={styles.rectangle}>
                <Text style={styles.searchText}>장소 검색</Text>
                <Image source={require('../image/searchicon.png')} style={styles.searchIcon} />
              </View>
              <View style={styles.navBar}>
                {['길찾기'].map(tab => (
                  <TouchableOpacity
                    key={tab}
                    style={styles.navButton}
                    onPress={() => setSelectedTab(tab)}
                  >
                    <Text style={selectedTab === tab ? styles.navTextActive : styles.navText}>
                      {tab}
                    </Text>
                    {selectedTab === tab && <View style={styles.navUnderlineActive} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.contentContainer}>
            {renderContent}
            {isPanelVisible && selectedPlace && (
              <Animated.View
                style={[styles.swipePanel, { transform: pan.getTranslateTransform() }]}
                {...panResponder.panHandlers}
              >
                <View style={styles.swipePanelHandle} />
                <Text style={styles.swipePanelTitle}>{selectedPlace.name}</Text>
                <Text style={styles.swipePanelDescription}>{selectedPlace.vicinity}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>별점: {selectedPlace.rating}</Text>
                </View>
                {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollContainer}
                  >
                    {selectedPlace.photos.map((photo, index) => (
                      <Image
                        key={index}
                        source={{ uri: getPhotoUrl(photo.photo_reference) }}
                        style={styles.swipePanelImage}
                      />
                    ))}
                  </ScrollView>
                )}


            <View style={styles.actionButtonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleWebViewOpen(`https://map.kakao.com/link/to/${selectedPlace.name},${selectedPlace.geometry.location.lat},${selectedPlace.geometry.location.lng}`)}
              >
                <Text style={styles.actionButtonText}>웹으로 길찾기</Text>
              </TouchableOpacity>
            </View>

              </Animated.View>
            )}
          </View>
        </>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#6495ED',
  },
  selectedButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  loader: {
    position: 'absolute',
    top: screenHeight / 2,
    left: screenWidth / 2,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerImage: {
    width: 30,
    height: 30,
  },
  markerText: {
    fontSize: 12,
  },
  calloutView: {
    padding: 5,
    maxWidth: 150,
  },
  calloutText: {
    fontSize: 16,
  },
  topSection: {
    padding: 10,
  },
  rectangle: {
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchText: {
    fontSize: 16,
    flex: 1,
  },
  searchIcon: {
    width: 20,
    height: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
  },
  navTextActive: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  navUnderlineActive: {
    height: 2,
    backgroundColor: '#1E90FF',
    width: 50,
    marginTop: 5,
  },
  contentContainer: {
    flex: 1,
  },
  swipePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
  },
  swipePanelHandle: {
    width: 60,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  swipePanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipePanelDescription: {
    fontSize: 16,
    marginVertical: 5,
  },
  ratingContainer: {
    marginVertical: 10,
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
  },
imageScrollContainer: {
    height: 200,  // 높이 값을 조정하여 이미지가 제대로 보이게 함
    flexDirection: 'row',
  },
  swipePanelImage: {
    width: 155,   // 너비 값을 조정하여 이미지가 제대로 보이게 함
    height: 144,
    marginRight: 10,
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#1E90FF',
    padding: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 30,
    right: 10,
    backgroundColor: '#FF0000',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default BusInfo;
//잘된다
// 사용자 위치 표시
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, StatusBar, TextInput, Image, Text, TouchableOpacity, FlatList, Animated, ScrollView, TouchableWithoutFeedback , PermissionsAndroid,   BackHandler,} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import Geolocation from "react-native-geolocation-service"
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get('window');
const googleMapsApiKey = 'AIzaSyBi7dTSWOJEE6JepCHm-ABWDjt2Yne_3cw';

const removeCountryName = (description) => description.replace(/대한민국/g, '').trim();

const getButtonStyle = (selectedCategory, category) => ({
  ...styles.categoryButton,
  backgroundColor: selectedCategory === category ? '#6495ED' : '#FFFFFF',
  elevation: selectedCategory === category ? 15 : 10,
});

const getButtonTextStyle = (selectedCategory, category) => ({
  ...styles.buttonText,
  color: selectedCategory === category ? '#FFFFFF' : '#000000',
});

const searchPlaces = async (query) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
      params: {
        input: query,
        key: googleMapsApiKey,
        types: 'establishment',
        language: 'ko',
        components: 'country:kr',
      },
    });

    return response.data.predictions
      .map(prediction => ({
        ...prediction,
        description: removeCountryName(prediction.description),
      }))
      .filter(prediction => prediction.description.includes('강릉'));
  } catch (error) {
    console.error('장소 검색 API 호출 오류:', error);
    return [];
  }
};

const searchCategoryPlaces = async (category, location) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
         location: `${location.latitude},${location.longitude}`,
        radius: 5000,
        type: category,
        key: googleMapsApiKey,
        language: 'ko',
        components: 'country:kr',
      },
    });

    return response.data.results.map(result => ({
      id: result.place_id,
      name: result.name,
      formatted_address: result.vicinity,
      geometry: result.geometry.location,
    }));
  } catch (error) {
    console.error('장소 검색 API 호출 오류:', error);
    return [];
  }
};

const getCoordinates = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: googleMapsApiKey,
      },
    });

    if (response.data.status === 'OK') {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    }
    console.error('Geocoding API 호출 오류:', response.data.status);
    return { lat: null, lng: null };
  } catch (error) {
    console.error('Geocoding API 호출 오류:', error);
    return { lat: null, lng: null };
  }
};

const fetchPlaceDetails = async (placeId) => {
  try {
    const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        key: googleMapsApiKey,
        language: 'ko',
      },
    });
    return data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
  }
};

const getPhotoUrl = (photoReference) => (
  `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${googleMapsApiKey}`
);

const mapStyle = [
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "stylers": [{ "weight": 1 }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "weight": 1 }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text",
    "stylers": [{ "visibility": "off" }]
  }
];

const getDistanceBetweenCoordinates = (coord1, coord2) => {
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLng = toRadians(coord2.longitude - coord1.longitude);

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};


const TopSection = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [location, setLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.769,
    longitude: 128.8737,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [currentLocation, setCurrentLocation] = useState(null)
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isPanelVisible, setPanelVisible] = useState(false);

  const mapRef = useRef(null);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: height })).current;

  // 웹뷰 url
  const [webViewUrl, setWebViewUrl] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const webViewRef = useRef(null);

    const handleWebViewOpen = (url) => {
      setWebViewUrl(url);
      setShowWebView(true);
    };

    const handleWebViewClose = () => {
      setShowWebView(false);
    };

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




useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
        distanceFilter: 1,
      }
    );
    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);


  const categoryMappings = useMemo(() => ({
    '여행지': 'tourist_attraction',
    '식당': 'restaurant',
    '카페': 'cafe',
  }), []);

  const handleButtonPress = useCallback(async (category) => {
    const categoryType = categoryMappings[category];
    if (categoryType && mapRegion) {
      setSelectedCategory(category);
      const categoryPlaces = await searchCategoryPlaces(categoryType, mapRegion);
      setMarkers(categoryPlaces);
      setLocation(null);
    }
  }, [categoryMappings, mapRegion]);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (searchQuery.length > 0) {
        const cleanedPredictions = await searchPlaces(searchQuery);
        setPredictions(cleanedPredictions);
      } else {
        setPredictions([]);
      }
    };
    fetchPredictions();
  }, [searchQuery]);

  const placeDetailsCache = useRef({});

  const handleSelectPrediction = useCallback(async (placeId, description) => {
    const coordinates = await getCoordinates(description);
    if (coordinates.lat && coordinates.lng) {
      let placeName = placeDetailsCache.current[placeId];
      if (!placeName) {
        const placeDetails = await fetchPlaceDetails(placeId);
        placeName = placeDetails.name || '정보 없음';
        placeDetailsCache.current[placeId] = placeName;
      }

      setLocation({ latitude: coordinates.lat, longitude: coordinates.lng });
      setMarkers([{ id: placeId, name: placeName, geometry: coordinates }]); // 선택된 장소만 마커로 표시
      setPredictions([]);
      setSearchQuery('');
    }
  }, [pan]);

  const handleSearchIconPress = useCallback(async () => {
    if (searchQuery.length > 0 && predictions.length > 0) {
      const firstPrediction = predictions[0];
      await handleSelectPrediction(firstPrediction.place_id, firstPrediction.description);
    }
  }, [searchQuery, predictions, handleSelectPrediction]);

  const renderPredictionItem = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => handleSelectPrediction(item.place_id, item.description)}>
      <View style={styles.predictionItem}>
        <Text style={styles.predictionText}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  ), [handleSelectPrediction]);

  // 중복 마커 필터링
  const filteredMarkers = useMemo(() => {
    const markerMap = new Map();
    markers.forEach(marker => {
      const lat = marker.geometry.lat.toFixed(4); // 위도 소수점 자릿수
      const lng = marker.geometry.lng.toFixed(4); // 경도 소수점 자릿수
      const key = `${lat},${lng}`;

      // 배열의 첫 번째 마커만 사용
      if (!markerMap.has(key)) {
        markerMap.set(key, marker);
      }
    });
    return Array.from(markerMap.values());
  }, [markers]);

const handleMarkerPress = useCallback(async (marker) => {
  if (currentLocation) {
    const details = await fetchPlaceDetails(marker.id);
 setSelectedPlace(details);
    setPanelVisible(true);
    Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
    }).start();
    // 거리 계산
    let distance = null;
    if (marker.geometry && marker.geometry.lat && marker.geometry.lng) {
      distance = getDistanceBetweenCoordinates(currentLocation, {
        latitude: marker.geometry.lat,
        longitude: marker.geometry.lng,
      });
    } else {
      console.log('마커 좌표가 유효하지 않음');
    }

    // distance 값을 details 객체에 추가
    const detailsWithDistance = {
      ...details,
      distance: distance ? distance.toFixed(2) : null,
    };

    setSelectedPlace(detailsWithDistance);
    setPanelVisible(true);
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  } else {
    console.log('현재 위치가 정의되지 않음');
  }
}, [pan, currentLocation]);

      const handlePanelClose = useCallback(() => {
        setPanelVisible(false);
        Animated.spring(pan, {
          toValue: { x: 0, y: height },
          useNativeDriver: true,
        }).start();
      }, [pan]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content"/>
      <View style={styles.topsection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="장소 입력"
            placeholderTextColor="#8A8A8A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={handleSearchIconPress} style={styles.searchIconContainer}>
            <Image
              source={require('../image/searchicon.png')}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>

        {predictions.length > 0 && (
          <View style={styles.predictionListContainer}>
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              renderItem={renderPredictionItem}
              style={styles.predictionList}
            />
          </View>
        )}
      </View>

      <View style={styles.bottomsection}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          region={location ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          } : mapRegion}
          onRegionChangeComplete={(region) => setMapRegion(region)} // 지역이 변경되면 상태 업데이트
          customMapStyle={mapStyle}
          showsUserLocation={true}
        >
          {filteredMarkers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={{ latitude: marker.geometry.lat, longitude: marker.geometry.lng }}
              onPress={() => handleMarkerPress(marker)}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={require('../image/marker.png')}
                  style={{ width: 20, height: 20 }}  // 크기를 반으로 줄임
                  resizeMode="contain"
                />
               <Text style={styles.markerText}>{marker.name}</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        <View style={styles.buttonContainer}>
          {['여행지', '식당', '카페'].map((category) => (
            <TouchableOpacity key={category} onPress={() => handleButtonPress(category)}>
              <View style={getButtonStyle(selectedCategory, category)}>
                <Text style={getButtonTextStyle(selectedCategory, category)}>{category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

 {isPanelVisible && (
        <TouchableWithoutFeedback onPress={handlePanelClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

{/* 스와이프 패널 */}
{isPanelVisible && (
  <Animated.View style={[styles.panel, { transform: [{ translateY: pan.y }] }]}>
    <ScrollView contentContainerStyle={styles.panelContent}>

      <View style={styles.swipePanelHandle} />
        <Text style={[styles.panelTitle, { fontSize: 20 }]}>
          {selectedPlace?.name}
        </Text>
      <Text style={styles.panelAddress}>{selectedPlace?.formatted_address}</Text>
<View style={styles.ratingDistanceContainer}>
  <View style={styles.panelRating}>
    <Image
      source={require('../image/star.png')}
      style={styles.starImage}
    />
    <Text style={{ fontSize: 15 }}>{selectedPlace?.rating || '정보 없음'}</Text>
  </View>

  <View style={styles.panelDistance}>
    <Image
      source={require('../image/distance.png')}
      style={styles.distanceImage}
    />
    <Text style={{ fontSize: 15 }}>
      거리: {selectedPlace?.distance ? `${selectedPlace.distance} km` : '정보 없음'}
    </Text>
  </View>
</View>


      {/* 여러 이미지 출력 및 가로 스크롤 */}
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

<TouchableOpacity
  style={styles.directionsButton}
  onPress={() => handleWebViewOpen(`https://map.kakao.com/link/to/${selectedPlace.name},${selectedPlace.geometry.location.lat},${selectedPlace.geometry.location.lng}`)}
>
  <Text style={styles.directionsButtonText}>카카오로 길찾기</Text>
</TouchableOpacity>


    </ScrollView>
  </Animated.View>
)}


      {showWebView && (
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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleWebViewClose}
          >
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topsection: {
    height: 112,
    width: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    paddingHorizontal: 20,
    paddingTop: 44,
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    width: '100%',
  },
  input: {
    height: 38,
    backgroundColor: '#F0F1F2',
    borderRadius: 4,
    flex: 1,
    paddingHorizontal: 10,
    paddingRight: 34,
    color: '#000000',
  },
  searchIconContainer: {
    position: 'absolute',
    right: 10,
    height: 24,
    width: 24,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  predictionListContainer: {
    position: 'absolute',
    top: 84,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    maxHeight: 150,
    borderRadius: 4,
    elevation: 2,
    zIndex: 5,
  },
  predictionList: {
    flex: 1,
  },
  predictionItem: {
    padding: 10,
  },
  predictionText: {
    fontSize: 14,
    color: '#000000',
  },
  bottomsection: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 112,
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    top: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 34,
    height: 30,
    borderRadius: 12,
    elevation: 10,
  },
  buttonText: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: -0.025,
  },
  markerText: {
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#000000',
          textShadowColor: '#FFFFFF',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        },
  panel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: height * 0.5, // 패널 높이 설정
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 10,
      zIndex: 15,
    },
      swipePanelHandle: {
        width: 150,
        height: 5,
        backgroundColor: '#CCCCCC',
        borderRadius: 8,
        alignSelf: 'center',
        marginBottom: 10,
      },
    panelContent: {
      padding: 20,
    },

    panelTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    panelAddress: {
      fontSize: 16,
      color: '#666666',
    },
       ratingDistanceContainer: {
         flexDirection: 'row',
         marginVertical: 5,
       },

       panelRating: {
         flexDirection: 'row',
         alignItems: 'center',
         marginRight:8,
       },

       panelDistance: {
         flexDirection: 'row',
         alignItems: 'center',
       },

       starImage: {
         width: 15,
         height: 15,
         marginRight: 7,
       },

       distanceImage: {
         width: 4,
         height: 4,
         marginRight: 7,
       },

    panelImage: {
          width: '100%',
          height: 200,
          borderRadius: 10,
    },
    directionsButton: {
      marginTop: 20,
      paddingVertical: 10,
      backgroundColor: '#6495ED',
      borderRadius: 10,
      alignItems: 'center',
    },
    directionsButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
      imageScrollContainer: {
          marginTop: 15,
          marginBottom: 15,
        },
        swipePanelImage: {
          width: 155, // 각 이미지의 너비
          height: 144, // 각 이미지의 높이
          borderRadius: 10,
          marginRight: 10, // 이미지 간의 간격
        },
      webViewContainer: {
          flex: 1, // 전체 화면을 차지하게 설정
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'white', // 배경색을 흰색으로 설정하거나 원하는 색상으로 변경
          zIndex: 20, // 스와이프 패널보다 위에 위치하도록 설정
        },
  closeButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#6495ED',
    borderRadius: 10,
    alignItems: 'center',

  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default TopSection;
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Image, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';

const categories = [
  { id: 1, label: '전체' },
  { id: 2, label: '촬영지' },
  { id: 3, label: '해수욕장' },
  { id: 4, label: '자연명소' },
  { id: 5, label: '테마파크' },
  { id: 6, label: '문화유적' },
  { id: 7, label: '체험관광' },
  { id: 8, label: '쇼핑' },
];

const SignupScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [tourData, setTourData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNo, setPageNo] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [likedItems, setLikedItems] = useState({});

  const handleCategoryPress = (id) => {
    setSelectedCategory(id);
    setPageNo(1);
    setLoading(true);
  };

  const fetchTourData = async (page) => {
    try {
      const response = await axios.get('https://apis.data.go.kr/B551011/KorService1/areaBasedList1', {
        params: {
          serviceKey: "FQpciKW/JvtOmZVINTmwg2cOAZ2XZqKAZAluhDuoWqQXqDBoJFK48P+uEyIcNqIYPYT6HJzKxdYXuwD9nOX+CA==",
          numOfRows: 10,
          pageNo: page,
          MobileOS: 'AND',
          MobileApp: '또,강릉',
          _type: 'json',
          contentTypeId: 15,
          areaCode: 32,
          sigunguCode: 1,
          listYN: 'Y',
          arrange: 'Q',
        },
      });

      if (response.status === 200 && response.data.response && response.data.response.body && response.data.response.body.items) {
        const items = response.data.response.body.items.item;

        if (Array.isArray(items)) {
          const formattedData = items.map(item => ({
            title: item.title || "No Title",
            overview: item.overview || "No Overview",
            image: item.firstimage || '',
            tel: item.tel || "",
            contentid: item.contentid,
          }));

          const uniqueData = formattedData.filter((item, index, self) =>
                    index === self.findIndex((t) => t.contentid === item.contentid)
                  );


          setTourData(prev => (page === 1 ? formattedData : [...prev, ...formattedData]));
          setTotalCount(response.data.response.body.totalCount);
        } else {
          console.error('Items is not an array or is empty:', items);
        }
      } else {
        console.error('Unexpected response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourData(pageNo);
  }, [pageNo, selectedCategory]);

  const handleLikePress = (id) => {
    setLikedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const loadMoreData = () => {
    if (!loading && tourData.length < totalCount) {
      setPageNo(prevPageNo => prevPageNo + 1);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.restaurantItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.title}</Text>
        <Text style={styles.restaurantDescription}>{item.overview}</Text>
        <View style={styles.ratingRow}>
          <View style={styles.starRating}>
            <Image source={require('../image/restaurant/yellowstar.png')} style={styles.star} />
            <Text style={styles.ratingText}>0.0 (0)</Text>
          </View>
          <View style={styles.distanceRow}>
            <View style={styles.dot} />
            <Text style={styles.distanceText}>111m</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handleLikePress(item.contentid)}
        style={styles.actionButton}
      >
        <Image
          source={likedItems[item.contentid] ? require('../image/restaurant/like.png') : require('../image/restaurant/unlike.png')}
          style={styles.actionIcon}
        />
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="large" color="#6495ED" />;
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { /* 뒤로가기 기능 */ }}
          style={styles.backButtonContainer}
        >
          <Image source={require('../image/signup/backbutton.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.headerText}>추천 여행지</Text>
        <TouchableOpacity
          onPress={() => { /* Search 기능 */ }}
          style={styles.searchButtonContainer}
        >
          <Image source={require('../image/searchicon.png')} style={styles.searchIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.navContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.categoryWrapper}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category.id)}
                style={[
                  styles.categoryContainer,
                  selectedCategory === category.id && styles.selectedCategory
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.selectedCategoryText
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.lineContainer}>
              {categories.map((category) => (
                <View
                  key={category.id}
                  style={[
                    styles.line,
                    (selectedCategory === category.id) ? styles.activeLine : styles.inactiveLine
                  ]}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.rectangle} />

      <View style={styles.frame222}>
        <Text style={styles.sortOptionText}>평점 높은 순</Text>
        <TouchableOpacity onPress={() => { /* 여기에 필터 버튼 클릭 시 동작을 추가 */ }}>
          <Image source={require('../image/restaurant/filtertype.png')} style={styles.filterType} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => { /* 여기에 버튼 클릭 시 동작을 추가 */ }}
        style={styles.FilterIconButtonContainer}
      >
        <Image source={require('../image/restaurant/filtericon.png')} style={styles.filterIcon} />
      </TouchableOpacity>

      <FlatList
        style={styles.restaurantList}
        data={tourData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.contentid.toString() + index.toString()}  // 고유한 키 생성
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
  },
  headerText: {
    top: 45,
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    color: '#111111',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 20,
    top: 30,
    width: 39.51,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 30,
    height: 30,
  },
  searchButtonContainer: {
    position: 'absolute',
    right: 5,
    top: 30,
    width: 42,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    width: 19,
    height: 19,
  },
  navContainer: {
    position: 'absolute',
    top: 95,
    left: 0,
    width: '100%',
    height: 33,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 0,
  },
  categoryWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 33,
  },
  categoryContainer: {
    alignItems: 'center',
    width: 60,
    position: 'relative',
  },
  categoryText: {
    fontFamily: 'Pretendard',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.025,
    color: '#646C79',
  },
  selectedCategoryText: {
    color: '#6495ED',
  },
  lineContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    height: 2,
    backgroundColor: '#DDDEE0',
  },
  line: {
    width: 56,
    height: 2,
  },
  activeLine: {
    backgroundColor: '#6495ED',
  },
  inactiveLine: {
    backgroundColor: 'transparent',
  },
  rectangle: {
    position: 'absolute',
    height: 39,
    left: 0,
    right: 0,
    top: 128,
    backgroundColor: '#F0F1F2',
  },
  frame222: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    paddingHorizontal: 8,
    position: 'absolute',
    width: 85,
    height: 35,
    left: 20,
    top: 130,
  },
  sortOptionText: {
    width: 85,
    height: 35,
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 35,
    color: '#646C79',
    marginRight: -10,
  },
  filterType: {
    width: 13,
    height: 5,
  },
  FilterIconButtonContainer: {
    position: 'absolute',
    width: 35,
    height: 35,
    right: 20,
    top: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    width: 35,
    height: 35,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  restaurantList: {
    flex:1,
    top: 165,
    left: 20,
    right: 14,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 93,
    marginBottom: 14,
  },
  restaurantImage: {
    width: 93,
    height: 93,
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 14,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
    color: '#111111',
  },
  restaurantDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#646C79',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    width: 15,
    height: 15,
  },
  ratingText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#B8B6C3',
    marginLeft: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 2,
  },
  distanceText: {
    fontSize: 10,
    lineHeight: 14,
    color: '#B8B6C3',
    marginLeft: 4,
  },
  actionButton: {
    width: 33,
    height: 93,
    justifyContent: 'center',
    alignItems: 'flex-end',
    right: 50, // 화면 오른쪽에서 60 단위 위치
  },
  actionIcon: {
    width: 19.02,
    height: 15.81,
  },
});

export default SignupScreen;

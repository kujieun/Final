import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
// import { useNavigation } from '@react-navigation/native'; 

const Community = () => {
    const [posts, setPosts] = useState([]);
    // const navigation = useNavigation();
    const [selectmenu, setSelectMenu] = useState('latest');
    const [isSearchVisible, setIsSearchVisible] = useState(false); 
    const [searchQuery, setSearchQuery] = useState(''); 
    const [searchfilter, setFilteredPosts] = useState([]);
    
 
  //db 데이터 받아오기 
    useEffect(() => {
        const unsubscribe = firestore()
            .collection('community')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const postsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPosts(postsData);
                setFilteredPosts(postsData);
            });

        return () => unsubscribe();
    }, []);


    //검색 기능
    
    const toggleSearchBar = () => {
      setIsSearchVisible(!isSearchVisible);
    
      if (!isSearchVisible) {
        setSearchQuery(''); // 검색 바가 나타날 때 검색어 초기화
      }
    };
    
      
    const clearSearch = () => {
      setSearchQuery('');
    };

    // 검색어 변경 시
    const handleSearch = () => {
      const filtered = posts.filter(post => 
        (Array.isArray(post.tags) && post.tags.some(tag => tag.includes(searchQuery))) ||  //태그인 경우 추가
          post.content.includes(searchQuery)
      );
      setFilteredPosts(filtered);
    };

    // 검색어 공백 시
    useEffect(() => {
        if (searchQuery === '') {
            setFilteredPosts(posts);
        }
    }, [searchQuery, posts]);

    //검색 / 질문,최신 필터링 구분
    // const finalData = isSearchVisible || searchQuery ? searchfilter : filteredPosts;

    //게시글 필터링 기능
    const filteredPosts = posts.filter(post => {
      if (selectmenu === 'latest') {
          return true; // '최신' 탭에서는 모든 게시물 표시
      } else if (selectmenu === 'question') {
          return post.menu === '질문 게시물'; // '질문' 탭에서는 '질문 게시물'만 표시
      } else if (selectmenu === 'popular') {
          // 인기 게시물 로직을 구현하려면 여기에 추가
          return false; // 현재는 모든 게시물 표시안함
      }
      return false;
    });

    //시간 계산 기능 
    const calculateTimeDisplay = (timestamp) => {
      let createdAt;

      // Firestore Timestamp 객체를 JavaScript Date 객체로 변환
      try {
          if (timestamp && timestamp.seconds) {
              createdAt = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
              
              // Date 객체가 유효한지 확인
              if (isNaN(createdAt.getTime())) {
                  throw new Error("Invalid date");
              }
          } else {
              throw new Error("Invalid timestamp format");
          }
      } catch (error) {
          console.error("Error parsing date:", error);
          return "날짜 오류";
      }

    const now = new Date();
    const diffInMilliseconds = now - createdAt;

    // 시간 변환
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    // 시간 표시 로직
    if (diffInDays >= 1) {
        return `${diffInDays}일 전`;
    } else if (diffInHours >= 1) {
        return `${diffInHours}시간 전`;
    } else {
        return `${diffInMinutes}분 전`;
    }
  };
  


const renderItem = ({ item }) => {

      const timeDisplay = calculateTimeDisplay(item.createdAt);
      const tags = item.tags || []; 
      const images = item.images || [];

      const testImageUrl = images[0] || '';



      return (
        <View style={styles.postContainer}>
            <View style={styles.postHeader}>
                <View style={styles.profile} />
                <Text style={styles.nickname}>user</Text>
            </View>

    
            <Text style={styles.description}>
                {item.content}
            </Text>

            {/* 이미지 렌더링 */}
            {images.length > 0 ? (
                <FlatList
                    data={images}
                    renderItem={({ item }) => (
                        <Image 
                            source={{ uri: item }} 
                            style={styles.postImage} 
                            onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
                        />
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            ) : (
              <View />
            )}

            {/* 태그 */}
            <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                ))}
            </View>

            {/* 좋아요, 댓글 수 표시 */}
            <View style={styles.detailContainer}>
                <Image source={require('../img/Like.png')} style={styles.likeContainer} />
                <Text style={styles.number}>10</Text>
                <Image source={require('../img/Coment.png')} style={styles.comentContainer} />
                <Text style={styles.number}>01</Text>
                <Text style={styles.time}>{timeDisplay}</Text>
            </View>
    
            <View style={styles.line44} />
        </View>
      )
    };

    const handlePress = (menu) => {
      setSelectMenu(menu);
    };
    

  return (
    <View style={styles.container}>

      {/* 검색 바 */}
      {isSearchVisible ? (

      <View style={styles.searchBarWrapper}>
        {/* 뒤로가기 버튼 */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={toggleSearchBar}
          >
            <Image source={require('../img/Back.png')} />
          </TouchableOpacity>

      {/* 검색 바 클릭 시 */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="장소 이름 검색"
          placeholderTextColor="#646C79"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />

            {/* 클리어 버튼 */}
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearSearch}
            >
              <Image source={require('../img/SearchClear.png')} />
            </TouchableOpacity>

            <View style={styles.line} />

        </View>
      </View>
      ) : (

        // 검색 바 닫았을 때
        <View style={styles.header}>
              {/* 최신 */}
              <TouchableOpacity 
                  style={styles.latestContainer}
                  onPress={() => handlePress('latest')}
              >
                  <Text style={[
                      styles.latestText, 
                      { color: selectmenu === 'latest' ? '#111111' : '#B8B6C3' }
                  ]}>최신</Text>
                  <View style={[
                      styles.latestUnderline, 
                      { backgroundColor: selectmenu === 'latest' ? '#111111' : '#B8B6C3' }
                  ]} />
              </TouchableOpacity>
              
              {/* 인기 */}
              <TouchableOpacity 
                  style={styles.popularContainer}
                  onPress={() => handlePress('popular')}
              >
                  <Text style={[
                      styles.popularText, 
                      { color: selectmenu === 'popular' ? '#111111' : '#B8B6C3' }
                  ]}>인기</Text>
                  <View style={[
                      styles.popularUnderline, 
                      { backgroundColor: selectmenu === 'popular' ? '#111111' : '#B8B6C3' }
                  ]} />
              </TouchableOpacity>

              {/* 질문 */}
              <TouchableOpacity 
                  style={styles.questionContainer}
                  onPress={() => handlePress('question')}
              >
                  <Text style={[
                      styles.questionText, 
                      { color: selectmenu === 'question' ? '#111111' : '#B8B6C3' }
                  ]}>질문</Text>
                  <View style={[
                      styles.questionUnderline, 
                      { backgroundColor: selectmenu === 'question' ? '#111111' : '#B8B6C3' }
                  ]} />
              </TouchableOpacity>


          <TouchableOpacity style={styles.searchContainer} onPress={toggleSearchBar}>
              <Image source={require('../img/Search.png')}/>
          </TouchableOpacity>


          <TouchableOpacity style={styles.alarmContainer}>
              <Image source={require('../img/Alarm.png')}/>
          </TouchableOpacity>
     
  </View>
)}

    {/* 검색 바 유무에 따른 필터링 */}
    <FlatList
      data={isSearchVisible ? searchfilter : filteredPosts} 
      keyExtractor={item => item.id}
      renderItem={renderItem}
    />

    <TouchableOpacity style={styles.writeButton}
      >
        <View style={styles.writeButtonContent}>
            <Text style={styles.writeButtonText}>글쓰기</Text>
        </View>
    </TouchableOpacity>
    

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  latestContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  latestText: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    color: '#111111',
  },
  latestUnderline: {
    width: 40,
    height: 2,
    backgroundColor: '#111111',
    marginTop: 2,
  },
  popularContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  popularText: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    color: '#B8B6C3',
  },
  popularUnderline: {
    width: 40,
    height: 2,
    backgroundColor: '#B8B6C3',
    marginTop: 2,
  },
  questionContainer: {
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
    color: '#B8B6C3',
  },
  questionUnderline: {
    width: 40,
    height: 2,
    backgroundColor: '#B8B6C3',
    marginTop: 2,
  },
  searchContainer: {
    width: 32,
    height: 32,
    marginLeft: 140,
    marginRight: 10,
  },
  alarmContainer: {
    width: 32,
    height: 32,
  },
  postContainer: {
    alignItems: 'flex-start',
    // backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 12,
  },
  postHeader: {
    flexDirection: 'row', // 가로 정렬
    alignItems: 'center', // 세로 가운데 정렬
    marginBottom: 10, // 하단 여백 추가
  },
  profile: {
    width: 40,
    height: 40,
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    marginBottom: 10,
    marginRight: 10,
  },
  nickname: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
    color: '#111111',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.025,
    color: '#646C79',
    textAlign: 'left',
    marginBottom: 10,
  },
  likeContainer: {
    width: 27,
    height: 27,
    marginBottom: 10,
  },
  number: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'center',
    letterSpacing: -0.04,
    color: '#111111',
    marginBottom: 10,
  },
  comentContainer: {
    width: 24,
    height: 24,
    marginBottom: 10,
    marginLeft: 15,
  },
  time: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 22, 
    textAlign: 'right',
    letterSpacing: -0.025,
    color: '#97A0A7',
    marginBottom: 0, 
    left: 200,
  },  
  line44: {
    width: 350,
    height: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(221, 222, 224, 0.5)',
    marginTop: 20,
  },
  detailContainer: {
    flexDirection: 'row', // 가로 정렬
    alignItems: 'center', // 세로 가운데 정렬
    marginTop: 10, // 상단 여백 추가
  },
  writeButton: {
    position: 'absolute',
    width: 50,
    height: 50,
    left: 330,
    top: 700,
    backgroundColor: '#6495ED',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Optional: Adds shadow effect
  },
  writeButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  writeButtonText: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 14,
    color: '#fff',
  },
  searchInput: {
    // flex: 1, // 검색 입력 필드가 가능한 모든 공간을 차지하도록 설정
    // height: 40,
    backgroundColor: '#F0F1F2',
    borderRadius: 4,
    // paddingHorizontal: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 10,
},
tag: {
    borderWidth: 1,
    borderColor: '#DDDEE0', 
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 5,
},
tagText: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    color: '#646C79',
},
backButton: {
  justifyContent: 'center',
  alignItems: 'center',
},
clearButton: {
  position: 'absolute',
  right: 10,
  top: 10,
  width: 32,
  height: 32,
  justifyContent: 'center',
  alignItems: 'center',
},
searchBarContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F0F1F2',
  borderRadius: 8,
  paddingHorizontal: 10,
  marginLeft: 20,
},
searchInput: {
  flex: 1,
  backgroundColor: 'transparent',
},
searchBarWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: '10%',
},
line: {
  position: 'absolute',
  bottom: '-60%',
  height: 1,
  width: '124.5%',
  left: '-15.5%',
  backgroundColor: '#6495ED',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 9, 
},
postImage: {
  width: 100, 
  height: 100,
  resizeMode: 'cover', 
  marginRight: 10, 
},
});

export default Community;

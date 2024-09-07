import * as React from "react";
import { StatusBar, StyleSheet, View, Image, Text, Dimensions, Pressable, TouchableOpacity, Animated } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useState, useEffect, useRef } from "react";
// import { TouchableOpacity } from "react-native-gesture-handler";

// 화면 너비 가져오기
const { width: screenWidth } = Dimensions.get('window');

// 이미지 리소스 정의
const menuImages = {
    1: require('../image/mainhome/menu/menu1.png'),
    2: require('../image/mainhome/menu/menu2.png'),
    3: require('../image/mainhome/menu/menu3.png'),
    4: require('../image/mainhome/menu/menu4.png'),
    5: require('../image/mainhome/menu/menu5.png'),
    6: require('../image/mainhome/menu/menu6.png'),
    7: require('../image/mainhome/menu/menu7.png'),
    8: require('../image/mainhome/menu/menu8.png'),
};


const MainHome = () => {
    const [daysLeft, setDaysLeft] = useState(0);
    const [weather, setWeather] = useState({
        icon: require('../image/mainhome/weather/clear.png'),
        temperature: '22.6°',
        windSpeed: '0.3m/s',
    });

    //하단 바 선택 메뉴
    const [selectedMenu, setSelectedMenu] = useState(null);

    const handleBarMenu = (menu) => {
        setSelectedMenu(menu);
    };

    //ar 메뉴
    const [isCharacterPressed, setIsCharacterPressed] = useState(false); // 상태 관리
    const animatedValue1 = useRef(new Animated.Value(0)).current;
    const animatedValue2 = useRef(new Animated.Value(0)).current;

    const handleCharacterPress = () => {
        setIsCharacterPressed(!isCharacterPressed); // 상태 반전

        if (!isCharacterPressed) {
            // 애니메이션 실행 (메뉴 보이게)
            Animated.timing(animatedValue1, {
                toValue: -100, // 위로 100px 이동
                duration: 300,
                useNativeDriver: true,
            }).start();

            Animated.timing(animatedValue2, {
                toValue: -100, // 위로 100px 이동
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // 애니메이션 종료 (메뉴 사라지게)
            Animated.timing(animatedValue1, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();

            Animated.timing(animatedValue2, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };


    useEffect(() => {
        const targetDate = new Date("2024-10-13"); // 목표 날짜
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays);
    }, []);

    const handleMenuPress = (menuIndex) => {
        console.log(`Menu ${menuIndex} pressed`);
        // 여기에 메뉴 항목 클릭 시의 동작을 추가합니다.
    };

    return (
        <View style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="dark-content"
            />
            <LinearGradient
                style={styles.lineargradient}
                locations={[0, 0.1, 0.4]}
                colors={['#fafdff', '#dcefff', '#a0c2f6']}
                useAngle={true}
                angle={178.86}
            />
            <Image
                source={require('../image/mainhome/logo.png')}
                style={styles.logo}
            />
            <View style={styles.alarmcontainer}>
                <Image
                    source={require('../image/mainhome/alarm.png')}
                    style={styles.alarm}
                />
                <View style={styles.alarmWarning} />
            </View>
            <Text style={styles.nickname}>
                닉네임님,{'\n'}
                강릉 여행까지{' '}
                <Text style={styles.daysText}>D-{daysLeft}</Text>
                {' '}남았습니다!
            </Text>

            <View style={styles.checkschedule}>
                <Image
                    source={require('../image/mainhome/checkschedule.png')}
                    style={styles.checkscheduleImage}
                />
            </View>

            <View style={styles.weathercontainer}>
                <Frame weather={weather} />
            </View>
            {/* 새 흰색 직사각형 추가 */}
            <View style={styles.fullScreenWhiteBackground}></View>

            {/* 메뉴 추가 */}
            <View style={styles.menuContainer1}>
                {[1, 2, 3, 4].map(index => (
                    <Pressable key={index} style={styles.menuItem} onPress={() => handleMenuPress(index)}>
                        <Image source={menuImages[index]} style={styles.menuIcon} />
                    </Pressable>
                ))}
            </View>

            {/* 메뉴 추가 */}
            <View style={styles.menuContainer2}>
                {[5, 6, 7, 8].map(index => (
                    <Pressable key={index} style={styles.menuItem} onPress={() => handleMenuPress(index)}>
                        <Image source={menuImages[index]} style={styles.menuIcon} />
                    </Pressable>
                ))}
            </View>

            {/* 하단 네비게이션 바 추가 */}
            <View style={styles.bottombarContainer}>
                <TouchableOpacity onPress={handleCharacterPress} style={styles.characterConatiner}>
                    <Image
                        source={require('../image/mainhome/barmenu/character.png')}
                        style={styles.bottombarEllipse}
                    />
                </TouchableOpacity>


                {isCharacterPressed && (
                    <>
                        <Animated.View style={[styles.animatedButtonContainer1, { transform: [{ translateY: animatedValue1 }] }]}>
                            <TouchableOpacity>
                                <Image source={require('../image/mainhome/barmenu/sunjji.png')} style={styles.buttonImage} />
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={[styles.animatedButtonContainer2, { transform: [{ translateY: animatedValue2 }] }]}>
                            <TouchableOpacity>
                                <Image source={require('../image/mainhome/barmenu/ar.png')} style={styles.buttonImage} />
                            </TouchableOpacity>
                        </Animated.View>
                    </>
                )}


                <View style={styles.bottombarRectangle}></View>


                    <TouchableOpacity onPress={() => handleBarMenu('home')}>
                        <Image
                            source={selectedMenu === 'home'
                                ? require('../image/mainhome/barmenu/select/home.png')
                                : require('../image/mainhome/barmenu/home.png')}
                            style={styles.bottombarImg}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleBarMenu('community')}>
                        <Image
                            source={selectedMenu === 'community'
                                ? require('../image/mainhome/barmenu/select/community.png')
                                : require('../image/mainhome/barmenu/community.png')}
                            style={styles.bottombarImg}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleBarMenu('my')}>
                        <Image
                            source={selectedMenu === 'my'
                                ? require('../image/mainhome/barmenu/select/my.png')
                                : require('../image/mainhome/barmenu/my.png')}
                            style={styles.bottombarImg}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleBarMenu('more')}>
                        <Image
                            source={selectedMenu === 'more'
                                ? require('../image/mainhome/barmenu/select/more.png')
                                : require('../image/mainhome/barmenu/more.png')}
                            style={styles.bottombarMore}
                        />
                    </TouchableOpacity>

                </View>
        </View>
    );
};

// Frame 컴포넌트
const Frame = ({ weather }) => {
    return (
        <View style={styles.frame}>
            <View style={styles.frameRow}>
                <View style={styles.column}>
                    <Text style={styles.label}>지역</Text>
                    <Text style={styles.value}>강릉</Text>
                </View>
                <View style={styles.column}>
                    <Text style={styles.label}>날씨</Text>
                    <Image
                        style={styles.weatherIcon}
                        source={weather.icon}
                    />
                </View>
                <View style={styles.column}>
                    <Text style={styles.label}>온도</Text>
                    <Text style={styles.value}>{weather.temperature}</Text>
                </View>
                <View style={styles.column}>
                    <Text style={styles.label}>풍속</Text>
                    <Text style={styles.value}>{weather.windSpeed}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    lineargradient: {
        flex: 1,
        width: "100%",
        height: 403,
        backgroundColor: "transparent",
    },
    logo: {
        position: 'absolute',
        width: 77,
        height: 27.93,
        left: 20,
        top: 41,
    },
    alarmcontainer: {
        position: 'absolute',
        width: 18,
        height: 23.1,
        right: 20,
        top: 43,
    },
    alarm: {
        width: 16,
        height: 19.1,
    },
    alarmWarning: {
        position: 'absolute',
        width: 8,
        height: 8,
        right: 0,
        top: 0,
        backgroundColor: '#FF4343',
        borderRadius: 4,
    },
    nickname: {
        position: 'absolute',
        height: 48,
        left: 54,
        top: 113,
        fontFamily: 'Pretendard-Bold',
        fontSize: 20,
        lineHeight: 24,
        textAlign: 'center',
        letterSpacing: -0.025,
        color: '#111111',
    },
    daysText: {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 20,
        lineHeight: 24,
        color: '#6495ED',
    },
    checkschedule: {
        position: 'absolute',
        width: 141,
        height: 28,
        left: (screenWidth / 2) - (141 / 2),
        top: 186,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkscheduleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    weathercontainer: {
        position: 'absolute',
        height: 64,
        width: screenWidth - 40,
        left: 20,
        top: 239,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 11,
        elevation:4,
    },
    frame: {
        flex: 1,
        flexDirection: "column",
    },
    frameRow: {
        flexDirection: "row",
        gap: 20,
        width: '100%',
        height: 42,
    },
    column: {
        alignItems: "center",
        gap: 11,
        flex: 1,
    },
    label: {
        fontFamily: 'Pretendard-Regular',
        fontSize: 10,
        lineHeight: 12,
        textAlign: 'center',
        letterSpacing: -0.025,
        color: "#97A0A7",
    },
    value: {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 14,
        lineHeight: 17,
        textAlign: 'center',
        letterSpacing: -0.025,
        color: "#000000",
    },
    weatherIcon: {
        width: 27.7,
        height: 26,
    },
    fullScreenWhiteBackground: {
        position: 'absolute',
        top: 326, // weathercontainer의 아래에서 시작 (top: 303) + height (64)
        left: 0,
        width: screenWidth,
        height: '100%', // 화면 전체 높이
        backgroundColor: '#FFFFFF',
        borderRadius:30,
    },
    menuContainer1: {
        top:356,
        position: 'absolute',
        height: 65,
        width: screenWidth - 40,
        left: 20,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    menuContainer2: {
        top:429,
        position: 'absolute',
        height: 65,
        width: screenWidth - 40,
        left: 20,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
    },
    menuItem: {
        width: 65,
        height: 65,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIcon: {
        width: 65,
        height: 65,
    },
 bottombarContainer: {
        position: 'absolute',
        height: 83,
        width: screenWidth,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        elevation: 10,
        shadowColor: '#0000FF',
    },
    bottombarRectangle: {
            position: 'absolute',
            width: 28,
            height: 28,
            left: screenWidth / 2 - 14,
            bottom: 55,
    },
    bottombarEllipse: {
        position: 'absolute',
        width: 60,
        height: 60,
    },
    bottombarText: {
        color: '#000000',
        fontSize: 16,
    },
    bottombarImg: {
        resizeMode: 'contain',
        width: 55,
        height: 50,
    },
    bottombarMore: {
        resizeMode: 'contain',
        top: 6,
        width: 30,
        height: 55,
    },
    animatedButtonContainer1: {
        position: 'absolute',
        bottom: 10,
        left: 135, // 왼쪽으로 배치
    },
    animatedButtonContainer2: {
        position: 'absolute',
        bottom: 10,
        right: 135, // 오른쪽으로 배치
    },
    buttonImage: {
        resizeMode: 'contain',
        width: 60,
        height: 60,
    },
    characterConatiner: {
        position: 'absolute',
        left: (screenWidth / 2) - 30, // 중앙에 위치
        bottom: 110,
    }
});

export default MainHome;

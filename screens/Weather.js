import React from "react";
import { Alert, View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from "react-native";
import axios from "axios";
// import { XMLParser } from 'fast-xml-parser';

//파싱
// const parser = new XMLParser();

// API 키와 예시 위치 설정
const API_KEY = "9fd5c9fdde5b224d48ca942a3984d6c8";

// 강릉 경도와 위도(openweathermap)
const LATITUDE = 37.7514;
const LONGITUDE = 128.8760;


const Cloud = require('../img/Cloud.png');
const Clear = require('../img/Clear.png');
const Rain = require('../img/Rain.png');
const Snow = require('../img/Snow.png');
const Else = require('../img/11.png');

export default class App extends React.Component {
  state = {
    isLoading: true,
    currentWeather: {},
    hourlyForecast: [],
  };

  // 날씨 상태를 분류하는 함수
  classifyCondition = (id) => {
    if (id >= 200 && id <= 599) {
      return Rain;
    } else if (id >= 600 && id <= 699) {
      return Snow;
    } else if (id >= 700 && id <= 799) {
      return Cloud;
    } else if (id === 800) {
      return Clear;
    }
    return Else;
  };

  // 현재 날씨 정보 가져오기
  getWeather = async (latitude, longitude) => {
    try {
      const {
        data: {
          main: { temp, humidity, feels_like },
          weather,
          wind: { speed },
          rain,
          sys: { sunrise, sunset },
        },
      } = await axios.get(
        `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`  
    );

      const { id } = weather[0];
      const condition = this.classifyCondition(id);
      const rainAmount = rain ? rain['1h'] : 0; // 비 데이터가 없을 경우 0으로 기본 설정
      const rise = new Date(sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const set = new Date(sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      this.setState({
        currentWeather: {
          condition,
          temp,
          speed,
          rain: rainAmount,
          humidity,
          feels_like,
          sunrise: rise,
          sunset: set,
        },
        // isLoading: false,
      });
    } catch (error) {
      Alert.alert("Error", "Could not fetch weather data");
    }
  };


  // 3시간 날씨 에보 가져오기
  getThreeHourForecast = async (latitude, longitude) => {
    try {
      const { data } = await axios.get(
        `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      
      const currentDate = new Date();
      console.log("Current Date and Time: ", currentDate); // 현재 시간 확인
      const hourlyForecast = data.list
        .slice(0, 8) // 3시간 간격의 데이터
        .map((item) => {
          const forecastTime = new Date(item.dt_txt);
          const isMidnight = forecastTime.getHours() === 0; // 자정 확인
          return {
            time: isMidnight ? `${forecastTime.getDate()}일` : `${forecastTime.getHours()}시`,
            condition: this.classifyCondition(item.weather[0].id),
            temp: item.main.temp,
            humidity: item.main.humidity,
            isDate: isMidnight, // 자정인지 여부
          };
        });
      
      console.log("Hourly Forecast: ", hourlyForecast); // 디버깅용 로그
      
      this.setState({
        hourlyForecast,
        isLoading: false,
      });
    } catch (error) {
      Alert.alert("Error", "Could not fetch forecast data");
    }
  };
  



  componentDidMount() {
    this.getWeather(LATITUDE, LONGITUDE);
    this.getThreeHourForecast(LATITUDE, LONGITUDE);

  }

  render() {
    const { isLoading, currentWeather, hourlyForecast } = this.state;
    return (
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Getting the weather...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.rectangle511}>
              <Text style={styles.locationText}>강원도 강릉</Text>
              <Image source={currentWeather.condition} style={styles.weatherImage} />
              <Text style={styles.temp}>{currentWeather.temp}°</Text>
              <Text style={styles.feeltemp}>체감 온도 : {currentWeather.feels_like}°</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>습도</Text>
                    <Text style={styles.infoValue}>{currentWeather.humidity}%</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>강수량</Text>
                    <Text style={styles.infoValue}>{currentWeather.rain}mm</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>풍속</Text>
                    <Text style={styles.infoValue}>{currentWeather.speed}m/s</Text>
                  </View>
                  <View style={styles.sunBox}>
                    <View style={styles.sunRow}>
                      <Text style={styles.infoTitle}>일출</Text>
                      <Text style={styles.infoValue}>{currentWeather.sunrise}</Text>
                    </View>
                    <View style={styles.sunRow}>
                      <Text style={styles.infoTitle}>일몰</Text>
                      <Text style={styles.infoValue}>{currentWeather.sunset}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.forecastContainer}>
            <Text style={styles.hourlytext}>시간별 예보</Text>
                <ScrollView horizontal>
                    {hourlyForecast.map((forecast, index) => (
                        <View key={index} style={styles.forecastBox}>
                        <Text style={styles.timeText}>{forecast.time}</Text>
                        <Image source={forecast.condition} style={styles.weatherImageSmall} />
                        <Text style={styles.humidityText}>{forecast.humidity}%</Text>
                        <Text style={styles.tempText}>{forecast.temp}°</Text>
                        </View>
                        
                    ))}
                </ScrollView>
            </View>

  

            
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(220, 239, 255, 0.7)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
  rectangle511: {
    width: '95%',
    height: 500,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(100, 149, 237, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 4,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20, // 마진을 추가하여 시간별 정보와 간격을 둠
  },
  locationText: {
    alignSelf: 'flex-start',
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'left',
    letterSpacing: -0.025,
    color: '#000000',
    marginBottom: 10,
  },
  weatherImage: {
    width: '40%',
    height: '30%',
    marginBottom: 20,
  },
  temp: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 48,
    color: 'black',
  },
  feeltemp: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 14,
    color: 'black',
    marginBottom: 50,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#DCEFFF',
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 25,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoTitle: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: -0.025,
    color: '#000000',
  },
  infoValue: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: -0.025,
    color: '#000000',
  },
  sunBox: {
    flex: 1,
    backgroundColor: '#DCEFFF',
    flexDirection: 'column',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  sunRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 3,
  },
  scrollView: {
    alignItems: "center",
    marginTop: '20%',
    paddingBottom: 20,
  },
  forecastContainer: {
    width: '95%',
    height: 200,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  forecastBox: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: 'rgba(100, 149, 237, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    marginLeft: 5,
  },  
  weatherImageSmall: {
    width: '90%',
    height: '30%',
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
    color: 'black',
    marginBottom: 5,
  },
  tempText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Pretendard',
    color: 'black',
  },
  humidityText: {
    marginTop: 5,
    fontSize: 12,
    color: '#97A0A7',
    fontFamily: 'Pretendard',
  },
  hourlytext: {
    alignSelf: 'flex-start',
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 17,
    textAlign: 'left',
    letterSpacing: -0.025,
    color: '#000000',
    marginLeft: 15,
    marginTop: 10,
  },
});

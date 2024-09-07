import React from 'react';
import { View, Text } from 'react-native';
// import fetchWeatherData from './fetchWeatherData'; // fetchWeatherData 함수를 불러옵니다.
import axios from 'axios';

export default function ReviewTest() {
  // 컴포넌트 로직
  React.useEffect(() => {
    fetchWeatherData(); // API 호출
  }, []);

const fetchWeatherData = async () => {
    try {
      const baseDate = '20240615'; // 예시 날짜
      const baseTime = '0600'; // 예시 시간
  
      const queryParams = new URLSearchParams({
        serviceKey: '3W4BK2eDONWtKaH70pj95q1iImYOVfiKH2WPNWReCXUr6nnVpl3mZ1qPDQYCo59goeDmxFElOsFfKfIbwuhLYQ==',
        numOfRows: '10',
        pageNo: '1',
        base_date: baseDate,
        base_time: baseTime,
        nx: '55',
        ny: '127'
      });
  
      const response = await axios.get(
        `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?${queryParams.toString()}`
      );
  
      // 성공적으로 데이터 수신
      console.log('API 호출 성공:', response.data);
    } catch (error) {
      // 에러 처리
      if (error.response) {
        console.error('API 호출 오류:', error.response.data);
      } else {
        console.error('API 호출 오류:', error.message);
      }
    }
  };
  

  return (
    <View>
      <Text>Test Component</Text>
    </View>
  );
}


// 함수 호출
// fetchWeatherData();
// export default ReviewTest;
/**
 * @format
 */

/* 기존
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
*/



import {AppRegistry} from 'react-native';
import App from './App';
import SignupHome from './scripts/SignupHome';
//import PathAndMap from './scripts/PathAndMap';
import testtest from './scripts/testtest';
//import FindRoute from './scripts/FindRoute';
import test2 from './scripts/test2'; //장소 카테고리 지도에 표시
import SignupTerm from './scripts/SignupTerm';
import SignupNickname from './scripts/SignupNickname';
import RestaurantHome from './scripts/RestaurantHome'; // 추천 맛집
import TourPlaceHome from './scripts/TourPlaceHome'; // 추천 여행지
import LoginPage from './scripts/LoginPage'; // 추천 여행지
import MainHome from './scripts/MainHome'; // 추천 여행지

import Detail from './scripts/Detail';

import Community from './screens/Community';
import Weather from './screens/Weather'
import WritePost from './screens/WritePost'


import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

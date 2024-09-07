import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { login, getProfile as getKakaoProfile, } from "@react-native-seoul/kakao-login";  // Kakao Login 모듈 임포트
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; //추가, db업로드

const SignUpHome = () => {
    const navigation = useNavigation();

    const signInWithKakao = async () => {
        try {
          const token = await login();
          console.log("로그인 성공:", JSON.stringify(token));

          // 사용자 정보 db에 전달
          const profile = await getKakaoProfile();
          const userId = profile.id;

            // 각 필드가 undefined가 아닌지 확인 후 기본 값 설정
            const name = profile.nickname || '';
            const email = profile.email || '';
            const profileImage = profile.profile_image_url || '';

            // 사용자 정보 db에 저장
            await firestore().collection('users').doc(userId.toString()).set({
                name: name,
                email: email,
                profileImage: profileImage
            }, { merge: true });

          navigation.navigate('SignupTerm');
        } catch (err) {
          console.error("카카오 로그인 에러", err);
        }
      };

  // 핸들러 함수 예제
  const handlePrivacyPolicyPress = () => {
    console.log('개인정보 처리방침 클릭됨');
    // 여기에 개인정보 처리방침 페이지로 네비게이션 추가
  };

  const handleTermsOfServicePress = () => {
    console.log('이용약관 클릭됨');
    // 여기에 이용약관 페이지로 네비게이션 추가
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content" // 상태 표시줄 내용물 색상 설정
      />

      <Image source={require('../image/signup/logo.png')} style={styles.logo} />

      <TouchableOpacity style={styles.kakaoButton} onPress={signInWithKakao}>
        <View style={styles.iconAndText}>
          <Image
            source={require('../image/signup/LoginWithKakao.png')}
            style={{ width: 100, height: 100, resizeMode: 'contain' }} // 여기서 크기 조정
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleButton}>
        <View style={styles.iconAndText}>
          <Image
            source={require('../image/signup/LoginWithGoogle.png')}
            style={{ width: 100, height: 100, resizeMode: 'contain' }} // 여기서 크기 조정
          />
        </View>
      </TouchableOpacity>

      <Text style={styles.agreementText}>
        로그인을 할 경우 아래의 내용을 동의하는 것으로 간주 됩니다.
      </Text>

      <View style={styles.termsWrapper}>
        <TouchableOpacity onPress={handlePrivacyPolicyPress}>
          <Text style={styles.termsText}>개인정보 처리방침</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleTermsOfServicePress}>
          <Text style={styles.termsText}>이용약관</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    position: 'absolute',
    width: 166,
    height: 83,
    left: 97,
    top: 183,
  },
  kakaoButton: {
    position: 'absolute',
    height: 48,
    left: 20,
    right: 20,
    bottom: 182,
    backgroundColor: '#F9E000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 84,
  },
  googleButton: {
    position: 'absolute',
    height: 48,
    left: 20,
    right: 20,
    bottom: 119,
    backgroundColor: '#E4E4E4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 84,
  },
  iconAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  kakaoIconWrapper: {
    width: 23.12,
    height: 23.12,
    position: 'relative',
  },
  ellipse: {
    position: 'absolute',
    width: 23.12,
    height: 18.84,
    left: 0,
    top: 0,
    backgroundColor: '#3B1C1C',
  },
  polygon: {
    position: 'absolute',
    width: 8.84,
    height: 7.71,
    left: 13.12,
    top: 23.12,
    backgroundColor: '#3B1C1C',
    borderRadius: 1,
    transform: [{ rotate: '180deg' }],
  },
  googleIconWrapper: {
    width: 23,
    height: 24,
    position: 'relative',
  },
  agreementText: {
    position: 'absolute',
    height: 22,
    left: 20,
    right: 23,
    bottom: 52,
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.025,
    color: '#97A0A7',
  },
  termsWrapper: {
    position: 'absolute',
    width: 173,
    height: 22,
    left: '50%',
    marginLeft: -86.5,
    bottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  termsText: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: -0.025,
    textDecorationLine: 'underline',
    color: '#97A0A7',
  },
  divider: {
    position: 'absolute',
    height: 0,
    left: '5.83%',
    right: '5.83%',
    bottom: 89,
    borderColor: '#97A0A7',
    borderBottomWidth: 1,
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SignUpHome;

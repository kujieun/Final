import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Image } from 'react-native';

const SignupScreen = () => {
  const [isAgreeAll, setIsAgreeAll] = useState(false);
  const [serviceTerms, setServiceTerms] = useState(false);
  const [ageConsent, setAgeConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);

  const areRequiredTermsAgreed = serviceTerms && ageConsent && privacyConsent;

  const updateAgreeAll = () => {
    const allChecked = areRequiredTermsAgreed && locationConsent;
    setIsAgreeAll(allChecked);
  };

  useEffect(() => {
    updateAgreeAll();
  }, [serviceTerms, ageConsent, privacyConsent, locationConsent]);

  const handleAgreeAll = () => {
    const newAgreeAll = !isAgreeAll;
    setIsAgreeAll(newAgreeAll);
    setServiceTerms(newAgreeAll);
    setAgeConsent(newAgreeAll);
    setPrivacyConsent(newAgreeAll);
    setLocationConsent(newAgreeAll);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => {/* 뒤로가기 기능 */}} style={styles.backButtonContainer}>
          <Image
            source={require('../image/signup/backbutton.png')}
            style={styles.backButton}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>이용약관</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressCircleContainer}>
          <View style={styles.circleFilledProgress}></View>
          <Text style={styles.activeText}>약관 동의</Text>
        </View>
        <View style={styles.progressLine}></View>
        <View style={styles.progressCircleContainer}>
          <View style={styles.circleEmptyProgress}></View>
          <Text style={styles.inactiveText}>정보입력</Text>
        </View>
      </View>

      <View style={styles.agreementBox}>
        <TouchableOpacity onPress={handleAgreeAll} style={styles.checkBoxContainer}>
          <View style={[styles.checkBox, isAgreeAll && styles.checkBoxChecked]}>
            {isAgreeAll && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        <Text style={styles.agreementText}>전체 동의합니다</Text>
      </View>

      <View style={styles.divider}></View>

      <AgreementDetailBox
        isChecked={ageConsent}
        onPress={() => setAgeConsent(!ageConsent)}
        text="[필수] 만 14세 이상입니다."
      />
      <AgreementDetailBox
        isChecked={serviceTerms}
        onPress={() => setServiceTerms(!serviceTerms)}
        text="[필수] 서비스 이용약관"
        onDetailPress={() => {/* 서비스 이용약관 상세 페이지 열기 */}}
      />
      <AgreementDetailBox
        isChecked={privacyConsent}
        onPress={() => setPrivacyConsent(!privacyConsent)}
        text="[필수] 개인정보 수집 및 이용 동의"
        onDetailPress={() => {/* 개인정보 수집 및 이용 동의 상세 페이지 열기 */}}
      />
      <AgreementDetailBox
        isChecked={locationConsent}
        onPress={() => setLocationConsent(!locationConsent)}
        text="[선택] 위치 서비스 이용 동의"
        optional
        onDetailPress={() => {/* 위치 서비스 이용 동의 상세 페이지 열기 */}}
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: areRequiredTermsAgreed ? '#6495ED' : '#B3B6BD' }]}
        disabled={!areRequiredTermsAgreed}
      >
        <Text style={styles.submitButtonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
};

const AgreementDetailBox = ({ isChecked, onPress, text, optional, onDetailPress }) => (
  <View style={styles.agreementDetailBox}>
    <TouchableOpacity onPress={onPress} style={styles.checkBoxContainer}>
      <View style={[styles.checkBox, isChecked && styles.checkBoxChecked]}>
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
    <Text style={[styles.detailText, optional && styles.optionalText]}>{text}</Text>
    {onDetailPress && (
      <TouchableOpacity onPress={onDetailPress} style={styles.detailButton}>
        <Image
          source={require('../image/signup/notionlink.png')} // 경로를 실제 경로로 변경하세요
          style={styles.detailButtonImage}
        />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingRight: 20,
    paddingLeft: 20,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
  },
  headerText: {
    top: 45,
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    color: '#111111',
    textAlign: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 95,
    justifyContent: 'center',
    position: 'relative',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  circleFilledProgress: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6495ED',
    zIndex: 2,
  },
  circleEmptyProgress: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#B3B6BD',
    zIndex: 2,
  },
  progressLine: {
    width: 56,
    height: 3,
    backgroundColor: '#B3B6BD',
    opacity: 0.5,
    position: 'absolute',
    top: 5,
    zIndex: -1,
  },
  activeText: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 12,
    color: '#6495ED',
    marginTop: 5,
  },
  inactiveText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 12,
    color: '#B3B6BD',
    marginTop: 5,
  },
  agreementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkBoxContainer: {
    width: 20,
    height: 20,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderColor: '#DDDEE0',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#6495ED',
  },
  checkmark: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  agreementText: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 16,
    color: '#111111',
    marginLeft: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#B3B6BD',
    marginTop: 20,
  },
  agreementDetailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  detailText: {
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 14,
    color: '#111111',
    marginLeft: 10,
    flex: 1, // 버튼이 우측에 배치되도록 유연성 부여
  },
  optionalText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 14,
    color: '#111111',
  },
  detailButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailButtonImage: {
    width: 20,
    height: 20,
  },
  submitButton: {
    position: 'absolute',
    height: 48,
    left: 20,
    right: 20,
    bottom: 25,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 121,
    paddingVertical: 2,
  },
  submitButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default SignupScreen;

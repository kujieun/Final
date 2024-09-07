import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Image, TextInput, Modal, Pressable } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const SignupScreen = () => {
  const [nickname, setNickname] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleDuplicateCheck = () => {
    setModalVisible(true);
    // TODO: Firebase에 닉네임 연결, 중복될 때의 알림창도 구현
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleNicknameChange = (text) => {
    const isValidNickname = /^[a-zA-Z0-9가-힣_ ]{2,}$/.test(text);
    setIsValid(isValidNickname);
    setNickname(text);
  };

  const handleProfileImagePick = () => {
    launchImageLibrary({}, (response) => {
      if (response.errorCode) {
        console.log(response.errorCode); // Handle error
      } else if (!response.didCancel) {
        setProfileImage(response.assets[0].uri); // Note the updated path
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => { /* 뒤로가기 기능 */ }} style={styles.backButtonContainer}>
          <Image source={require('../image/signup/backbutton.png')} style={styles.backButton} />
        </TouchableOpacity>
        <Text style={styles.headerText}>정보 입력</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressCircleContainer}>
          <View style={styles.circleEmptyProgress}></View>
          <Text style={styles.inactiveText}>약관 동의</Text>
        </View>
        <View style={styles.progressLine}></View>
        <View style={styles.progressCircleContainer}>
          <View style={styles.circleFilledProgress}></View>
          <Text style={styles.activeText}>정보입력</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.ellipse102} onPress={handleProfileImagePick}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Image source={require('../image/signup/default_profile.png')} style={styles.profileImage} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.group219} onPress={handleProfileImagePick}>
        <Image source={require('../image/signup/camera.png')} style={styles.cameraIcon} />
      </TouchableOpacity>

      <Text style={styles.nicknameTitle}>닉네임</Text>
      <TextInput
        style={[styles.placeholder, !isValid && styles.invalidInput]}
        value={nickname}
        onChangeText={handleNicknameChange}
        placeholder="닉네임을 입력하세요"
        placeholderTextColor="#B3B6BD"
      />
      <Text style={styles.minText}>최소 2글자 이상 사용 가능</Text>
      <Text style={styles.infoText}>한글/영어/숫자/밑줄/ 띄어쓰기를 사용 할 수 있습니다.</Text>

      <View style={styles.line64} />

      <TouchableOpacity style={styles.frame340} onPress={handleDuplicateCheck}>
        <Text style={styles.nameCheckText}>중복확인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.submitButton, { backgroundColor: '#B3B6BD' }]}>
        <Text style={styles.submitButtonText}>다음</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="fade" onRequestClose={handleModalClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>사용 가능한 닉네임입니다!</Text>
            <Pressable style={styles.modalButton} onPress={handleModalClose}>
              <Text style={styles.modalButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  submitButton: {
    position: 'absolute',
    height: 48,
    left: 20,
    right: 20,
    bottom: 25,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // 회색 원
  ellipse102: {
    position: 'absolute',
    width: 102,
    height: 102,
    left: '50%',
    marginLeft: -51,
    top: 161,
    backgroundColor: '#B3B6BD',
    borderRadius: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 102,
    height: 102,
    borderRadius: 51,
  },
  // 카메라 아이콘
  group219: {
    position: 'absolute',
    width: 38,
    height: 38,
    left: 201,
    top: 229,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 38,
    height: 38,
  },
  nicknameTitle: {
    position: 'absolute',
    left: 22,
    top: 292,
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 14,
    color: '#97A0A7',
  },
  placeholder: {
    position: 'absolute',
    left: 17,
    top: 305,
    fontFamily: 'Pretendard',
    fontWeight: '600',
    fontSize: 14,
    color: '#B3B6BD',
  },
  minText: {
    position: 'absolute',
    left: 21,
    top: 353,
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 10,
    color: '#6495ED',
  },
  infoText: {
    position: 'absolute',
    left: 20,
    top: 371,
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 10,
    color: '#6495ED',
  },
  // 파란색 선
  line64: {
    position: 'absolute',
    height: 1.5,
    left: '5.83%',
    right: '5.28%',
    top: 348,
    borderColor: '#6495ED',
    borderWidth: 1.5,
  },
  // 중복확인 버튼
  frame340: {
    position: 'absolute',
    width: 65,
    height: 26,
    right: 19,
    top: 318,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#DDDEE0',
    borderWidth: 1,
    borderRadius: 12,
  },
  nameCheckText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 12,
    color: '#6495ED',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 280,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 14,
    color: '#111111',
    marginBottom: 20,
  },
  modalButton: {
    width: 260,
    height: 34,
    backgroundColor: '#6495ED',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6495ED',
  },
  modalButtonText: {
    fontFamily: 'Pretendard',
    fontWeight: '400',
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default SignupScreen;

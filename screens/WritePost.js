import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Modal, ScrollView} from 'react-native';
import firestore from '@react-native-firebase/firestore';
// import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const CommunityPost = () => {
    // const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const postsCollection = firestore().collection('community');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectMenu, setSelectMenu] = useState('최신 게시물');
  const [tabVisible, setTabVisible] = useState(false);
  // 태그 관리
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState(['맛집', '카페', '바닷가', '인생샷', '회']);
  const [inputTag, setInputTag] = useState('');
  // 사진 관리
  const [images, setImages] = useState([]);
  const [uploadedImageURLs, setUploadedImageURLs] = useState([]);

  // 현재 로그인한 사용자의 ID 가져오기
  const user = auth().currentUser;



  // 태그 함수들
  const addTag = (tag) => {
    if (selectedTags.length < 5 && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleInputChange = (text) => {
    setInputTag(text);
  };

  const handleInputSubmit = () => {
    if (inputTag && !selectedTags.includes(inputTag) && selectedTags.length < 5) {
      setSelectedTags([...selectedTags, inputTag]);
      setInputTag('');
    }
  };


  //사진 추가 + storage 업로드
  const pickImages = async () => {
    try {
      const selectedImages = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
      });

       //storage
       const imageArray = selectedImages.map(image => ({
        uri: image.path,
        name: `image_${Date.now()}.jpg`,
        type: image.mime || 'image/jpeg',
      }));

      //storage
      const uploadPromises = imageArray.map(async (image) => {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const reference = storage().ref(`/communityImages/${image.name}`);
        await reference.put(blob);
        const downloadURL = await reference.getDownloadURL();
        return { uri: image.uri, downloadURL };
      });

      const newUploadedImages = await Promise.all(uploadPromises);

      setUploadedImageURLs([...uploadedImageURLs, ...newUploadedImages.map(image => image.downloadURL)]);

      setImages([...images, ...newUploadedImages.map(image => ({ path: image.uri }))]);


      //새로운 이미지 선택 시 기존 이미지에 병합
      // setImages([...images, ...selectedImages]);

    } catch (error) {
      console.log('Image picking error: ', error);
    }
  };


 //사진 삭제
  const handleRemoveImage = async (indexToRemove) => {
    try {
      const imageToRemove = images[indexToRemove];
      const downloadURLToRemove = uploadedImageURLs[indexToRemove];

      // Storage에서 이미지 삭제
      const storageRef = storage().refFromURL(downloadURLToRemove);
      await storageRef.delete();

      // 상태에서 이미지와 URL 제거
      setImages(images.filter((_, index) => index !== indexToRemove));
      setUploadedImageURLs(uploadedImageURLs.filter((_, index) => index !== indexToRemove));
    } catch (error) {
      console.log('Image removal error: ', error);
    }
  };


  const addPost = async () => {
    try {
      await postsCollection.add({
        menu: selectMenu,
        content: content,
        createdAt: firestore.FieldValue.serverTimestamp(),
        tags: selectedTags,
        images: uploadedImageURLs,
        userEmail: user.email // 추가: 사용자 이메일
      });

      setSelectMenu('최신 게시물');
      setContent('');
      setSelectedTags([]);
      setImages([]); 
      // console.log('Post Created Successfully!');
    } catch (error) {
      console.log(error.message);
    }
  };


  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.postTitle}>게시물 작성</Text>
        <TouchableOpacity style={styles.iconContainer}>
            <Image source={require('../img/Back.png')} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.divider}></View>

      <View style={styles.selectLayout}>
            <Text style={styles.PostsText}>{selectMenu}</Text>
            <TouchableOpacity style={styles.selectContainer}
                onPress={() => setModalVisible(true)}>
                <Image source={require('../img/Select.png')} />
            </TouchableOpacity>
        <View style={styles.selectDivider}></View>
      </View>
      
      
      <View style={styles.columnLayout}>
        <Text style={styles.PostsText}>내용</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 작성해주세요 (최소 10글자)"
          placeholderTextColor="#97A0A7"
          value={content}
          onChangeText={setContent}
          multiline={true}
          numberOfLines={4}
          textAlignVertical='top'
        />
      </View>
      
      <View style={styles.rowLayout2}>
        <Text style={styles.uploadText}>사진 등록(최대 5장)</Text>

          {/* 사진 추가 로직 */}
          <ScrollView
            style={{ marginTop: '5%' }}
            horizontal={true} // 가로 스크롤
            showsHorizontalScrollIndicator={false} // 스크롤바 숨김
            contentContainerStyle={{ alignItems: 'center' }} // 내용 중앙 정렬
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* 선택된 사진 */}
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image
                    key={index}
                    source={{ uri: image.path }}
                    style={{ width: 100, height: 100, marginRight: '5%', borderRadius: 10 }}
                  />
                  {/* 삭제 버튼 */}
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Image source={require('../img/ImgDelete.png')} style={styles.deleteButtonImage} />
                  </TouchableOpacity>
                </View>
                
              ))}

              {/* 사진 추가 버튼 */}
              <TouchableOpacity style={styles.uploadBox} onPress={pickImages}>
                <Image source={require('../img/AddImg.png')} />
              </TouchableOpacity>
            </View>
          </ScrollView>
          
      </View>
      
      <View style={styles.rowLayout4}>
      <Text style={styles.uploadText}>해시 태그(최대 5개)</Text>
      </View>

      {/* 선택된 태그들*/}
      <ScrollView 
        style={styles.selectedTagsDisplayContainer} 
        horizontal={true}  
        showsHorizontalScrollIndicator={false} 
      >
            {selectedTags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                <Image source={require('../img/Delete.png')} style={styles.removeTag}/>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.tagButton} onPress={() => setTabVisible(true)}>
              <Text style={styles.tagButtonText}>+ 태그 추가</Text>
            </TouchableOpacity>

    </ScrollView>

      
      <TouchableOpacity onPress={addPost} style={styles.footerContainer}>
        <Text style={styles.footerText}>완료</Text>
      </TouchableOpacity>
      


      {/* 태그 선택 모달 */}
      <Modal
        transparent={true}
        visible={tabVisible}
        animationType="slide"
        onRequestClose={() => setTabVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tagModalContainer}>
            <Text style={styles.tagSelectorTitle}>선택한 태그 (최대 5개)</Text>
            
            <View style={styles.selectedTagsContainer}>
              {/* 선택된 태그 */}
              {selectedTags.map((tag, index) => (
                <View key={index} style={styles.modaltag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Image source={require('../img/Delete.png')} style={styles.removeTag}/>
                  </TouchableOpacity>
                </View>
              ))}

              {/* 라인 */}
              <View style={styles.bottomLine} />  
            </View>

            <View style={styles.availableTagsContainer}>
              {/* 선택할 수 있는 태그 */}
              {availableTags.map((tag, index) => (
                <TouchableOpacity key={index} style={styles.availableTag} onPress={() => addTag(tag)}>
                  <Text style={styles.availableTagText}>#{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.tagSelectorTitle}>직접 입력하기</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="한글, 숫자, 영문만 입력 가능(최대 10글자)"
                placeholderTextColor="#646C79"
                value={inputTag}
                onChangeText={handleInputChange}
                maxLength={10}
                onSubmitEditing={handleInputSubmit}
              />
            </View>

            {/* 완료 버튼*/}
            <TouchableOpacity
              onPress={() => {
                setTabVisible(false); 
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>





      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity onPress={() => { setSelectMenu('최신 게시물'); setModalVisible(false); }}>
                  <Text style={styles.modalOption}>최신 게시물</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setSelectMenu('질문 게시물'); setModalVisible(false); }}>
                  <Text style={styles.modalOption}>질문 게시물</Text>
              </TouchableOpacity>
            </View>
        </View>
        </Modal>


    </View>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    height: 79,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postTitle: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.5,
    color: '#111111',
  },
  iconContainer: {
    position: 'absolute',
    left: 10,
    top: 35,
    width: 39.51,
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  selectContainer: {
    position: 'absolute',
    right: 10,
    top: 20,
    width: 39.51,
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    height: 2,
    backgroundColor: '#6495ED',
  },
  selectDivider: {
    height: 2,
    backgroundColor: '#DCEFFF',
  },
  columnLayout: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  selectLayout: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
  },
  PostsText: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.5,
    color: '#111111',
    marginBottom: 10,
  },
  contentInput: {
    borderColor: '#6495ED',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    fontSize: 12,
    color: '#97A0A7',
    minHeight: 300,
  },
  rowLayout2: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  uploadBox: {
    height: 100,
    width: 100,
    backgroundColor: '#F0F1F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#97A0A7',
    fontSize: 14,
  },
  rowLayout4: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tagButton: {
    backgroundColor: '#F0F1F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 21,
    width: 120,
    height: '27%',
    marginRight: 30,
  },
  tagButtonText: {
    color: '#646C79',
    fontSize: 12,
  },
  footerContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderColor: '#DDDEE0',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#6495ED',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,  
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard',  
    fontSize: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOption: {
    fontSize: 14,
    marginVertical: 10,
    color: '#111',
  },
  tagModalContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  tagSelectorTitle: {
    fontFamily: 'Pretendard',
    fontStyle: 'normal',
    fontWeight: 'medium',
    fontSize: 14,
    // lineHeight: 20,
    letterSpacing: -0.5,
    color: '#646C79',
    marginBottom: 10,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    height: 'auto', 
    justifyContent: 'flex-start', 
},
  bottomLine: {
    height: 1, 
    backgroundColor: '#DCEFFF', 
    width: '113%', 
    position: 'absolute',
    bottom: '-15%', 
    marginHorizontal: '-6.5%',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3, 
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#DCEFFF',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    alignItems: 'center',
    height: '25%',
  },
  modaltag: {
    flexDirection: 'row',
    backgroundColor: '#DCEFFF',
    borderRadius: 12,
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    marginRight: 10,
    marginBottom: 10, 
    alignItems: 'center',
    flexGrow: 0, 
    flexShrink: 1, 
},
  tagText: {
    color: '#6495ED',
    fontSize: 12,
    marginRight: 4,
  },
  removeTag: {
    top: 3,
    width: 15,
    height: 15,
  },
  availableTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginTop: 20,
  },
  availableTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 4, 
    paddingHorizontal: 8, 
    marginRight: 10,
    marginBottom: 8, 
    alignItems: 'center',
    flexGrow: 0, 
    flexShrink: 1, 
  },
  availableTagText: {
    fontFamily: 'Pretendard',
    fontSize: 12,
    color: '#646C79',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F1F2',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 10,
    fontFamily: 'Pretendard',
  },
  selectedTagsScrollContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectedTagsDisplayContainer: {
    flexDirection: 'row',  // 태그들을 가로로 나열
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: 10,
  },
  deleteButton: {
    position: 'absolute',
    // top: -10,
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonImage: {
    width: '100%',
    height: '100%',
  },



});

export default CommunityPost;

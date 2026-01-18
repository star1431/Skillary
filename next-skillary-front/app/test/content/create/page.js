'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCategories, createContent, getContent, updateContent } from '../../../api/contents';
import { uploadImage, uploadVideo } from '../../../api/files';

const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL || 'http://localhost:8080/api';

export default function ContentCreateTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const contentId = searchParams.get('contentId');
  const thumbnailInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'EXERCISE',
    type: 'free', // free, paid
    paymentType: 'subscription', // subscription, one-time
    selectedPlanId: '', // 구독 플랜 ID
    price: '', // 단건 결제 가격 (포맷 없이 숫자만)
    thumbnail: null,
    thumbnailUrl: '',
    body: '',
    files: []
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [requestDto, setRequestDto] = useState(null);

  // 카테고리 목록 로드
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('카테고리 로드 실패:', err);
      }
    }
    loadCategories();
  }, []);

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    async function loadContent() {
      if (isEditMode && contentId) {
        try {
          setLoading(true);
          const content = await getContent(contentId);
          // price가 null/undefined가 아니거나 planId가 있으면 유료
          const isPaid = (content.price != null && content.price !== 0) || content.planId != null;
          const type = isPaid ? 'paid' : 'free';
          // 유료일 때만 paymentType 판단, 무료면 기본값 유지
          const paymentType = isPaid 
            ? (content.planId ? 'subscription' : 'one-time')
            : 'subscription'; // 기본값
          
          // price가 숫자일 수도 있고 문자열일 수도 있음
          const priceValue = content.price != null ? String(content.price) : '';
          
          // postFiles URL 배열을 표시용 파일 정보로 변환
          const existingFiles = (content.post?.postFiles || []).map((fileUrl) => {
            // URL에서 파일명 추출
            try {
              const url = new URL(fileUrl);
              const pathParts = url.pathname.split('/');
              const fileName = pathParts[pathParts.length - 1] || '파일';
              // 확장자로 타입 판단
              const extension = fileName.split('.').pop()?.toLowerCase() || '';
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
              const type = isImage ? `image/${extension === 'jpg' ? 'jpeg' : extension}` : `video/${extension === 'mp4' ? 'mp4' : extension}`;
              
              return {
                name: fileName,
                url: fileUrl,
                size: 0, // URL에서는 크기를 알 수 없음
                type: type
              };
            } catch {
              // URL 파싱 실패 시 기본값
              return {
                name: '파일',
                url: fileUrl,
                size: 0,
                type: 'application/octet-stream'
              };
            }
          });
          
          setFormData({
            title: content.title || '',
            description: content.description || '',
            category: content.category || 'EXERCISE',
            type: type,
            paymentType: paymentType,
            selectedPlanId: content.planId ? String(content.planId) : '',
            price: priceValue,
            thumbnail: null,
            thumbnailUrl: content.thumbnailUrl || '',
            body: content.post?.body || '',
            files: existingFiles
          });
        } catch (err) {
          console.error('콘텐츠 로드 실패:', err);
        } finally {
          setLoading(false);
        }
      }
    }
    loadContent();
  }, [isEditMode, contentId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    // 각 파일을 data URL로 변환
    const filePromises = fileArray.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            file: file,
            name: file.name,
            type: file.type,
            size: file.size,
            url: e.target.result // data URL 저장
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    const filesWithDataUrl = await Promise.all(filePromises);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...filesWithDataUrl]
    }));
  };

  const handleThumbnailInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailUrl: ''
    }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.thumbnailUrl && !formData.thumbnail) {
      alert('썸네일을 업로드해주세요.');
      return;
    }
    
    if (!formData.body || formData.body.trim() === '') {
      alert('본문을 입력해주세요.');
      return;
    }

    // 유료 콘텐츠 검증
    if (formData.type === 'paid') {
      if (formData.paymentType === 'subscription' && !formData.selectedPlanId) {
        alert('구독 플랜을 선택해주세요.');
        return;
      }
      if (formData.paymentType === 'one-time' && !formData.price) {
        alert('가격을 입력해주세요.');
        return;
      }
    }

    try {
      setLoading(true);
      setResult(null);
      setRequestDto(null);
      
      // 썸네일 업로드 (새 파일이 있고 data URL일 때만)
      let thumbnailUrl = formData.thumbnailUrl;
      if (formData.thumbnail && thumbnailUrl.startsWith('data:')) {
        thumbnailUrl = await uploadImage(formData.thumbnail);
      }

      // 파일 업로드 처리 (기존 URL 유지 또는 새 파일 업로드)
      const postFiles = [];
      for (const file of formData.files) {
        if (file.url && !file.url.startsWith('data:')) {
          // 기존 파일 (HTTP URL)
          postFiles.push(file.url);
        } else if (file.file instanceof File) {
          // 새로운 파일 업로드 (file 객체에 File이 저장되어 있음)
          if (file.file.type.startsWith('image/')) {
            const imageUrl = await uploadImage(file.file);
            postFiles.push(imageUrl);
          } else if (file.file.type.startsWith('video/')) {
            const videoUrl = await uploadVideo(file.file);
            postFiles.push(videoUrl);
          }
        }
      }

      // 유료 콘텐츠인 경우 planId 또는 price 설정
      let planId = null;
      let price = null;
      
      if (formData.type === 'paid') {
        if (formData.paymentType === 'subscription') {
          planId = parseInt(formData.selectedPlanId);
          price = null;
        } else {
          price = parseInt(formData.price);
          planId = null;
        }
      }

      // 요청 DTO 생성 
      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        planId: planId,
        price: price,
        thumbnailUrl: thumbnailUrl,
        post: {
          body: formData.body,
          postFiles: postFiles
        }
      };

      setRequestDto(requestData);

      // API 호출
      if (isEditMode && contentId) {
        const updatedContent = await updateContent(contentId, requestData);
        setResult(updatedContent);
        alert('콘텐츠가 수정되었습니다!');
      } else {
        const createdContent = await createContent(requestData);
        setResult(createdContent);
        
        // 성공 후 폼 초기화 (생성 모드일 때만)
        setFormData({
          title: '',
          description: '',
          category: 'EXERCISE',
          type: 'free',
          paymentType: 'subscription',
          selectedPlanId: '',
          price: '',
          thumbnail: null,
          thumbnailUrl: '',
          body: '',
          files: []
        });
        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';

        alert('콘텐츠가 생성되었습니다!');
      }
    } catch (err) {
      console.error('콘텐츠 생성 실패:', err);
      alert('콘텐츠 생성에 실패했습니다: ' + (err.message || '알 수 없는 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  // 생성 DTO 정보 
  const getFormDataDto = () => {
    // 유료 콘텐츠인 경우 planId 또는 price 설정
    let planId = null;
    let price = null;
    
    if (formData.type === 'paid') {
      if (formData.paymentType === 'subscription') {
        planId = formData.selectedPlanId ? parseInt(formData.selectedPlanId) : null;
        price = null;
      } else {
        price = formData.price ? parseInt(formData.price) : null;
        planId = null;
      }
    }

    // postFiles: formData.files에서 파일 정보 추출 (data URL 형태로 표시)
    const postFiles = formData.files.map(file => {
      // file.url이 있으면 data URL 또는 기존 URL 반환
      return file.url || '';
    });
    return {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      planId: planId,
      price: price,
      thumbnailUrl: formData.thumbnailUrl || null,
      post: {
        body: formData.body,
        postFiles: postFiles
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/test/content')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            목록으로 돌아가기
          </button>
        </div>

        {/* 생성 DTO 정보 (실시간 표시) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">입력 데이터 (JSON)</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs max-h-96">
            {JSON.stringify(getFormDataDto(), null, 2)}
          </pre>
        </div>

        {/* 요청 DTO 정보 (제출 후 표시) */}
        {requestDto && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">요청 DTO (JSON)</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(requestDto, null, 2)}
            </pre>
          </div>
        )}

        {/* 응답 결과 (제출 후 표시) */}
        {result && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">응답 결과 (JSON)</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* 폼 */}
        <div className="bg-white border border-gray-300 p-4">
          <h2 className="text-lg font-semibold mb-4">{isEditMode ? '콘텐츠 수정' : '콘텐츠 생성'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2열 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300"
                  placeholder="제목"
                />
              </div>

              {/* 소개 */}
              <div>
                <label htmlFor="description" className="block text-sm mb-1">
                  소개 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300"
                  placeholder="소개"
                />
              </div>

              {/* 썸네일 */}
              <div>
                <label className="block text-sm mb-1">
                  썸네일 <span className="text-red-500">*</span>
                </label>
                {formData.thumbnailUrl ? (
                  <div className="relative">
                    <img
                      src={formData.thumbnailUrl}
                      alt="썸네일"
                      className="w-full h-32 object-cover border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailInputChange}
                    required
                    className="w-full px-2 py-1 border border-gray-300 text-sm"
                  />
                )}
              </div>

              {/* 카테고리 */}
              <div>
                <label htmlFor="category" className="block text-sm mb-1">
                  카테고리 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300"
                >
                  {categories.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 콘텐츠 유형 */}
              <div>
                <label className="block text-sm mb-1">
                  콘텐츠 유형 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-1 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="type"
                      value="free"
                      checked={formData.type === 'free'}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className="w-4 h-4 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm">무료</span>
                  </label>
                  <label className={`flex items-center gap-1 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="type"
                      value="paid"
                      checked={formData.type === 'paid'}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className="w-4 h-4 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm">유료</span>
                  </label>
                </div>
              </div>

              {/* 결제 유형 (유료일 경우만) */}
              {formData.type === 'paid' && (
                <div>
                  <label className="block text-sm mb-1">
                    결제 유형 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className={`flex items-center gap-1 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="subscription"
                        checked={formData.paymentType === 'subscription'}
                        onChange={handleInputChange}
                        disabled={isEditMode}
                        className="w-4 h-4 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm">구독</span>
                    </label>
                    <label className={`flex items-center gap-1 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="one-time"
                        checked={formData.paymentType === 'one-time'}
                        onChange={handleInputChange}
                        disabled={isEditMode}
                        className="w-4 h-4 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm">단건</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 구독 플랜 (구독 선택 시) */}
              {formData.type === 'paid' && formData.paymentType === 'subscription' && (
                <div>
                  <label htmlFor="selectedPlanId" className="block text-sm mb-1">
                    구독 플랜 ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="selectedPlanId"
                    name="selectedPlanId"
                    value={formData.selectedPlanId}
                    onChange={handleInputChange}
                    required
                    disabled={isEditMode}
                    placeholder="플랜 ID"
                    className="w-full px-2 py-1 border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* 가격 (단건 결제 선택 시) */}
              {formData.type === 'paid' && formData.paymentType === 'one-time' && (
                <div>
                  <label htmlFor="price" className="block text-sm mb-1">
                    가격 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    disabled={isEditMode}
                    placeholder="가격"
                    className="w-full px-2 py-1 border border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {/* 파일첨부 (전체 너비) */}
            <div>
              <label className="block text-sm mb-1">
                파일첨부
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInputChange}
                className="w-full px-2 py-1 border border-gray-300 text-sm"
              />
              {formData.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-1">
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 본문 (전체 너비) */}
            <div>
              <label htmlFor="body" className="block text-sm mb-1">
                본문 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-2 py-1 border border-gray-300 resize-none"
                placeholder="본문"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (isEditMode ? '수정 중...' : '생성 중...') : (isEditMode ? '수정' : '생성')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

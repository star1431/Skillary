'use client';

import { useState, use, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { creators } from '../../components/data';
import { popularContents } from '../../../components/popularContentsData';
import { createContent, updateContent, getContent, getCategories } from '../../../api/contents';
import { uploadImage, uploadVideo } from '../../../api/files';

export default function CreateContentPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const contentId = searchParams.get('contentId');
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '', // 콘텐츠 소개란
    category: 'EXERCISE', // 카테고리
    type: 'free', // free, paid
    paymentType: 'subscription', // subscription, one-time
    selectedPlanId: '', // 구독 플랜 ID
    price: '', // 단건 결제 가격
    thumbnail: null, // 썸네일 이미지
    thumbnailUrl: '', // 썸네일 dataUrl
    body: '', // 본문 (textarea)
    files: []
  });
  const [categories, setCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const creator = creators.find(item => item.id === parseInt(id));
  const content = contentId ? popularContents.find(item => item.id === parseInt(contentId)) : null;

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
          const formattedPrice = priceValue ? priceValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
          
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
            price: formattedPrice,
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

  // 가격 포맷팅
  const formatPriceWithComma = (value) => {
    const numbers = value.replace(/[^0-9]/g, '');
    return numbers ? parseInt(numbers).toLocaleString('ko-KR') : '';
  };

  // 가격 파싱
  const parsePrice = (value) => {
    return value.replace(/[^0-9]/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData(prev => ({
        ...prev,
        [name]: formatPriceWithComma(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 파일을 base64 data URL로 변환
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 공통 드래그 앤 드롭 핸들러
  const createDragHandlers = (setIsDraggingState) => ({
    onDragOver: (e) => {
      e.preventDefault();
      setIsDraggingState(true);
    },
    onDragLeave: (e) => {
      e.preventDefault();
      setIsDraggingState(false);
    }
  });

  // 파일 선택 핸들러
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...fileArray]
    }));
  };

  // 썸네일 선택 핸들러
  const handleThumbnailSelect = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    setFormData(prev => ({
      ...prev,
      thumbnail: file,
      thumbnailUrl: dataUrl
    }));
  };

  // 파일 드래그 앤 드롭
  const fileDragHandlers = createDragHandlers(setIsDragging);
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileSelect(files);
  };

  // 썸네일 드래그 앤 드롭
  const thumbnailDragHandlers = createDragHandlers(setIsThumbnailDragging);
  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    setIsThumbnailDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleThumbnailSelect(file);
  };

  // 파일 입력 변경
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) handleFileSelect(files);
  };

  // 썸네일 입력 변경
  const handleThumbnailInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleThumbnailSelect(file);
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

  // 파일 업로드 처리 (기존 URL 유지 또는 새 파일 업로드)
  const processFileUploads = async () => {
    const postFiles = [];
    for (const file of formData.files) {
      if (file.url) {
        postFiles.push(file.url); // 기존 파일 (URL)
      } else if (file instanceof File) {
        // 새로운 파일 업로드
        const fileUrl = file.type.startsWith('image/') 
          ? await uploadImage(file) 
          : await uploadVideo(file);
        postFiles.push(fileUrl);
      }
    }
    return postFiles;
  };

  // 요청 데이터 생성
  const buildRequestData = (thumbnailUrl, postFiles) => {
    const requestData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      thumbnailUrl: thumbnailUrl,
      post: {
        body: formData.body,
        postFiles: postFiles
      }
    };

    // 유료 콘텐츠인 경우 planId 또는 price 설정
    if (formData.type === 'paid') {
      if (formData.paymentType === 'subscription') {
        requestData.planId = parseInt(formData.selectedPlanId);
      } else {
        requestData.price = parseInt(parsePrice(formData.price));
      }
    }

    return requestData;
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
      
      // 썸네일 업로드 (새 파일이 있고 data URL일 때만)
      let thumbnailUrl = formData.thumbnailUrl;
      if (formData.thumbnail && thumbnailUrl.startsWith('data:')) {
        thumbnailUrl = await uploadImage(formData.thumbnail);
      }

      // 파일 업로드 처리
      const postFiles = await processFileUploads();

      // 요청 데이터 생성
      const requestData = buildRequestData(thumbnailUrl, postFiles);

      if (isEditMode && contentId) {
        await updateContent(contentId, requestData);
        router.push(`/contents/${contentId}`);
      } else {
        const createdContent = await createContent(requestData);
        const newContentId = createdContent.contentId || createdContent.id;
        router.push(`/contents/${newContentId}`);
      }
    } catch (err) {
      console.error('콘텐츠 저장 실패:', err);
      alert('콘텐츠 저장에 실패했습니다: ' + (err.message || '알 수 없는 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!creator ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black mb-4">크리에이터로 로그인해야 테스트 가능</h1>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <Link
              href={`/creators/${creator.id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold text-black mb-2">
            {isEditMode ? '콘텐츠 수정' : '콘텐츠 생성'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? '콘텐츠를 수정하세요' : '새로운 콘텐츠를 생성하세요'}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="콘텐츠 제목을 입력하세요"
            />
          </div>

          {/* 콘텐츠 소개란 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              콘텐츠 소개란 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="콘텐츠를 한 줄로 설명해주세요"
            />
          </div>

          {/* 썸네일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 <span className="text-red-500">*</span>
            </label>
            {formData.thumbnailUrl ? (
              <div className="relative">
                <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={formData.thumbnailUrl}
                    alt="썸네일 미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div
                {...thumbnailDragHandlers}
                onDrop={handleThumbnailDrop}
                onClick={() => thumbnailInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  isThumbnailDragging
                    ? 'border-black bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailInputChange}
                  className="hidden"
                />
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-600 mb-2">
                  썸네일 이미지를 드래그하여 놓거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-gray-500">
                  이미지 파일만 업로드할 수 있습니다
                </p>
              </div>
            )}
          </div>

          {/* 무료/유료 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              콘텐츠 유형 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name="type"
                  value="free"
                  checked={formData.type === 'free'}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  className="w-4 h-4 text-black focus:ring-black disabled:cursor-not-allowed"
                />
                <span className="text-gray-700">무료</span>
              </label>
              <label className={`flex items-center gap-2 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name="type"
                  value="paid"
                  checked={formData.type === 'paid'}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  className="w-4 h-4 text-black focus:ring-black disabled:cursor-not-allowed"
                />
                <span className="text-gray-700">유료</span>
              </label>
            </div>
          </div>

          {/* 유료일 경우 구독/단건 결제 선택 */}
          {formData.type === 'paid' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  결제 유형 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="subscription"
                      checked={formData.paymentType === 'subscription'}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className="w-4 h-4 text-black focus:ring-black disabled:cursor-not-allowed"
                    />
                    <span className="text-gray-700">구독</span>
                  </label>
                  <label className={`flex items-center gap-2 ${isEditMode ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="one-time"
                      checked={formData.paymentType === 'one-time'}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className="w-4 h-4 text-black focus:ring-black disabled:cursor-not-allowed"
                    />
                    <span className="text-gray-700">단건 결제</span>
                  </label>
                </div>
              </div>

              {/* 구독 선택 시 플랜 드롭다운 */}
              {formData.paymentType === 'subscription' && creator.subscriptionPlans && creator.subscriptionPlans.length > 0 && (
                <div>
                  <label htmlFor="selectedPlanId" className="block text-sm font-medium text-gray-700 mb-2">
                    구독 플랜 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="selectedPlanId"
                      name="selectedPlanId"
                      value={formData.selectedPlanId || ''}
                      onChange={handleInputChange}
                      required
                      disabled={isEditMode}
                      className={`w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        !formData.selectedPlanId ? 'text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      <option value="" disabled style={{ color: '#9CA3AF' }}>구독 플랜을 선택하세요</option>
                      {creator.subscriptionPlans.map((plan) => (
                        <option key={plan.id} value={plan.id} style={{ color: '#111827' }}>
                          {plan.name} - ₩{plan.price.toLocaleString()}/{plan.period}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* 단건 결제 선택 시 가격 입력 */}
              {formData.paymentType === 'one-time' && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    가격 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (!/[0-9]/.test(e.key) && 
                            !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                            !(e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))) {
                          e.preventDefault();
                        }
                      }}
                      required
                      disabled={isEditMode}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-right bg-white disabled:bg-gray-100 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="가격을 입력하세요"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      원
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 카테고리 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 파일 업로드 (드래그 앤 드롭) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              동영상/사진 <span className="text-red-500">*</span>
            </label>
            <div
              {...fileDragHandlers}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-black bg-gray-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-gray-600 mb-2">
                파일을 드래그하여 놓거나 클릭하여 선택하세요
              </p>
              <p className="text-sm text-gray-500">
                동영상 또는 사진 파일을 업로드할 수 있습니다
              </p>
            </div>

            {/* 업로드된 파일 목록 */}
            {formData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      {file.size > 0 && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                      {file.url && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          (기존 파일)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-4 text-red-500 hover:text-red-700 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 본문 */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              본문 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="콘텐츠에 대한 본문을 입력하세요"
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4 pt-4">
            <Link
              href={`/creators/${creator.id}`}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '저장 중...' : '제출'}
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
}

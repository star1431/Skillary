'use client';

import { useState, use, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { creators } from '../../components/data';
import { popularContents } from '../../../components/popularContentsData';

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
    type: 'free', // free, paid
    paymentType: 'subscription', // subscription, one-time
    selectedPlanId: '', // 구독 플랜 ID
    price: '', // 단건 결제 가격
    thumbnail: null, // 썸네일 이미지
    description: '',
    files: []
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);

  const creator = creators.find(item => item.id === parseInt(id));
  const content = contentId ? popularContents.find(item => item.id === parseInt(contentId)) : null;

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEditMode && content) {
      const type = content.badge === '무료' ? 'free' : 'paid';
      const paymentType = content.badge === '구독자 전용' ? 'subscription' : 'one-time';
      const price = content.price ? content.price.replace(/[^0-9]/g, '') : '';

      setFormData({
        title: content.title || '',
        type: type,
        paymentType: paymentType,
        selectedPlanId: '', // TODO: 실제 플랜 ID 매핑 필요
        price: price,
        thumbnail: null, // TODO: 실제 썸네일 불러오기
        description: content.description || '',
        files: [] // TODO: 실제 파일 불러오기
      });
    }
  }, [isEditMode, content]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">크리에이터를 찾을 수 없습니다</h1>
          <Link href="/creators" className="text-blue-600 hover:underline">
            크리에이터 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...fileArray]
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const handleThumbnailSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        thumbnail: file
      }));
    }
  };

  const handleThumbnailDragOver = (e) => {
    e.preventDefault();
    setIsThumbnailDragging(true);
  };

  const handleThumbnailDragLeave = (e) => {
    e.preventDefault();
    setIsThumbnailDragging(false);
  };

  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    setIsThumbnailDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleThumbnailSelect(file);
    }
  };

  const handleThumbnailInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleThumbnailSelect(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: null
    }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      // TODO: 컨텐츠 수정 API 호출
      console.log('컨텐츠 수정 제출:', formData);
      // 성공 시 컨텐츠 상세 페이지로 이동
      if (contentId) {
        router.push(`/contents/${contentId}`);
      } else {
        router.push(`/creators/${creator.id}`);
      }
    } else {
      // TODO: 컨텐츠 생성 API 호출
      console.log('컨텐츠 생성 제출:', formData);
      // 성공 시 크리에이터 프로필 페이지로 이동
      router.push(`/creators/${creator.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            {isEditMode ? '컨텐츠 수정' : '컨텐츠 생성'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? '컨텐츠를 수정하세요' : '새로운 컨텐츠를 생성하세요'}
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
              placeholder="컨텐츠 제목을 입력하세요"
            />
          </div>

          {/* 썸네일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              썸네일 <span className="text-red-500">*</span>
            </label>
            {formData.thumbnail ? (
              <div className="relative">
                <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
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
                onDragOver={handleThumbnailDragOver}
                onDragLeave={handleThumbnailDragLeave}
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
              컨텐츠 유형 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="free"
                  checked={formData.type === 'free'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-black focus:ring-black"
                />
                <span className="text-gray-700">무료</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="paid"
                  checked={formData.type === 'paid'}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-black focus:ring-black"
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
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="subscription"
                      checked={formData.paymentType === 'subscription'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-black focus:ring-black"
                    />
                    <span className="text-gray-700">구독</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentType"
                      value="one-time"
                      checked={formData.paymentType === 'one-time'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-black focus:ring-black"
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
                  <select
                    id="selectedPlanId"
                    name="selectedPlanId"
                    value={formData.selectedPlanId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">플랜을 선택하세요</option>
                    {creator.subscriptionPlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₩{plan.price.toLocaleString()}/{plan.period}
                      </option>
                    ))}
                  </select>
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
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
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

          {/* 파일 업로드 (드래그 앤 드롭) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              동영상/사진 <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
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
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
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

          {/* 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="컨텐츠에 대한 설명을 입력하세요"
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
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

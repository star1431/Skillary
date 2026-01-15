'use client';

import { useState, use, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { creators } from '../../components/data';
import { createContent, updateContent, getContent, getCategories } from '../../../api/contents';
// import { getSubscriptionPlansByCreator } from '../../../api/contents'; // [TODO] 플랜 담당자가 API 작업 완료 후 사용
import { uploadImage } from '../../../api/files';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function CreateContentPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const contentId = searchParams.get('contentId');
  const thumbnailInputRef = useRef(null);
  const editorRef = useRef(null);
  const editorDivRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'EXERCISE',
    type: 'free',
    paymentType: 'subscription',
    selectedPlanId: '',
    price: '',
    thumbnail: null,
    thumbnailUrl: '',
    postBody: '',
    postFiles: [],
    pendingImages: []
  });
  
  const [categories, setCategories] = useState([]);
  // const [subscriptionPlans, setSubscriptionPlans] = useState([]); // [TODO] 플랜 담당자가 API 작업 완료 후 사용
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  // [TODO] 실제 인증 정보에서 creatorId를 가져와야 함 (현재는 URL 파라미터에서 가져옴)
  const [currentCreatorId] = useState(parseInt(id));

  const creator = creators.find(item => item.id === parseInt(id));

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

  // [TODO] 구독 플랜 목록 로드 - 플랜 담당자가 API 작업 완료 후 활성화
  // useEffect(() => {
  //   async function loadSubscriptionPlans() {
  //     try {
  //       const plans = await getSubscriptionPlansByCreator(currentCreatorId);
  //       setSubscriptionPlans(plans || []);
  //     } catch (err) {
  //       console.error('구독 플랜 로드 실패:', err);
  //       setSubscriptionPlans([]);
  //     }
  //   }
  //   loadSubscriptionPlans();
  // }, [currentCreatorId]);

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    async function loadContent() {
      if (isEditMode && contentId) {
        try {
          setLoading(true);
          const content = await getContent(contentId);
          const type = content.price || content.planId ? 'paid' : 'free';
          const paymentType = content.planId ? 'subscription' : 'one-time';
          
          setFormData({
            title: content.title || '',
            description: content.description || '',
            category: content.category || 'EXERCISE',
            type: type,
            paymentType: paymentType,
            selectedPlanId: content.planId ? content.planId.toString() : '',
            price: content.price ? content.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
            thumbnail: null,
            thumbnailUrl: content.thumbnailUrl || '',
            postBody: content.post?.body || '',
            postFiles: content.post?.postFiles || [],
            pendingImages: []
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

  // 파일 크기 검증
  const validateFileSize = (file, fileType) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`${fileType} 파일 크기는 10MB 이하여야 합니다.`);
      throw new Error(`${fileType} 파일 크기는 10MB 이하여야 합니다.`);
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

  const handleThumbnailSelect = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    
    validateFileSize(file, '썸네일 이미지');
    
    const dataUrl = await fileToDataUrl(file);
    setFormData(prev => ({
      ...prev,
      thumbnail: file,
      thumbnailUrl: dataUrl
    }));
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
      thumbnail: null,
      thumbnailUrl: ''
    }));
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (file) => {
    validateFileSize(file, '이미지');
    
    const dataUrl = await fileToDataUrl(file);
    setFormData(prev => ({
      ...prev,
      pendingImages: [...prev.pendingImages, { file, dataUrl }]
    }));
    
    return dataUrl;
  };

  // ToastUI Editor 초기화
  useEffect(() => {
    if (!editorDivRef.current || editorRef.current) return;

    editorRef.current = new Editor({
      el: editorDivRef.current,
      initialValue: formData.postBody || '',
      previewStyle: 'vertical',
      height: '600px',
      initialEditType: 'wysiwyg',
      hideModeSwitch: true,
      usageStatistics: false,
      toolbarItems: [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'image', 'link'],
        ['code', 'codeblock'],
      ],
      hooks: {
        addImageBlobHook: async (blob, callback) => {
          try {
            const file = new File([blob], `image-${Date.now()}.png`, { type: blob.type });
            const imageUrl = await handleImageUpload(file);
            callback(imageUrl, '이미지');
          } catch (error) {
            console.error('이미지 업로드 실패:', error);
            callback('', '이미지 업로드 실패');
          }
        },
      },
    });

    editorRef.current.on('change', () => {
      if (editorRef.current) {
        const markdown = editorRef.current.getMarkdown();
        handleEditorChange(markdown);
      }
    });

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // postBody 변경 시 에디터 업데이트
  useEffect(() => {
    if (editorRef.current && formData.postBody !== undefined) {
      const currentMarkdown = editorRef.current.getMarkdown();
      if (currentMarkdown !== formData.postBody) {
        editorRef.current.setMarkdown(formData.postBody);
      }
    }
  }, [formData.postBody]);

  // 에디터 변경 핸들러
  const handleEditorChange = (markdown) => {
    // 마크다운에서 이미지 URL 추출 (data URL 제외)
    const imageUrlRegex = /!\[.*?\]\((.*?)\)/g;
    const imageUrls = [];
    
    let match;
    while ((match = imageUrlRegex.exec(markdown)) !== null) {
      const url = match[1];
      if (url && !url.startsWith('data:')) {
        imageUrls.push(url);
      }
    }
    
    const updatedPostFiles = formData.postFiles.filter(url => 
      imageUrls.includes(url) || !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    const newMediaUrls = imageUrls.filter(url => !updatedPostFiles.includes(url));
    
    setFormData(prev => ({
      ...prev,
      postBody: markdown,
      postFiles: [...updatedPostFiles, ...newMediaUrls]
    }));
  };

  // 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.thumbnailUrl && !formData.thumbnail) {
      alert('썸네일을 업로드해주세요.');
      return;
    }
    
    if (!formData.postBody || formData.postBody.trim() === '') {
      alert('콘텐츠 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      
      // 썸네일 업로드
      let thumbnailUrl = formData.thumbnailUrl;
      if (formData.thumbnail && thumbnailUrl.startsWith('data:')) {
        thumbnailUrl = await uploadImage(formData.thumbnail);
      }

      // 에디터의 data URL을 실제 URL로 교체
      let finalPostBody = formData.postBody;
      const allPostFiles = [];

      // 대기 중인 이미지 업로드
      for (const { file, dataUrl } of formData.pendingImages) {
        if (finalPostBody.includes(dataUrl)) {
          const actualUrl = await uploadImage(file);
          allPostFiles.push(actualUrl);
          finalPostBody = finalPostBody.replace(
            new RegExp(dataUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
            actualUrl
          );
        }
      }

      // 이미 업로드된 URL들도 추가
      const imageUrlRegex = /!\[.*?\]\((.*?)\)/g;
      const existingImageUrls = [];
      
      let match;
      while ((match = imageUrlRegex.exec(finalPostBody)) !== null) {
        const url = match[1];
        if (url && !url.startsWith('data:') && !url.startsWith('blob:')) {
          existingImageUrls.push(url);
        }
      }
      
      const allMediaUrls = [...new Set([...allPostFiles, ...existingImageUrls])];

      const requestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        thumbnailUrl: thumbnailUrl,
        post: {
          body: finalPostBody,
          postFiles: allMediaUrls
        }
      };

      // 유료 콘텐츠인 경우
      if (formData.type === 'paid') {
        if (formData.paymentType === 'subscription') {
          requestData.planId = parseInt(formData.selectedPlanId);
        } else {
          requestData.price = parseInt(parsePrice(formData.price));
        }
      }

      // [TODO] currentCreatorId를 실제 인증 정보에서 가져와야 함
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* 콘텐츠 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              콘텐츠 유형 <span className="text-red-500">*</span>
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
              {/* [TODO] 플랜 담당자가 API 작업 완료 후 subscriptionPlans 사용 */}
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
                      className={`w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white ${
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
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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

          {/* 콘텐츠 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              콘텐츠 내용 <span className="text-red-500">*</span>
            </label>
            
            <div className="toastui-editor-wrapper">
              <div ref={editorDivRef} />
            </div>
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
    </div>
  );
}

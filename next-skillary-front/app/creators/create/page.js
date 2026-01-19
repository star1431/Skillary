'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiCreateCreator, apiGetMe, apiUpdateUserMe, uploadProfileImage } from '../../api/my-page';

/**
 * 크리에이터 생성 페이지
 *
 * 정책(= test 페이지와 동일한 동기화 룰)
 * - creator.displayName 은 user.nickname 과 동기화
 * - creator.profile 은 user.profile 과 동기화
 *
 * 백엔드 CreateCreatorRequest는 nickname을 받지 않아서,
 * 1) 먼저 /users/me 로 nickname/profile 업데이트
 * 2) 그 다음 /creators 로 introduction/bank/account/profile 생성
 *
 * 선택값(Nullable)
 * - introduction/bankName/accountNumber는 빈 값이면 null로 전송
 * - profile은 "새 이미지 업로드" 또는 "기존 user.profile"을 사용
 */
export default function CreateCreatorPage() {
  const router = useRouter();
  const thumbnailInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bio: '',
    bankName: '',
    accountNumber: '',
    thumbnail: null
  });
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meProfileUrl, setMeProfileUrl] = useState('');

  // 생성 페이지 진입 시 user 정보로 기본값 채움(닉네임/프로필)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await apiGetMe();
        if (!alive) return;
        setFormData((prev) => ({
          ...prev,
          // 사용자가 이미 입력을 시작했을 수도 있으니, 비어있을 때만 채움
          name: prev.name || me?.nickname || '',
        }));
        setMeProfileUrl(me?.profile || '');
      } catch {
        // 비로그인/토큰없음 등은 여기서 막지 않고 기존 플로우 유지
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 공백 문자열 -> null 로 정규화(백엔드 nullable 필드 대응)
  const asNullable = (v) => (String(v ?? '').trim() ? String(v).trim() : null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // 1) 프로필 이미지 결정
      // - 새 이미지를 선택했으면 업로드 URL 사용
      // - 아니면 기존 유저 프로필 URL을 그대로 사용
      let profileUrl = null;
      if (formData.thumbnail) {
        profileUrl = await uploadProfileImage(formData.thumbnail);
      } else if (meProfileUrl) {
        // 새로 업로드하지 않으면 기존 user.profile 사용
        profileUrl = meProfileUrl;
      }

      // 2) 유저 업데이트(동기화 대상)
      // - 백엔드 CreateCreatorRequest에는 nickname이 없어서, 유저 수정 API를 먼저 호출
      await apiUpdateUserMe({
        nickname: formData.name,
        profile: profileUrl, // null이면 변경 안 함
      });

      // 3) 크리에이터 생성(선택 필드들은 null 허용)
      await apiCreateCreator({
        introduction: asNullable(formData.bio),
        profile: profileUrl,
        bankName: asNullable(formData.bankName),
        accountNumber: asNullable(formData.accountNumber),
      });

      router.push('/auth/my-page');
    } catch (err) {
      alert(err?.message || '크리에이터 생성에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <Link
            href="/auth/my-page"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로 가기
          </Link>
          <h1 className="text-3xl font-bold text-black mb-2">크리에이터 생성</h1>
          <p className="text-gray-600">새로운 크리에이터 프로필을 생성하세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* 크리에이터 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              크리에이터 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="크리에이터 이름을 입력하세요"
            />
          </div>

          {/* 썸네일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로필 이미지
            </label>
            {formData.thumbnail ? (
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="프로필 미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveThumbnail}
                  className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : meProfileUrl ? (
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={meProfileUrl}
                    alt="현재 프로필"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
                  >
                    이미지 변경
                  </button>
                  <p className="text-xs text-gray-500 mt-2">현재 유저 프로필 이미지를 사용 중입니다</p>
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailInputChange}
                  className="hidden"
                />
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
                  프로필 이미지를 드래그하여 놓거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-gray-500">
                  이미지 파일만 업로드할 수 있습니다
                </p>
              </div>
            )}
          </div>

          {/* 상세 소개 */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              상세 소개
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="크리에이터에 대한 상세한 소개를 입력하세요"
            />
          </div>

          {/* 정산 정보(은행/계좌) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                은행명
              </label>
              <input
                type="text"
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="예) KB국민은행"
              />
            </div>

            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                계좌번호
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="예) 123-456-789012"
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/auth/my-page"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-60"
            >
              생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

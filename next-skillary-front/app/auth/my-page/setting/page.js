'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  apiGetMe,
  apiGetMyCreator,
  apiUpdateCreatorMe,
  apiUpdateUserMe,
  hasCreatorRole,
  uploadProfileImage,
} from '../../../api/my-page';

/**
 * 프로필 설정(수정 전용)
 *
 * 정책(= test 페이지와 동일)
 * - 크리에이터가 없으면: PUT /users/me (nickname/profile)
 * - 크리에이터가 있으면: PUT /creators/me (nickname/profile + introduction/bank/account)
 *   - 백엔드에서 user.nickname == creator.displayName, user.profile == creator.profile 로 동기화됨
 * - profile은 "변경했을 때만" 전송(= profileTouched)
 * - profile은 URL 형태(이미지 업로드는 /files/image로 선행 업로드)
 */
export default function ProfileSettingPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [me, setMe] = useState(null);
  const [myCreator, setMyCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  // NOTE: 기존 UI는 유지하되,
  // - formData.name === nickname
  // - formData.email은 표시 전용(disabled)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    introduction: '',
    bankName: '',
    accountNumber: '',
  });

  // profile은 "변경했을 때만" 서버로 보냄
  // - profileTouched=false 이면 profile=null로 보내서 "변경 안 함"
  // - profileTouched=true 인데 profilePreview='' 이면 제거(빈문자열)로 보냄
  const [profileTouched, setProfileTouched] = useState(false);
  const [profilePreview, setProfilePreview] = useState(''); // 미리보기용 (url)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError('');

        // 1) 유저 정보 조회
        const nextMe = await apiGetMe();
        if (!alive) return;
        setMe(nextMe);
        setFormData((prev) => ({
          ...prev,
          name: nextMe?.nickname ?? '',
          email: nextMe?.email ?? '',
        }));
        setProfilePreview(nextMe?.profile ?? '');

        // 2) ROLE_CREATOR이면 크리에이터 정보도 조회
        if (hasCreatorRole(nextMe?.roles)) {
          try {
            const nextCreator = await apiGetMyCreator();
            if (!alive) return;
            setMyCreator(nextCreator);
            setFormData((prev) => ({
              ...prev,
              introduction: nextCreator?.introduction ?? '',
              bankName: nextCreator?.bankName ?? '',
              accountNumber: nextCreator?.accountNumber ?? '',
            }));
          } catch {
            if (!alive) return;
            setMyCreator(null);
          }
        } else {
          setMyCreator(null);
        }
      } catch (err) {
        if (!alive) return;
        setMe(null);
        setMyCreator(null);
        setLoadError(err?.message || '프로필 정보를 불러오지 못했습니다.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ROLE_CREATOR + /creators/me 조회 성공인 경우에만 "크리에이터 수정 필드"를 노출
  const isCreator = useMemo(() => hasCreatorRole(me?.roles) && !!myCreator, [me?.roles, myCreator]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      // 이미지 업로드 후 URL을 profilePreview에 세팅
      const url = await uploadProfileImage(file);
      setProfileTouched(true);
      setProfilePreview(url);
    } catch (err) {
      alert(err?.message || '이미지 업로드에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileTouched(true);
    setProfilePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      // 공통: nickname/profile(동기화 대상)
      const nickname = formData.name;
      const profile = profileTouched ? (profilePreview || '') : null;

      if (isCreator) {
        // 크리에이터 수정: 유저+크리에이터 동시 수정(백엔드에서 동기화)
        await apiUpdateCreatorMe({
          nickname,
          profile,
          introduction: formData.introduction,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
        });
      } else {
        // 유저만 수정
        await apiUpdateUserMe({
          nickname,
          profile,
        });
      }

      router.push('/auth/my-page');
    } catch (err) {
      alert(err?.message || '프로필 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-gray-600">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-black font-semibold mb-2">로그인이 필요합니다.</div>
            {loadError && <div className="text-sm text-gray-600 mb-4">{loadError}</div>}
            <Link href="/auth/login" className="text-sm text-gray-700 underline">
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-black mb-2">프로필 설정</h1>
          <p className="text-gray-600">프로필 정보를 수정하세요</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* 프로필 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              프로필 이미지
            </label>
            <div className="flex items-center gap-6">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="프로필"
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                  👤
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handlePickImage}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
                >
                  이미지 변경
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="ml-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
                >
                  제거
                </button>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG 파일만 업로드 가능합니다</p>
              </div>
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-gray-50 cursor-not-allowed"
              placeholder="이메일을 입력하세요"
            />
            <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
          </div>

          {/* 크리에이터 정보 수정(ROLE_CREATOR일 때만) */}
          {isCreator && (
            <>
              <div>
                <label htmlFor="introduction" className="block text-sm font-medium text-gray-700 mb-2">
                  소개
                </label>
                <textarea
                  id="introduction"
                  name="introduction"
                  value={formData.introduction}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  placeholder="소개를 입력하세요"
                />
              </div>

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
            </>
          )}

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
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

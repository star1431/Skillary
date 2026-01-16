'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { baseRequest } from '../../../api/api';

/**
 * 마이페이지 "동작 테스트용" 페이지
 *
 * 목표:
 * - 백엔드에서 내려오는 값이 FE에 제대로 찍히는지 확인
 * - 크리에이터 미보유 유저는 "생성"을 눌러 생성까지 테스트
 * - profile은 S3 업로드를 통해 실제 이미지 URL을 저장/미리보기
 *
 * 라우트:
 * - /auth/my-page/test  (app 폴더명은 URL에 포함되지 않음)
 */
const API_URL = process.env.NEXT_PUBLIC_FRONT_API_URL;

// Creator 생성(POST /api/creators)은 201 + body 없음이라 json 파싱을 피하려고 text/plain 사용
const TEXT_HEADERS = { Accept: 'text/plain' };

// 화면 출력용: null/undefined를 빈 문자열로 통일
function asText(v) {
  return String(v ?? '');
}

// roles 응답이 Role 객체 배열 형태라서 "ROLE_XXX" 문자열만 뽑아냄
function getRoleNames(roles) {
  if (!Array.isArray(roles)) return [];
  return roles
    .map((r) => (typeof r === 'string' ? r : r?.role))
    .filter(Boolean);
}

// 크리에이터 권한 보유 여부
function hasCreatorRole(roles) {
  return getRoleNames(roles).includes('ROLE_CREATOR');
}

// profile URL이 있으면 img로 미리보기
function PreviewImage({ src, alt }) {
  if (!src) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <img
        src={src}
        alt={alt}
        style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }}
      />
    </div>
  );
}

// 간단 출력용 key/value 줄
function InfoRow({ label, value }) {
  return (
    <div>
      {label}: {asText(value)}
    </div>
  );
}

export default function MyPageTest() {
  // 공통 로딩/에러/데이터 상태
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [creator, setCreator] = useState(null);
  const [error, setError] = useState('');

  // 개인/크리에이터 화면 전환(ROLE_CREATOR가 있어야 creator 화면 의미 있음)
  const [mode, setMode] = useState('user'); // 'user' | 'creator'

  // 크리에이터 미보유일 때만 노출되는 "생성 폼" 토글
  const [showCreateForm, setShowCreateForm] = useState(false);
  // 생성 폼 입력값(닉네임/프로필은 생성 전 user 업데이트에도 사용)
  const [createForm, setCreateForm] = useState({
    nickname: '',
    profile: '',
    introduction: '',
    bankName: '',
    accountNumber: '',
  });
  // 생성 플로우 전용 상태
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  // 프로필 이미지 업로드(S3) 전용 로딩
  const [uploading, setUploading] = useState(false);

  // 유저 권한(ROLE_CREATOR) 기반으로 크리에이터 보유 여부 판단
  const isCreator = useMemo(() => hasCreatorRole(user?.roles), [user?.roles]);
  const roleNames = useMemo(() => getRoleNames(user?.roles), [user?.roles]);

  // createForm 업데이트 헬퍼: setCreateForm 반복을 줄이기 위함
  const setCreateField = useCallback((key, value) => {
    setCreateForm((p) => ({ ...p, [key]: value }));
  }, []);

  /**
   * 프로필 이미지 업로드
   * - 백엔드: POST /api/files/image (multipart/form-data)
   * - 응답: 업로드된 파일의 URL(text/plain)
   */
  const uploadProfileImage = useCallback(async (file) => {
    if (!API_URL) throw new Error('NEXT_PUBLIC_FRONT_API_URL이 설정되지 않았습니다.');
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/api/files/image`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(msg || '이미지 업로드에 실패했습니다.');
    }
    return await res.text();
  }, []);

  // 유저 정보 조회: GET /api/users/me
  const apiGetMe = useCallback(async () => {
    return await baseRequest(
      'GET',
      {},
      '/api/users/me',
      null,
      '유저 정보를 불러오지 못했습니다.',
      true,
    );
  }, []);

  // 내 크리에이터 정보 조회: GET /api/creators/me (크리에이터가 아닐 경우 4xx일 수 있음)
  const apiGetMyCreator = useCallback(async () => {
    return await baseRequest(
      'GET',
      {},
      '/api/creators/me',
      null,
      '크리에이터 정보를 불러오지 못했습니다.',
      true,
    );
  }, []);

  /**
   * 화면에서 필요한 데이터 전체 갱신
   * - 유저 정보는 항상 조회
   * - ROLE_CREATOR가 있으면 크리에이터 정보도 조회
   */
  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      setError('');

      const me = await apiGetMe();
      setUser(me);
      // 생성 폼에 기본값으로 현재 유저 nickname/profile을 미리 채워둠
      setCreateForm((p) => ({
        ...p,
        nickname: me?.nickname ?? '',
        profile: me?.profile ?? '',
      }));

      if (hasCreatorRole(me?.roles)) {
        try {
          const c = await apiGetMyCreator();
          setCreator(c);
        } catch {
          // ROLE은 있는데 creator 조회가 실패하는 케이스도 있음
          setCreator(null);
        }
      } else setCreator(null);
    } catch (e) {
      setError(e?.message || '요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [apiGetMe, apiGetMyCreator]);

  // 최초 진입 시 데이터 로드
  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 크리에이터 권한이 없으면 creator 화면으로 못 가게 방지
  useEffect(() => {
    if (isCreator && mode === 'creator') return;
    if (!isCreator && mode === 'creator') setMode('user');
  }, [isCreator, mode]);

  /**
   * 크리에이터 생성 전에 유저 닉네임/프로필을 먼저 업데이트
   * - displayName이 user.nickname 기반으로 생성되기 때문에 "원하는 닉네임"을 먼저 반영
   */
  const updateUserProfileAndNicknameIfNeeded = useCallback(async () => {
    const nextNickname = createForm.nickname;
    const nextProfile = createForm.profile;

    const payload = {};
    if (nextNickname !== (user?.nickname ?? '')) payload.nickname = nextNickname;
    if (nextProfile !== (user?.profile ?? '')) payload.profile = nextProfile;

    if (Object.keys(payload).length === 0) return;

    await baseRequest(
      'PUT',
      {},
      '/api/users/me',
      JSON.stringify(payload),
      '유저 정보(닉네임/프로필) 수정에 실패했습니다.',
      true,
    );
  }, [createForm.nickname, createForm.profile, user?.nickname, user?.profile]);

  // 파일 선택 시: 업로드 → profile URL 세팅
  const handleProfileFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCreateError('');
      setUploading(true);
      try {
        const url = await uploadProfileImage(file);
        setCreateField('profile', url);
      } catch (err) {
        setCreateError(err?.message || '이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading(false);
        // 같은 파일 재선택 가능하게 리셋
        e.target.value = '';
      }
    },
    [setCreateField, uploadProfileImage],
  );

  /**
   * 크리에이터 생성 플로우
   * 1) PUT /api/users/me : 닉네임/프로필 반영 (변경된 경우만)
   * 2) POST /api/creators : 소개/은행/계좌(+profile)로 크리에이터 생성 (201 body 없음)
   * 3) refreshAll로 roles/creator 정보 재조회 후 creator 화면으로 전환
   */
  const handleCreateCreator = useCallback(async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      // 1) 크리에이터 생성 전에 닉네임/프로필을 먼저 업데이트 (원하는 닉네임으로 displayName 고정되게)
      await updateUserProfileAndNicknameIfNeeded();

      // 2) 크리에이터 생성
      const payload = {
        introduction: createForm.introduction,
        profile: createForm.profile || null,
        bankName: createForm.bankName || null,
        accountNumber: createForm.accountNumber || null,
      };
      await baseRequest(
        'POST',
        TEXT_HEADERS, // 201 + body 없음 → json 파싱 방지
        '/api/creators',
        JSON.stringify(payload),
        '크리에이터 생성에 실패했습니다.',
        true,
      );
      await refreshAll();
      setShowCreateForm(false);
      setMode('creator');
    } catch (e2) {
      setCreateError(e2?.message || '크리에이터 생성 중 오류가 발생했습니다.');
    } finally {
      setCreateLoading(false);
    }
  }, [
    createForm.accountNumber,
    createForm.bankName,
    createForm.introduction,
    createForm.profile,
    refreshAll,
    updateUserProfileAndNicknameIfNeeded,
  ]);

  return (
    <div style={{ padding: 16 }}>
      <h2>마이페이지 테스트</h2>

      <div style={{ marginBottom: 12 }}>
        {/* 데이터 다시 불러오기 */}
        <button onClick={refreshAll} disabled={loading}>
          새로고침
        </button>
        {'  '}
        {isCreator ? (
          /* ROLE_CREATOR가 있으면 "개인 ↔ 크리에이터" 전환 */
          <button
            onClick={() => setMode((m) => (m === 'user' ? 'creator' : 'user'))}
            disabled={loading}
          >
            개인 ↔ 크리에이터 전환
          </button>
        ) : (
          /* ROLE_CREATOR가 없으면 크리에이터 생성 폼 토글 */
          <button
            onClick={() => setShowCreateForm((v) => !v)}
            disabled={loading}
          >
            크리에이터 생성
          </button>
        )}
      </div>

      {loading ? <p>로딩 중...</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      <hr />

      {/* 개인 화면: 유저 정보 표시 */}
      {mode === 'user' ? (
        <>
          <h3>유저</h3>
          {user ? (
            <div>
              <InfoRow label="nickname" value={user.nickname} />
              <InfoRow label="email" value={user.email} />
              <InfoRow label="subscribedCreatorCount" value={user.subscribedCreatorCount} />
              <InfoRow label="createdAt" value={user.createdAt} />
              <InfoRow label="roles" value={roleNames.join(', ')} />
              <InfoRow label="profile" value={user.profile} />
              <PreviewImage src={user.profile} alt="user profile" />
            </div>
          ) : (
            <p>유저 데이터 없음</p>
          )}
        </>
      ) : null}

      <hr />

      {/* 크리에이터 미보유: 생성 폼 노출 */}
      {!isCreator ? (
        <>
          {showCreateForm ? (
            <>
              <h3>크리에이터 생성</h3>
              <p>
                아래에서 <b>닉네임/프로필</b>을 원하는 값으로 수정한 뒤, 같은 화면에서 크리에이터를 생성합니다.
                (소개/은행명/계좌번호는 크리에이터 정보로 저장)
              </p>

              <form onSubmit={handleCreateCreator} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
                <label>
                  닉네임(nickname) - 수정 가능
                  <input
                    value={createForm.nickname}
                    onChange={(e) => setCreateField('nickname', e.target.value)}
                  />
                </label>

                <label>
                  프로필 URL(profile) - 수정 가능
                  <input
                    value={createForm.profile}
                    onChange={(e) => setCreateField('profile', e.target.value)}
                  />
                </label>

                <label>
                  프로필 이미지 업로드 (S3)
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={handleProfileFileChange}
                  />
                </label>

                {createForm.profile ? <div>미리보기</div> : null}
                <PreviewImage src={createForm.profile} alt="preview" />

                <label>
                  소개(introduction)
                  <textarea
                    value={createForm.introduction}
                    onChange={(e) => setCreateField('introduction', e.target.value)}
                    rows={3}
                  />
                </label>

                <label>
                  은행명(bankName)
                  <input
                    value={createForm.bankName}
                    onChange={(e) => setCreateField('bankName', e.target.value)}
                  />
                </label>

                <label>
                  계좌번호(accountNumber)
                  <input
                    value={createForm.accountNumber}
                    onChange={(e) => setCreateField('accountNumber', e.target.value)}
                  />
                </label>

                {createError ? <p style={{ color: 'crimson' }}>{createError}</p> : null}

                <button type="submit" disabled={createLoading}>
                  {createLoading ? '생성 중...' : '크리에이터 생성'}
                </button>
              </form>
            </>
          ) : (
            <p>상단의 “크리에이터 생성” 버튼을 눌러 생성 폼을 열어주세요.</p>
          )}
        </>
      ) : (
        <>
          {/* 크리에이터 보유: creator 화면에서만 크리에이터 정보 표시 */}
          {mode === 'creator' ? (
            <>
              <h3>크리에이터</h3>
              {creator ? (
                <div>
                  <InfoRow label="profile" value={creator.profile} />
                  <InfoRow label="introduction" value={creator.introduction} />
                  <InfoRow label="bankName" value={creator.bankName} />
                  <InfoRow label="accountNumber" value={creator.accountNumber} />
                  <InfoRow label="contentCount" value={creator.contentCount} />
                  <InfoRow label="followCount" value={creator.followCount} />
                  <InfoRow label="createdAt" value={creator.createdAt} />
                  <InfoRow label="isDeleted" value={creator.isDeleted} />
                  <PreviewImage src={creator.profile} alt="creator profile" />

                  <div style={{ marginTop: 12 }}>
                    <button disabled>프로필 수정(구현예정)</button>
                  </div>
                </div>
              ) : (
                <p>크리에이터 데이터 없음 (또는 /api/creators/me 호출 실패)</p>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}


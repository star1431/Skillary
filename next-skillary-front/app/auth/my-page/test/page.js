'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { InfoRow, PreviewImage } from './components';
import {
  apiCreateCreator,
  apiGetMe,
  apiGetMyCreator,
  apiUpdateCreatorMe,
  apiUpdateUserMe,
  uploadProfileImage,
} from './api';
import { CreatorCreateForm, ProfileEditForm } from './forms';
import { getRoleNames, hasCreatorRole } from './utils';

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

  // 크리에이터 보유 시 "수정 폼" 토글/상태
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    profile: '',
    introduction: '',
    bankName: '',
    accountNumber: '',
  });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // 유저 권한(ROLE_CREATOR) 기반으로 크리에이터 보유 여부 판단
  const isCreator = useMemo(() => hasCreatorRole(user?.roles), [user?.roles]);
  const roleNames = useMemo(() => getRoleNames(user?.roles), [user?.roles]);

  // createForm 업데이트 헬퍼: setCreateForm 반복을 줄이기 위함
  const setCreateField = useCallback((key, value) => {
    setCreateForm((p) => ({ ...p, [key]: value }));
  }, []);

  // editForm 업데이트 헬퍼
  const setEditField = useCallback((key, value) => {
    setEditForm((p) => ({ ...p, [key]: value }));
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
      // 수정 폼에도 기본값 세팅 (크리에이터 여부와 무관하게 user 값으로 프리필)
      setEditForm((p) => ({
        ...p,
        nickname: me?.nickname ?? '',
        profile: me?.profile ?? '',
        // 아래 3개는 creator 조회 성공 시 덮어씀 (없으면 빈 문자열 유지)
        introduction: p.introduction ?? '',
        bankName: p.bankName ?? '',
        accountNumber: p.accountNumber ?? '',
      }));

      if (hasCreatorRole(me?.roles)) {
        try {
          const c = await apiGetMyCreator();
          setCreator(c);

          // 수정 폼에도 기본값 세팅 (닉네임/프로필은 user 기준으로 동기화됨)
          setEditForm((p) => ({
            ...p,
            nickname: me?.nickname ?? '',
            profile: me?.profile ?? '',
            introduction: c?.introduction ?? '',
            bankName: c?.bankName ?? '',
            accountNumber: c?.accountNumber ?? '',
          }));
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

    await apiUpdateUserMe(payload);
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
    [setCreateField],
  );

  // (수정폼) 파일 선택 시: 업로드 → editForm.profile URL 세팅
  const handleEditProfileFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setEditError('');
      setUploading(true);
      try {
        const url = await uploadProfileImage(file);
        setEditField('profile', url);
      } catch (err) {
        setEditError(err?.message || '이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    },
    [setEditField],
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
        introduction: createForm.introduction || null,
        profile: createForm.profile || null,
        bankName: createForm.bankName || null,
        accountNumber: createForm.accountNumber || null,
      };
      await apiCreateCreator(payload);
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

  /**
   * 프로필 수정 저장(유저+크리에이터 동시 수정)
   * - 크리에이터 없으면: PUT /api/users/me (nickname/profile만)
   * - 크리에이터 있으면: PUT /api/creators/me (nickname/profile + introduction/bank/account)
   */
  const handleSaveProfile = useCallback(async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      if (!isCreator) {
        // 유저만일 때: nickname/profile만 저장
        const payload = {
          nickname: editForm.nickname,
          profile: editForm.profile, // ""이면 제거(null 저장), null이면 변경 없음 - 백 정책
        };
        await apiUpdateUserMe(payload);
      } else {
        // 크리에이터일 때: 한 번에 같이 저장 (백에서 user <-> creator 동기화)
        const payload = {
          nickname: editForm.nickname,
          profile: editForm.profile,
          introduction: editForm.introduction || null,
          bankName: editForm.bankName || null,
          accountNumber: editForm.accountNumber || null,
        };
        await apiUpdateCreatorMe(payload);
      }

      await refreshAll();
      setShowEditForm(false);
    } catch (e2) {
      setEditError(e2?.message || '프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setEditLoading(false);
    }
  }, [
    isCreator,
    editForm.accountNumber,
    editForm.bankName,
    editForm.introduction,
    editForm.nickname,
    editForm.profile,
    refreshAll,
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

        {'  '}
        {/* 프로필 수정 버튼: 유저만이어도 수정 가능 / 크리에이터면 같이 수정 */}
        {user ? (
          <button
            onClick={() => {
              // 수정은 유저 화면에서 진행(폼이 유저 화면에 있음)
              setMode('user');
              setEditError('');
              setEditForm({
                nickname: user?.nickname ?? '',
                profile: user?.profile ?? '',
                introduction: creator?.introduction ?? '',
                bankName: creator?.bankName ?? '',
                accountNumber: creator?.accountNumber ?? '',
              });
              setShowEditForm(true);
            }}
            disabled={loading || editLoading || uploading}
          >
            프로필 수정
          </button>
        ) : null}
      </div>

      {loading ? <p>로딩 중...</p> : null}
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      <hr />

      {/* 프로필 수정 폼이 열려있으면: 폼만 단독으로 표시 */}
      {showEditForm ? (
        <ProfileEditForm
          userEmail={user?.email}
          isCreator={isCreator}
          uploading={uploading}
          saving={editLoading}
          error={editError}
          form={editForm}
          setField={setEditField}
          onSubmit={handleSaveProfile}
          onCancel={() => setShowEditForm(false)}
          onProfileFileChange={handleEditProfileFileChange}
        />
      ) : null}

      {/* 개인 화면: 유저 정보 표시 */}
      {!showEditForm && mode === 'user' ? (
        <>
          <h3>유저</h3>
          {user ? (
            <div>
              <InfoRow label="nickname" value={user.nickname} />
              <InfoRow label="email" value={user.email} />
              <InfoRow label="profile" value={user.profile} />
              <PreviewImage src={user.profile} alt="user profile" />

              {/* 크리에이터가 있는 유저에게만 확장 정보 표시 */}
              {isCreator ? (
                <>
                  <InfoRow label="subscribedCreatorCount" value={user.subscribedCreatorCount} />
                  <InfoRow label="createdAt" value={user.createdAt} />
                  <InfoRow label="roles" value={roleNames.join(', ')} />
                </>
              ) : null}
            </div>
          ) : (
            <p>유저 데이터 없음</p>
          )}
        </>
      ) : null}

      <hr />

      {/* 크리에이터 미보유: 생성 폼 노출 */}
      {!showEditForm && !isCreator ? (
        <>
          {showCreateForm ? (
            <CreatorCreateForm
              uploading={uploading}
              creating={createLoading}
              error={createError}
              form={createForm}
              setField={setCreateField}
              onSubmit={handleCreateCreator}
              onProfileFileChange={handleProfileFileChange}
            />
          ) : (
            <p>상단의 “크리에이터 생성” 버튼을 눌러 생성 폼을 열어주세요.</p>
          )}
        </>
      ) : (
        <>
          {/* 크리에이터 보유: creator 화면에서만 크리에이터 정보 표시 */}
          {!showEditForm && mode === 'creator' ? (
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


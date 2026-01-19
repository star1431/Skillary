'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiGetMe, apiGetMyCreator, hasCreatorRole } from '../../api/my-page';

/**
 * 마이페이지(조회/표시 전용)
 *
 * 요구사항
 * - 유저 기본 정보: /users/me
 * - ROLE_CREATOR이면 크리에이터 정보: /creators/me
 * - 크리에이터가 있으면 "개인 <-> 크리에이터 전환" 버튼으로 한 페이지에서 토글
 * - 크리에이터가 없으면 "크리에이터 생성" 버튼
 */
export default function MyPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [myCreator, setMyCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [viewMode, setViewMode] = useState('user'); // 'user' | 'creator'

  // 크리에이터 생성 페이지로 이동
  const handleCreateCreator = () => {
    router.push('/creators/create');
  };

  // 가입일(ISO string)을 한국 로케일로 안전하게 표시
  const formatKoDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('ko-KR');
  };

  // roles 응답이 string/객체 혼재 가능해서 문자열로 정규화
  const getRoleText = (roles) => {
    if (!Array.isArray(roles)) return '-';
    return roles
      .map((r) => (typeof r === 'string' ? r : r?.role))
      .filter(Boolean)
      .join(', ') || '-';
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

        // 2) ROLE_CREATOR이면 크리에이터 정보도 조회
        //    (실제 크리에이터가 없거나 실패하면 null로 둠)
        if (hasCreatorRole(nextMe?.roles)) {
          try {
            const nextCreator = await apiGetMyCreator();
            if (!alive) return;
            setMyCreator(nextCreator);
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
        setLoadError(err?.message || '마이페이지 정보를 불러오지 못했습니다.');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const joinDateText = useMemo(() => formatKoDate(me?.createdAt), [me?.createdAt]);
  const isCreatorRole = useMemo(() => hasCreatorRole(me?.roles), [me?.roles]);
  const canCreatorView = useMemo(() => isCreatorRole && !!myCreator, [isCreatorRole, myCreator]);

  // 크리에이터 조회가 실패/없음 상태인데 creator 뷰로 들어가면 UX가 이상하니 user로 되돌림
  useEffect(() => {
    if (!canCreatorView && viewMode === 'creator') setViewMode('user');
  }, [canCreatorView, viewMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-gray-600">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">마이페이지</h1>
          <p className="text-gray-600">내 정보와 활동을 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 프로필 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 프로필 카드 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">프로필 정보</h2>
                {!isCreatorRole ? (
                  <button
                    onClick={() => handleCreateCreator()}
                    className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm whitespace-nowrap"
                  >
                    크리에이터 생성
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canCreatorView}
                    onClick={() => setViewMode((v) => (v === 'user' ? 'creator' : 'user'))}
                    className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm whitespace-nowrap disabled:opacity-60"
                  >
                    개인 {'<->'} 크리에이터 전환
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {viewMode === 'user' && (
                  <>
                    {/* 개인(유저) 정보 */}
                    <div className="flex items-center gap-4">
                      {me?.profile ? (
                        <img
                          src={me.profile}
                          alt="프로필"
                          className="w-20 h-20 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                          👤
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-black mb-1">{me?.nickname ?? '-'}</h3>
                        <p className="text-gray-600">{me?.email ?? '-'}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">가입일</span>
                        <span className="text-black font-medium">{joinDateText}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">권한</span>
                        <span className="text-black font-medium">{getRoleText(me?.roles)}</span>
                      </div>
                    </div>
                  </>
                )}

                {viewMode === 'creator' && myCreator && (
                  <>
                    {/* 크리에이터 정보 */}
                    <div className="flex items-center gap-4">
                      {(myCreator?.profile || me?.profile) ? (
                        <img
                          src={myCreator?.profile || me?.profile}
                          alt="크리에이터 프로필"
                          className="w-20 h-20 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">
                          👤
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-black mb-1">{myCreator?.nickname ?? me?.nickname ?? '-'}</h3>
                        <p className="text-gray-600">{myCreator?.introduction ?? '-'}</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">콘텐츠 생성 수</span>
                        <span className="text-black font-medium">{myCreator?.contentCount ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">구독자 수</span>
                        <span className="text-black font-medium">{myCreator?.followCount ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">은행명</span>
                        <span className="text-black font-medium">{myCreator?.bankName ?? '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">계좌번호</span>
                        <span className="text-black font-medium">{myCreator?.accountNumber ?? '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">가입일</span>
                        <span className="text-black font-medium">
                          {formatKoDate(myCreator?.createdAt)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 구독 정보 */}
            {viewMode === 'user' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-black">구독 정보</h2>
                  <Link href="/creators" className="text-sm text-gray-600 hover:text-black transition">
                    더 보기 →
                  </Link>
                </div>
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-black mb-2">{me?.subscribedCreatorCount ?? 0}</div>
                  <p className="text-gray-600">구독 중인 크리에이터</p>
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 빠른 메뉴 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-black mb-4">빠른 메뉴</h3>
              <div className="space-y-2">
                <Link
                  href="/cards/list"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  결제 카드
                </Link>
                <Link
                  href="/orders/list"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  주문 내역
                </Link>
                <Link
                  href="/payments/list"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  결제 내역
                </Link>
                {isCreatorRole && (
                  <Link
                    href="/settlements/list"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  >
                    정산 내역
                  </Link>
                )}
                <Link
                  href="/subscriptions"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  구독 목록
                </Link>
                <Link
                  href="/auth/my-page/setting"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  프로필 설정
                </Link>
              </div>
            </div>

            {/* 통계 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-black mb-4">활동 통계</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">이번 달 구독</span>
                    <span className="text-sm font-semibold text-black">2개</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">이번 달 결제</span>
                    <span className="text-sm font-semibold text-black">₩29,800</span>
                  </div>
                </div>
                {isCreatorRole && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">이번 달 생성</span>
                      <span className="text-sm font-semibold text-black">3개</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

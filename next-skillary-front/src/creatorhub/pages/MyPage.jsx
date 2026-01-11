import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { mockSubscriptions, mockPurchases, mockPayments, mockPayouts } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { CreditCard, ShoppingBag, Bell, User, FileText, Users, Plus, Edit, Trash2, DollarSign, RefreshCw } from 'lucide-react';
import { ROUTES, getContentDetailPath, getContentEditPath, getCreatorProfilePath } from '../config/routes';
import { getContentAccessLabel } from '../utils/helpers';
import { toast } from 'sonner';
import { getCreatorById, getCreatorByUserId, getPlanById, updateCreatorProfile } from '@/lib/creatorRepo';
import { getContentById, listContentsByCreator } from '@/lib/contentRepo';

export function MyPage({ onNavigate }) {
  const { user, createCreator, updateUser, toggleRole } = useAuth();
  const [showCreateCreatorDialog, setShowCreateCreatorDialog] = useState(false);
  const [creatorDisplayName, setCreatorDisplayName] = useState('');
  const [creatorBio, setCreatorBio] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCreatorDisplayName, setEditCreatorDisplayName] = useState('');
  const [editCreatorBio, setEditCreatorBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">로그인이 필요합니다.</p>
        <Button onClick={() => onNavigate(ROUTES.LOGIN)}>로그인</Button>
      </div>
    );
  }

  const userSubscriptions = mockSubscriptions
    .filter((s) => s.userId === user.id)
    .map((sub) => ({
      ...sub,
      plan: getPlanById(sub.planId),
      creator: getCreatorById(sub.creatorId),
    }));

  const userPurchases = mockPurchases
    .filter((p) => p.userId === user.id)
    .map((purchase) => ({
      ...purchase,
      content: getContentById(purchase.contentId),
    }))
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

  const userPayments = mockPayments
    .filter((p) => p.userId === user.id)
    .sort((a, b) => {
      const dateA = a.paidAt || a.createdAt;
      const dateB = b.paidAt || b.createdAt;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const activeSubscriptionsCount = userSubscriptions.filter((s) => s.status === 'ACTIVE').length;

  // 크리에이터인 경우 자신의 크리에이터 프로필과 콘텐츠 가져오기
  const creatorProfile = getCreatorByUserId(user.id);
  const creatorContents = creatorProfile
    ? listContentsByCreator(creatorProfile.id)
    : [];
  
  // 크리에이터인 경우 정산 예정 금액 계산
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthPayout = creatorProfile
    ? mockPayouts.find((p) => p.creatorId === creatorProfile.id && p.month === currentMonth && p.status === 'CALCULATED')
    : null;
  
  // 활성화된 콘텐츠 수 (크리에이터인 경우)
  const activeContentsCount = creatorContents.length;

  const handleCreateCreator = async () => {
    if (!creatorDisplayName.trim() || !creatorBio.trim()) {
      toast.error('크리에이터 명과 소개를 입력해주세요.');
      return;
    }

    setIsCreating(true);
    try {
      await createCreator(creatorDisplayName.trim(), creatorBio.trim());
      toast.success('크리에이터가 생성되었습니다.');
      setShowCreateCreatorDialog(false);
      setCreatorDisplayName('');
      setCreatorBio('');
    } catch (error) {
      toast.error('크리에이터 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!editEmail.trim()) {
      toast.error('이메일을 입력해주세요.');
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      toast.error('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: 실제 SMTP 이메일 전송 API 호출
      // await sendVerificationEmail(editEmail.trim());
      toast.success('인증 코드가 이메일로 전송되었습니다.');
      setIsEmailSent(true);
      setIsEmailVerified(false); // 이메일이 변경되었으므로 인증 상태 초기화
      setVerificationCode('');
    } catch (error) {
      toast.error('인증 코드 전송에 실패했습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('인증 코드를 입력해주세요.');
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: 실제 인증 코드 검증 API 호출
      // await verifyEmailCode(editEmail.trim(), verificationCode.trim());
      toast.success('이메일 인증이 완료되었습니다.');
      setIsEmailVerified(true);
    } catch (error) {
      toast.error('인증 코드가 올바르지 않습니다.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateUser = async () => {
    // 크리에이터 모드일 때는 크리에이터 정보만 검증
    if (user.role === 'CREATOR' && creatorProfile) {
      if (!editCreatorDisplayName.trim() || !editCreatorBio.trim()) {
        toast.error('크리에이터 명과 소개를 입력해주세요.');
        return;
      }

      setIsEditing(true);
      try {
        // 크리에이터 정보만 업데이트
        updateCreatorProfile(creatorProfile.id, {
          displayName: editCreatorDisplayName.trim(),
          bio: editCreatorBio.trim(),
        });
        toast.success('크리에이터 정보가 수정되었습니다.');
        setShowEditUserDialog(false);
        // 상태 초기화
        setEditCreatorDisplayName('');
        setEditCreatorBio('');
      } catch (error) {
        toast.error('크리에이터 정보 수정에 실패했습니다.');
      } finally {
        setIsEditing(false);
      }
    } else {
      // 일반 사용자 모드일 때는 사용자 정보 검증
      if (!editNickname.trim() || !editEmail.trim()) {
        toast.error('이름과 이메일을 입력해주세요.');
        return;
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail.trim())) {
        toast.error('올바른 이메일 형식을 입력해주세요.');
        return;
      }

      // 이메일이 변경된 경우 인증 필요
      if (editEmail.trim() !== originalEmail) {
        if (!isEmailVerified) {
          toast.error('이메일 인증을 완료해주세요.');
          return;
        }
      }

      setIsEditing(true);
      try {
        // 사용자 정보 업데이트
        await updateUser(editNickname.trim(), editEmail.trim());
        toast.success('사용자 정보가 수정되었습니다.');
        setShowEditUserDialog(false);
        // 상태 초기화
        setEditNickname('');
        setEditEmail('');
        setVerificationCode('');
        setIsEmailSent(false);
        setIsEmailVerified(false);
        setOriginalEmail('');
      } catch (error) {
        toast.error('사용자 정보 수정에 실패했습니다.');
      } finally {
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">마이페이지</h1>
          {!creatorProfile ? (
            <Button
              variant="default"
              onClick={() => setShowCreateCreatorDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              크리에이터 생성
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={toggleRole}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {user.role === 'USER' ? '크리에이터 전환' : '개인 전환'}
            </Button>
          )}
        </div>

        {/* User Info Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>사용자 정보</CardTitle>
              {creatorProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate(getCreatorProfilePath(creatorProfile.id))}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  크리에이터 프로필 보기 →
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (user.role === 'CREATOR' && creatorProfile) {
                  // 크리에이터 모드일 때는 크리에이터 정보만 초기화
                  setEditCreatorDisplayName(creatorProfile.displayName);
                  setEditCreatorBio(creatorProfile.bio);
                } else {
                  // 일반 사용자 모드일 때는 사용자 정보만 초기화
                  setEditNickname(user.nickname);
                  setEditEmail(user.email);
                  setOriginalEmail(user.email); // 원본 이메일 저장
                  // 인증 상태 초기화
                  setVerificationCode('');
                  setIsEmailSent(false);
                  setIsEmailVerified(false);
                }
                setShowEditUserDialog(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">
                      {user.role === 'CREATOR' && creatorProfile ? creatorProfile.displayName : user.nickname}
                    </h2>
                    <Badge variant={user.role === 'CREATOR' && creatorProfile ? 'default' : user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                      {user.role === 'CREATOR' && creatorProfile && '크리에이터'}
                      {user.role === 'ADMIN' && '관리자'}
                      {user.role === 'USER' && '일반 사용자'}
                    </Badge>
                  </div>
                  {user.role === 'CREATOR' && creatorProfile ? (
                    <>
                      <p className="text-muted-foreground">{creatorProfile.bio}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {user.role === 'CREATOR' && creatorProfile && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">계정 정보</p>
                  <p className="font-semibold">{user.nickname}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {user.role === 'CREATOR' && creatorProfile ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">활성화된 콘텐츠</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeContentsCount}개</div>
                <p className="text-xs text-muted-foreground mt-1">
                  총 {creatorContents.length}개 콘텐츠
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">구독자 수</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {creatorProfile?.subscriberCount.toLocaleString() || '0'}명
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  현재 구독자
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">정산 예정 금액</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₩{currentMonthPayout?.payout.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  이번 달 정산 예정
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">활성화된 구독</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSubscriptionsCount}개</div>
                <p className="text-xs text-muted-foreground mt-1">
                  총 {userSubscriptions.length}개 구독 중
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">최근 구매</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPurchases.length}개</div>
                <p className="text-xs text-muted-foreground mt-1">
                  구매한 콘텐츠
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">총 결제</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₩
                  {userPayments
                    .filter((p) => p.status === 'SUCCESS')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userPayments.filter((p) => p.status === 'SUCCESS').length}건 결제 완료
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue={user.role === 'CREATOR' ? 'contents' : 'subscriptions'}>
          <TabsList className="mb-6 bg-transparent text-foreground h-auto w-auto items-center justify-center rounded-none p-0">
            {user.role === 'CREATOR' ? (
              <>
                <TabsTrigger value="contents">콘텐츠 생성(목록)</TabsTrigger>
                <TabsTrigger value="subscribers">구독자 수</TabsTrigger>
                <TabsTrigger value="payout">정산 예정 금액</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="subscriptions">구독 목록</TabsTrigger>
                <TabsTrigger value="purchases">최근 구매</TabsTrigger>
                <TabsTrigger value="payments">결제 내역</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Contents Tab (Creator only) */}
          {user.role === 'CREATOR' && creatorProfile && (
            <TabsContent value="contents">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>콘텐츠 생성(목록)</CardTitle>
                  <Button onClick={() => onNavigate(ROUTES.CONTENT_NEW)}>
                    <Plus className="mr-2 h-4 w-4" />
                    새 콘텐츠 작성
                  </Button>
                </CardHeader>
                <CardContent>
                  {creatorContents.length > 0 ? (
                    <div className="space-y-4">
                      {creatorContents
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((content) => (
                          <div
                            key={content.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => onNavigate(getContentDetailPath(content.id))}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{content.title}</h3>
                                <Badge variant="outline">
                                  {getContentAccessLabel(content.accessType, content.price)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {content.category}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                생성일: {new Date(content.createdAt).toLocaleDateString('ko-KR')} · 
                                수정일: {new Date(content.updatedAt).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onNavigate(getContentDetailPath(content.id))}
                              >
                                보기
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onNavigate(getContentEditPath(content.id))}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>생성한 콘텐츠가 없습니다.</p>
                      <Button
                        className="mt-4"
                        onClick={() => onNavigate(ROUTES.CONTENT_NEW)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        첫 콘텐츠 작성하기
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Subscribers Tab (Creator only) */}
          {user.role === 'CREATOR' && creatorProfile && (
            <TabsContent value="subscribers">
              <Card>
                <CardHeader>
                  <CardTitle>구독자 수</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    현재 구독자: {creatorProfile?.subscriberCount.toLocaleString() || '0'}명
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-semibold mb-2">
                      {creatorProfile?.subscriberCount.toLocaleString() || '0'}명의 구독자
                    </p>
                    <p className="text-sm text-muted-foreground">
                      구독자 목록은 마이페이지에서 확인할 수 있습니다.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Payout Tab (Creator only) */}
          {user.role === 'CREATOR' && creatorProfile && (
            <TabsContent value="payout">
              <Card>
                <CardHeader>
                  <CardTitle>정산 예정 금액</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    이번 달 정산 예정 금액
                  </p>
                </CardHeader>
                <CardContent>
                  {currentMonthPayout ? (
                    <div className="space-y-4">
                      <div className="p-6 border rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">정산 월</span>
                          <span className="font-semibold">{currentMonthPayout.month}</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">총 매출 (gross)</span>
                            <span className="font-semibold">₩{currentMonthPayout.gross.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">플랫폼 수수료 (platform_fee)</span>
                            <span className="font-semibold text-destructive">-₩{currentMonthPayout.platformFee.toLocaleString()}</span>
                          </div>
                          <div className="pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-semibold">정산 예정 금액 (payout)</span>
                              <span className="text-2xl font-bold text-primary">₩{currentMonthPayout.payout.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="pt-2">
                            <Badge variant="secondary">상태: {currentMonthPayout.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>이번 달 정산 예정 금액이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Subscriptions Tab (User only) */}
          {user.role === 'USER' && (
            <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>구독 목록</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  활성화된 구독: {activeSubscriptionsCount}개
                </p>
              </CardHeader>
              <CardContent>
                {userSubscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {userSubscriptions
                      .sort((a, b) => {
                        // 활성 구독을 먼저, 그 다음 날짜순
                        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
                        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
                        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                      })
                      .map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{sub.creator?.displayName}</h3>
                            <Badge
                              variant={
                                sub.status === 'ACTIVE'
                                  ? 'default'
                                  : sub.status === 'CANCELED'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {sub.status === 'ACTIVE' && '활성'}
                              {sub.status === 'CANCELED' && '취소됨'}
                              {sub.status === 'EXPIRED' && '만료됨'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {sub.plan?.name} - ₩{sub.plan?.price.toLocaleString()}/월
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sub.startDate).toLocaleDateString('ko-KR')} ~{' '}
                            {new Date(sub.endDate).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate(getCreatorProfilePath(sub.creatorId))}
                        >
                          프로필 보기
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    구독 중인 크리에이터가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Purchases Tab (User only) */}
          {user.role === 'USER' && (
            <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>최근 구매</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  총 {userPurchases.length}개의 콘텐츠를 구매했습니다
                </p>
              </CardHeader>
              <CardContent>
                {userPurchases.length > 0 ? (
                  <div className="space-y-4">
                    {userPurchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{purchase.content?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            구매일: {new Date(purchase.purchasedAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => onNavigate(getContentDetailPath(purchase.contentId))}
                        >
                          콘텐츠 보기
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    구매한 콘텐츠가 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* Payments Tab (User only) */}
          {user.role === 'USER' && (
            <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>결제 내역</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  총 결제 금액: ₩{userPayments
                    .filter((p) => p.status === 'SUCCESS')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                {userPayments.length > 0 ? (
                  <div className="space-y-4">
                    {userPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">주문번호: {payment.orderId}</span>
                            <Badge
                              variant={
                                payment.status === 'SUCCESS'
                                  ? 'default'
                                  : payment.status === 'FAILED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {payment.status === 'SUCCESS' && '완료'}
                              {payment.status === 'FAILED' && '실패'}
                              {payment.status === 'PENDING' && '대기중'}
                              {payment.status === 'CANCELLED' && '취소됨'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {payment.type === 'SUBSCRIPTION' ? '구독 결제' : '콘텐츠 구매'} ·{' '}
                            {payment.method === 'CARD' ? '신용카드' : '가상계좌'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleString('ko-KR')
                              : new Date(payment.createdAt).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            ₩{payment.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    결제 내역이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          )}
        </Tabs>

        {/* Create Creator Dialog */}
        <Dialog open={showCreateCreatorDialog} onOpenChange={setShowCreateCreatorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>크리에이터 생성</DialogTitle>
              <DialogDescription>
                크리에이터 프로필을 생성하여 콘텐츠를 공유하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="creator-display-name">크리에이터 명 *</Label>
                <Input
                  id="creator-display-name"
                  value={creatorDisplayName}
                  onChange={(e) => setCreatorDisplayName(e.target.value)}
                  placeholder="크리에이터 명을 입력하세요"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creator-bio">소개 *</Label>
                <Textarea
                  id="creator-bio"
                  value={creatorBio}
                  onChange={(e) => setCreatorBio(e.target.value)}
                  placeholder="크리에이터에 대한 소개를 입력하세요"
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateCreatorDialog(false);
                  setCreatorDisplayName('');
                  setCreatorBio('');
                }}
                disabled={isCreating}
              >
                취소
              </Button>
              <Button onClick={handleCreateCreator} disabled={isCreating}>
                {isCreating ? '생성 중...' : '생성하기'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {user.role === 'CREATOR' && creatorProfile ? '크리에이터 정보 수정' : '사용자 정보 수정'}
              </DialogTitle>
              <DialogDescription>
                {user.role === 'CREATOR' && creatorProfile ? '크리에이터 정보를 수정할 수 있습니다.' : '사용자 정보를 수정할 수 있습니다.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {user.role === 'CREATOR' && creatorProfile ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-creator-display-name">크리에이터 명 *</Label>
                    <Input
                      id="edit-creator-display-name"
                      value={editCreatorDisplayName}
                      onChange={(e) => setEditCreatorDisplayName(e.target.value)}
                      placeholder="크리에이터 명을 입력하세요"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-creator-bio">소개 *</Label>
                    <Textarea
                      id="edit-creator-bio"
                      value={editCreatorBio}
                      onChange={(e) => setEditCreatorBio(e.target.value)}
                      placeholder="크리에이터에 대한 소개를 입력하세요"
                      rows={4}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-nickname">이름 *</Label>
                    <Input
                      id="edit-nickname"
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="이름을 입력하세요"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">이메일 *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => {
                          setEditEmail(e.target.value);
                          // 이메일이 변경되면 인증 상태 초기화
                          if (e.target.value !== originalEmail) {
                            setIsEmailVerified(false);
                            setIsEmailSent(false);
                            setVerificationCode('');
                          } else {
                            setIsEmailVerified(true);
                          }
                        }}
                        placeholder="이메일을 입력하세요"
                        required
                        disabled={isEditing}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendVerificationCode}
                        disabled={isVerifying || isEditing || editEmail.trim() === originalEmail}
                      >
                        {isVerifying ? '전송 중...' : '인증코드 전송'}
                      </Button>
                    </div>
                  </div>
                  {editEmail.trim() !== originalEmail && editEmail.trim() && (
                    <>
                      {isEmailSent && !isEmailVerified && (
                        <div className="space-y-2">
                          <Label htmlFor="verification-code">인증 코드 *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="verification-code"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="인증 코드를 입력하세요"
                              required
                              disabled={isEditing || isEmailVerified}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleVerifyCode}
                              disabled={isVerifying || isEditing || isEmailVerified || !verificationCode.trim()}
                            >
                              {isVerifying ? '인증 중...' : isEmailVerified ? '인증 완료' : '인증하기'}
                            </Button>
                          </div>
                        </div>
                      )}
                      {isEmailVerified && (
                        <div className="text-sm text-green-600 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-600"></span>
                          이메일 인증이 완료되었습니다.
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditUserDialog(false);
                  if (user.role === 'CREATOR' && creatorProfile) {
                    setEditCreatorDisplayName('');
                    setEditCreatorBio('');
                  } else {
                    setEditNickname('');
                    setEditEmail('');
                    setVerificationCode('');
                    setIsEmailSent(false);
                    setIsEmailVerified(false);
                    setOriginalEmail('');
                  }
                }}
                disabled={isEditing}
              >
                취소
              </Button>
              <Button onClick={handleUpdateUser} disabled={isEditing}>
                {isEditing ? '수정 중...' : '수정하기'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


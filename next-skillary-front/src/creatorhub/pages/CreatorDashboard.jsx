import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../context/AuthContext';
import { mockPayouts } from '../utils/mockData';
import { DollarSign, Users, FileText, TrendingUp, Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import { ROUTES, getCreatorProfilePath, getContentDetailPath, getContentEditPath } from '../config/routes';
import { getCreatorByUserId, listPlansByCreator } from '@/lib/creatorRepo';
import { listContentsByCreator } from '@/lib/contentRepo';

export function CreatorDashboard({ onNavigate }) {
  const { user } = useAuth();

  if (!user || user.role !== 'CREATOR') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">크리에이터만 접근할 수 있습니다.</p>
        <Button onClick={() => onNavigate(ROUTES.HOME)}>홈으로</Button>
      </div>
    );
  }

  const creatorProfile = getCreatorByUserId(user.id);
  const creatorPlans = creatorProfile
    ? listPlansByCreator(creatorProfile.id)
    : [];
  const creatorContents = creatorProfile
    ? listContentsByCreator(creatorProfile.id)
    : [];
  const creatorPayouts = creatorProfile
    ? mockPayouts.filter((p) => p.creatorId === creatorProfile.id)
    : [];

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthPayout = creatorPayouts.find((p) => p.month === currentMonth);
  const recentContents = creatorContents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">크리에이터 대시보드</h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-muted-foreground">{creatorProfile?.displayName}</p>
              {creatorProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(getCreatorProfilePath(creatorProfile.id))}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  해당 크리에이터 페이지
                </Button>
              )}
            </div>
          </div>
          <Button onClick={() => onNavigate(ROUTES.CONTENT_NEW)}>
            <Plus className="mr-2 h-4 w-4" />
            새 콘텐츠 작성
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">이번달 매출(추정)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₩{currentMonthPayout?.gross.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                정산 예정: ₩{currentMonthPayout?.payout.toLocaleString() || '0'}
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
                {creatorProfile?.subscriberCount.toLocaleString() || '0'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">최근 콘텐츠</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentContents.length}개</div>
              <p className="text-xs text-muted-foreground mt-1">
                최근 5개 콘텐츠
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Contents */}
        {recentContents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>최근 콘텐츠</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentContents.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate(getContentDetailPath(content.id))}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{content.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(content.createdAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {content.accessType === 'PREVIEW' && '무료'}
                      {content.accessType === 'SUBSCRIBER' && '구독자 전용'}
                      {content.accessType === 'PAID' && `₩${content.price?.toLocaleString()}`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="contents">
          <TabsList className="mb-6">
            <TabsTrigger value="contents">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="plans">구독 상품</TabsTrigger>
            <TabsTrigger value="payouts">정산 내역</TabsTrigger>
          </TabsList>

          {/* Contents Tab */}
          <TabsContent value="contents">
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 관리</CardTitle>
              </CardHeader>
              <CardContent>
                {creatorContents.length > 0 ? (
                  <div className="space-y-4">
                    {creatorContents.map((content) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{content.title}</h3>
                            <Badge variant="outline">
                              {content.accessType === 'PREVIEW' && '무료'}
                              {content.accessType === 'SUBSCRIBER' && '구독자 전용'}
                              {content.accessType === 'PAID' &&
                                `₩${content.price?.toLocaleString()}`}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {content.category} ·{' '}
                            {new Date(content.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate(getContentEditPath(content.id))}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>작성한 콘텐츠가 없습니다.</p>
                    <Button
                      className="mt-4"
                      onClick={() => onNavigate(ROUTES.CONTENT_NEW)}
                    >
                      첫 콘텐츠 작성하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>구독 상품 관리</CardTitle>
                <Button onClick={() => onNavigate('/creator/plan/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  생성
                </Button>
              </CardHeader>
              <CardContent>
                {creatorPlans.length > 0 ? (
                  <div className="space-y-4">
                    {creatorPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">Plan ID:</span>
                            <span className="text-sm font-mono">{plan.id}</span>
                          </div>
                          <h3 className="font-semibold mb-1">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {plan.description}
                          </p>
                          <p className="font-semibold">₩{plan.price.toLocaleString()}/월</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">is_active</span>
                            <Switch checked={plan.isActive} />
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>구독 플랜이 없습니다.</p>
                    <Button
                      className="mt-4"
                      onClick={() => onNavigate('/creator/plan/new')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      첫 플랜 생성하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>정산 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {creatorPayouts.length > 0 ? (
                  <div className="space-y-4">
                    {creatorPayouts
                      .sort((a, b) => b.month.localeCompare(a.month))
                      .map((payout) => (
                      <div
                        key={payout.id}
                          className="p-4 border rounded-lg"
                      >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">{payout.month}</h3>
                            <Badge variant={payout.status === 'PAID' ? 'default' : 'secondary'}>
                              {payout.status === 'PAID' ? 'PAID' : 'CALCULATED'}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">gross</p>
                              <p className="text-lg font-semibold">₩{payout.gross.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">platform_fee</p>
                              <p className="text-lg font-semibold">₩{payout.platformFee.toLocaleString()}</p>
                          </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">payout</p>
                              <p className="text-lg font-semibold">₩{payout.payout.toLocaleString()}</p>
                          </div>
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-muted-foreground">
                              status: <span className="font-semibold">{payout.status}</span>
                            </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>정산 내역이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


import { useState } from 'react';
import { Users, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ContentCard } from '../components/ContentCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ROUTES, getContentDetailPath, getPaymentSubscriptionPath } from '../config/routes';
import { getCreatorById, listPlansByCreator } from '@/lib/creatorRepo';
import { listContentsByCreator } from '@/lib/contentRepo';

export function CreatorProfilePage({ creatorId, onNavigate }) {
  const { user } = useAuth();
  const creator = getCreatorById(creatorId);
  const plans = listPlansByCreator(creatorId).filter((p) => p.isActive);
  const allContents = listContentsByCreator(creatorId);
  const [selectedTab, setSelectedTab] = useState('all');

  if (!creator) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>크리에이터를 찾을 수 없습니다.</p>
        <Button onClick={() => onNavigate(ROUTES.HOME)} className="mt-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  const filteredContents = allContents.filter((content) => {
    if (selectedTab === 'all') return true;
    return content.accessType === selectedTab.toUpperCase();
  });

  const handleSubscribe = (planId) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    onNavigate(getPaymentSubscriptionPath(planId));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {creator.profileImage && (
              <ImageWithFallback
                src={creator.profileImage}
                alt={creator.displayName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{creator.displayName}</h1>
              <Badge variant="secondary" className="mb-4">
                {creator.category}
              </Badge>
              <p className="text-lg opacity-90 mb-4">{creator.bio}</p>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>구독자 {creator.subscriberCount.toLocaleString()}명</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>가입일 {new Date(creator.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Subscription Plans */}
        {plans.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">구독 플랜</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="text-3xl font-bold mb-2">
                        ₩{plan.price.toLocaleString()}
                        <span className="text-base font-normal text-muted-foreground">/월</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <Button className="w-full" onClick={() => handleSubscribe(plan.id)}>
                      구독하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Contents */}
        <section>
          <h2 className="text-2xl font-bold mb-6">콘텐츠</h2>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="preview">무료</TabsTrigger>
              <TabsTrigger value="subscriber">구독자 전용</TabsTrigger>
              <TabsTrigger value="paid">단건 구매</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab}>
              {filteredContents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContents.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onClick={() => onNavigate(getContentDetailPath(content.id))}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  콘텐츠가 없습니다.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}


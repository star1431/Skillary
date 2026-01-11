import { useState } from 'react';
import { ArrowLeft, Lock, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { mockSubscriptions, mockPurchases } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { ROUTES, getCreatorProfilePath } from '../config/routes';
import { getContentAccessLabel } from '../utils/helpers';
import { getVideoEmbedInfo, parseContentBody } from '../utils/contentBlocks';
import { getContentById } from '@/lib/contentRepo';
import { getCreatorById, listPlansByCreator } from '@/lib/creatorRepo';

export function ContentDetailPage({ contentId, onNavigate }) {
  const { user } = useAuth();
  const content = getContentById(contentId);
  const creator = content ? getCreatorById(content.creatorId) : null;
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  if (!content || !creator) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>콘텐츠를 찾을 수 없습니다.</p>
        <Button onClick={() => onNavigate(ROUTES.HOME)} className="mt-4">
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  // Check access rights
  const hasSubscription = user
    ? mockSubscriptions.some(
        (s) => s.userId === user.id && s.creatorId === creator.id && s.status === 'ACTIVE'
      )
    : false;

  const hasPurchased = user
    ? mockPurchases.some((p) => p.userId === user.id && p.contentId === content.id)
    : false;

  const canViewFullContent =
    content.accessType === 'PREVIEW' ||
    (content.accessType === 'SUBSCRIBER' && hasSubscription) ||
    (content.accessType === 'PAID' && hasPurchased);

  const plans = listPlansByCreator(creator.id).filter((p) => p.isActive);

  const handleSubscribe = (planId) => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    onNavigate(`${ROUTES.PAYMENT_SUBSCRIPTION}?planId=${planId}`);
  };

  const handlePurchase = () => {
    if (!user) {
      toast.error('로그인이 필요합니다.');
      onNavigate(ROUTES.LOGIN);
      return;
    }
    onNavigate(`${ROUTES.PAYMENT_CONTENT}?contentId=${content.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => onNavigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로가기
        </Button>

        {/* Thumbnail */}
        {content.thumbnail && (
          <div className="aspect-video rounded-lg overflow-hidden mb-6">
            <ImageWithFallback
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold flex-1">{content.title}</h1>
            {!!getContentAccessLabel(content.accessType, content.price) && (
              <Badge
                variant={
                  content.accessType === 'PAID'
                    ? 'outline'
                    : content.accessType === 'SUBSCRIBER'
                      ? 'default'
                      : 'secondary'
                }
              >
                {getContentAccessLabel(content.accessType, content.price)}
              </Badge>
            )}
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-4 mb-4">
            {creator.profileImage && (
              <ImageWithFallback
                src={creator.profileImage}
                alt={creator.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <button
                onClick={() => onNavigate(getCreatorProfilePath(creator.id))}
                className="font-semibold hover:underline"
              >
                {creator.displayName}
              </button>
              <p className="text-sm text-muted-foreground">
                {new Date(content.createdAt).toLocaleDateString('ko-KR')} · {content.category}
              </p>
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Content Body */}
        <Card>
          <CardContent className="p-6">
            {canViewFullContent ? (
              <div className="prose max-w-none">
                {parseContentBody(content.body).map((block, idx) => {
                  if (block.type === 'text') {
                    const trimmed = block.text?.trim();
                    if (!trimmed) return null;
                    return (
                      <p key={`t-${idx}`} className="whitespace-pre-wrap">
                        {block.text}
                      </p>
                    );
                  }

                  if (block.type === 'image') {
                    return (
                      <figure key={`i-${idx}`} className="my-6">
                        <img
                          src={block.url}
                          alt={block.alt || '이미지'}
                          className="rounded-lg border max-w-full"
                        />
                        {block.alt ? (
                          <figcaption className="text-sm text-muted-foreground mt-2">
                            {block.alt}
                          </figcaption>
                        ) : null}
                      </figure>
                    );
                  }

                  if (block.type === 'video') {
                    const info = getVideoEmbedInfo(block.url);
                    if (!info.src) return null;

                    if (info.kind === 'youtube') {
                      return (
                        <div key={`v-${idx}`} className="my-6 aspect-video w-full overflow-hidden rounded-lg border bg-black">
                          <iframe
                            src={info.src}
                            title="영상"
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={`v-${idx}`} className="my-6">
                        <video src={info.src} controls className="w-full rounded-lg border" />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ) : (
              <div>
                {/* Intro (non-free content) */}
                {content.preview && (
                  <div className="mb-6 rounded-lg border bg-white p-6">
                    <h3 className="text-sm font-semibold mb-2">콘텐츠 소개</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {content.preview}
                    </p>
                  </div>
                )}

                {/* Lock Message */}
                <div className="bg-muted rounded-lg p-8 text-center">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">
                    {content.accessType === 'SUBSCRIBER'
                      ? '구독자 전용 콘텐츠'
                      : '유료 콘텐츠'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {content.accessType === 'SUBSCRIBER'
                      ? '이 크리에이터를 구독하면 전체 콘텐츠를 볼 수 있습니다.'
                      : '단건 구매 후 전체 콘텐츠를 열람할 수 있습니다.'}
                  </p>
                  <div className="flex gap-4 justify-center">
                    {content.accessType === 'SUBSCRIBER' && (
                      <Button size="lg" onClick={() => setShowSubscribeDialog(true)}>
                        구독하기
                      </Button>
                    )}
                    {content.accessType === 'PAID' && (
                      <Button size="lg" onClick={() => setShowPurchaseDialog(true)}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        ₩{content.price?.toLocaleString()} 구매하기
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onNavigate(getCreatorProfilePath(creator.id))}
                    >
                      크리에이터 프로필 보기
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>구독 플랜 선택</DialogTitle>
            <DialogDescription>
              {creator.displayName}의 구독 플랜을 선택하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="cursor-pointer hover:border-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        ₩{plan.price.toLocaleString()}
                      </div>
                      <Button size="sm" onClick={() => handleSubscribe(plan.id)}>
                        선택
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>콘텐츠 구매</DialogTitle>
            <DialogDescription>
              이 콘텐츠를 단건 구매하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">{content.title}</h4>
              <div className="flex items-center justify-between">
                <span>결제 금액</span>
                <span className="font-semibold text-lg">
                  ₩{content.price?.toLocaleString()}
                </span>
              </div>
            </div>
            <Button className="w-full" onClick={handlePurchase}>
              구매하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


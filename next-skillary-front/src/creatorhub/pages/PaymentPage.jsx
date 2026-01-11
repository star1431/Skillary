import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { CreditCard, Building2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES, getContentDetailPath } from '../config/routes';
import { getPlanById } from '@/lib/creatorRepo';
import { getContentById } from '@/lib/contentRepo';

export function PaymentPage({ type, planId, contentId, onNavigate }) {
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const plan = type === 'subscription' && planId ? getPlanById(planId) : null;
  const content =
    type === 'content' && contentId ? getContentById(contentId) : null;

  const amount = plan?.price || content?.price || 0;

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Randomly succeed/fail for demo
    const success = Math.random() > 0.1; // 90% success rate
    setPaymentResult(success ? 'success' : 'failed');
    setIsProcessing(false);

    if (success) {
      toast.success('결제가 완료되었습니다!');
    } else {
      toast.error('결제에 실패했습니다.');
    }
  };

  if (paymentResult === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>결제 완료!</CardTitle>
            <CardDescription>결제가 성공적으로 처리되었습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-left">
              <div className="flex justify-between mb-2">
                <span className="text-sm">주문번호</span>
                <span className="text-sm font-mono">ORD-{Date.now()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">결제금액</span>
                <span className="text-sm font-semibold">₩{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">결제수단</span>
                <span className="text-sm">
                  {paymentMethod === 'CARD' ? '신용카드' : '가상계좌'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {type === 'content' && content && (
                <Button className="flex-1" onClick={() => onNavigate(getContentDetailPath(content.id))}>
                  콘텐츠 보러가기
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onNavigate(ROUTES.MY_PAYMENTS)}
              >
                결제내역 보기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentResult === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>결제 실패</CardTitle>
            <CardDescription>결제 처리 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              카드 정보를 확인하시거나 다른 결제수단을 시도해주세요.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setPaymentResult(null)}>
                다시 시도
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => onNavigate(-1)}>
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">결제하기</h1>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>주문 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan && (
                  <div>
                    <h3 className="font-semibold mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                )}
                {content && (
                  <div>
                    <h3 className="font-semibold mb-1">{content.title}</h3>
                    <p className="text-sm text-muted-foreground">단건 콘텐츠 구매</p>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">총 결제금액</span>
                  <span className="text-2xl font-bold">₩{amount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>결제 수단</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v)}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <div className="font-medium">신용카드</div>
                      <div className="text-sm text-muted-foreground">
                        즉시 결제 및 승인
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted">
                  <RadioGroupItem value="VBANK" id="vbank" />
                  <Label htmlFor="vbank" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Building2 className="h-5 w-5" />
                    <div>
                      <div className="font-medium">가상계좌</div>
                      <div className="text-sm text-muted-foreground">
                        계좌 발급 후 입금
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onNavigate(-1)}
              disabled={isProcessing}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? '결제 처리 중...' : `₩${amount.toLocaleString()} 결제하기`}
            </Button>
          </div>

          {/* Notice */}
          <div className="text-xs text-muted-foreground bg-muted p-4 rounded-lg">
            <p>• 본 결제는 데모 환경입니다. 실제 결제가 진행되지 않습니다.</p>
            <p>• 결제 정보는 안전하게 암호화되어 처리됩니다.</p>
            <p>• 구독은 언제든지 해지할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


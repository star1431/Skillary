import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { UserCheck, UserX, Users } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '../config/routes';
import { listCreators } from '@/lib/creatorRepo';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';

export function AdminPage({ onNavigate }) {
  const { user } = useAuth();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [rejectionReason, setRejectionReason] = useState('');

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">관리자만 접근할 수 있습니다.</p>
        <Button onClick={() => onNavigate(ROUTES.HOME)}>홈으로</Button>
      </div>
    );
  }

  const creators = listCreators();
  const pendingCreators = creators.filter((c) => c.status === 'PENDING');
  const approvedCreators = creators.filter((c) => c.status === 'APPROVED');
  const rejectedCreators = creators.filter((c) => c.status === 'REJECTED');

  const handleApprovalAction = (creatorId, action) => {
    setSelectedCreator(creatorId);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    const creator = creators.find((c) => c.id === selectedCreator);
    if (approvalAction === 'approve') {
      toast.success(`${creator?.displayName} 크리에이터가 승인되었습니다.`);
    } else {
      toast.success(`${creator?.displayName} 크리에이터가 반려되었습니다.`);
    }
    setShowApprovalDialog(false);
    setSelectedCreator(null);
    setRejectionReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">관리자 대시보드</h1>

        {/* Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCreators.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">승인 완료</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCreators.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">반려</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCreators.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              승인 대기 ({pendingCreators.length})
            </TabsTrigger>
            <TabsTrigger value="approved">승인 완료</TabsTrigger>
            <TabsTrigger value="rejected">반려</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>크리에이터 승인 대기</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingCreators.length > 0 ? (
                  <div className="space-y-4">
                    {pendingCreators.map((creator) => (
                      <div
                        key={creator.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        {creator.profileImage && (
                          <ImageWithFallback
                            src={creator.profileImage}
                            alt={creator.displayName}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{creator.displayName}</h3>
                          <Badge variant="outline" className="mb-2">
                            {creator.category}
                          </Badge>
                          <p className="text-sm text-muted-foreground mb-2">{creator.bio}</p>
                          <p className="text-xs text-muted-foreground">
                            신청일: {new Date(creator.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprovalAction(creator.id, 'approve')}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            승인
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprovalAction(creator.id, 'reject')}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            반려
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>승인 대기 중인 크리에이터가 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>승인된 크리에이터</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      {creator.profileImage && (
                        <ImageWithFallback
                          src={creator.profileImage}
                          alt={creator.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{creator.displayName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {creator.category} · 구독자 {creator.subscriberCount.toLocaleString()}
                          명
                        </p>
                      </div>
                      <Badge variant="default">승인됨</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>반려된 크리에이터</CardTitle>
              </CardHeader>
              <CardContent>
                {rejectedCreators.length > 0 ? (
                  <div className="space-y-4">
                    {rejectedCreators.map((creator) => (
                      <div
                        key={creator.id}
                        className="flex items-center gap-4 p-4 border rounded-lg"
                      >
                        {creator.profileImage && (
                          <ImageWithFallback
                            src={creator.profileImage}
                            alt={creator.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{creator.displayName}</h3>
                          <p className="text-sm text-muted-foreground">{creator.category}</p>
                        </div>
                        <Badge variant="secondary">반려됨</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>반려된 크리에이터가 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? '크리에이터 승인' : '크리에이터 반려'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve'
                ? '이 크리에이터를 승인하시겠습니까?'
                : '이 크리에이터를 반려하시겠습니까?'}
            </DialogDescription>
          </DialogHeader>
          {approvalAction === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">반려 사유</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="반려 사유를 입력하세요"
                rows={4}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              취소
            </Button>
            <Button
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              onClick={confirmApproval}
            >
              {approvalAction === 'approve' ? '승인' : '반려'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


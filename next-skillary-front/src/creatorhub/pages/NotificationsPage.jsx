import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { Bell, Check } from 'lucide-react';
import { ROUTES } from '../config/routes';
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notificationsRepo';

export function NotificationsPage({ onNavigate }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(listNotificationsForUser(user?.id));
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="mb-4">로그인이 필요합니다.</p>
        <Button onClick={() => onNavigate(ROUTES.LOGIN)}>로그인</Button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id) => {
    markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    markAllNotificationsRead(user?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">알림</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground mt-2">{unreadCount}개의 읽지 않은 알림</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              모두 읽음 처리
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-primary' : ''
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.linkUrl) {
                    onNavigate(notification.linkUrl);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        !notification.isRead ? 'bg-primary/10' : 'bg-muted'
                      }`}
                    >
                      <Bell
                        className={`h-5 w-5 ${
                          !notification.isRead ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className={`${
                            !notification.isRead ? 'font-semibold' : 'text-muted-foreground'
                          }`}
                        >
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <Badge variant="default" className="flex-shrink-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>알림이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useRef, useEffect } from 'react';
import AlertItem from './AlertItem';

const notifications = [
  {
    id: 1,
    title: '새로운 콘텐츠가 업로드되었습니다',
    message: '테크 인사이트님이 "React 19 새로운 기능 완벽 가이드"를 업로드했습니다.',
    time: '5분 전',
    isRead: false
  },
  {
    id: 2,
    title: '구독한 크리에이터의 새 콘텐츠',
    message: '디자인 스튜디오님이 새로운 디자인 시스템 강의를 업로드했습니다.',
    time: '1시간 전',
    isRead: false
  },
  {
    id: 3,
    title: '댓글이 달렸습니다',
    message: '내가 작성한 게시글에 새로운 댓글이 달렸습니다.',
    time: '3시간 전',
    isRead: true
  },
  {
    id: 4,
    title: '구독 알림',
    message: '새로운 사용자가 당신을 구독했습니다.',
    time: '5시간 전',
    isRead: true
  },
  {
    id: 5,
    title: '콘텐츠 승인 완료',
    message: '제출하신 콘텐츠가 승인되었습니다.',
    time: '1일 전',
    isRead: true
  }
];

export default function Alert({ isOpen, onClose }) {
  const alertRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertRef.current && !alertRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <div
      ref={alertRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
    >
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-black">알림</h3>
        {unreadCount > 0 && (
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      <div className="overflow-y-auto max-h-80">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <AlertItem
              key={notification.id}
              title={notification.title}
              message={notification.message}
              time={notification.time}
              isRead={notification.isRead}
            />
          ))
        ) : (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            알림이 없습니다
          </div>
        )}
      </div>
      <div className="px-4 py-2 border-t border-gray-200">
        <button className="w-full text-center text-sm text-gray-600 hover:text-black transition">
          전체 보기
        </button>
      </div>
    </div>
  );
}

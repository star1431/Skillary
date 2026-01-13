'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { popularContents } from '../../components/popularContentsData';
import { creators } from '../../creators/components/data';

export default function ContentDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const content = popularContents.find(item => item.id === parseInt(id));

  // 임시: 현재 사용자가 작성자인지 확인 (실제로는 인증 정보에서 가져와야 함)
  const [currentUser] = useState('테크 인사이트'); // 임시 사용자
  const isOwner = content && content.author === currentUser;

  // 크리에이터 정보 찾기
  const creator = creators.find(c => c.name === content?.author);

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">콘텐츠를 찾을 수 없습니다</h1>
          <Link href="/contents" className="text-blue-600 hover:underline">
            콘텐츠 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    // 수정 페이지로 이동 (크리에이터의 create 페이지를 수정 모드로 사용)
    if (creator) {
      router.push(`/creators/${creator.id}/create?edit=true&contentId=${content.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <div className={`aspect-video bg-gradient-to-br ${content.gradientFrom} ${content.gradientTo} rounded-lg flex items-center justify-center mb-6`}>
            <div className="text-8xl">{content.emoji}</div>
          </div>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-black mb-4">{content.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                  <span className="text-gray-700 font-medium">{content.author}</span>
                </div>
                <span className="text-gray-500">{content.date}</span>
              </div>
            </div>
            {content.badge && (
              <span className={`ml-4 flex-shrink-0 ${content.badgeType === 'price' ? 'text-black text-lg font-semibold' : 'bg-black text-white text-sm px-4 py-2 rounded'}`}>
                {content.badgeType === 'price' ? content.price : content.badge}
              </span>
            )}
          </div>
        </div>

        {/* 콘텐츠 본문 */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">콘텐츠 소개</h2>
          <p className="text-gray-700 leading-relaxed mb-6">{content.description}</p>
          
          {/* 임시 콘텐츠 본문 */}
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              이 콘텐츠는 전문가의 지식과 노하우를 담은 고품질 자료입니다. 
              실무에 바로 적용할 수 있는 실용적인 정보와 최신 트렌드를 제공합니다.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              각 섹션별로 상세한 설명과 예제를 통해 이해도를 높이고, 
              실제 프로젝트에 활용할 수 있는 팁과 노하우를 공유합니다.
            </p>
            <p className="text-gray-700 leading-relaxed">
              지속적인 업데이트를 통해 최신 정보를 제공하며, 
              구독자 여러분의 성장을 지원합니다.
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          {isOwner && (
            <button
              onClick={() => handleEdit()}
              className="px-6 py-3 border-2 border-black text-black rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              수정하기
            </button>
          )}
          {content.badgeType === 'price' && (
            <button className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              구매하기 ({content.price})
            </button>
          )}
          {content.badgeType === 'badge' && content.badge === '구독자 전용' && (
            <Link 
              href={`/orders?contentId=${content.id}`}
              className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-center block"
            >
              구독하기
            </Link>
          )}
          {content.badge === '무료' && (
            <button className="flex-1 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              콘텐츠 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

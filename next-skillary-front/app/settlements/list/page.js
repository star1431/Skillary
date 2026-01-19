'use client';

import { useState, useEffect } from 'react';
import { getCreatorSettlements } from '@/api/settlements';
import Loading from '@/components/Loading';
import CreatorSettlementHeader from '../components/CreatorSettlementHeader';
import CreatorSettlementTable from '../components/CreatorSettlementTable';
import SettlementPagination from '../components/SettlementPagination'; // 이전에 만든 것 재사용

export default function CreatorSettlementPage() {
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchMySettlements = async (page) => {
    setIsLoading(true);
    try {
      // API 호출 (page, size)
      const response = await getCreatorSettlements(page, 10);
      
      // Page 객체 구조 대응
      setSettlements(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('내 정산 내역 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySettlements(currentPage);
  }, [currentPage]);

  if (isLoading) {
    return <Loading loadingMessage="내 정산 내역을 불러오는 중입니다..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreatorSettlementHeader 
          currentPage={currentPage} 
          totalPages={totalPages} 
        />
        
        <CreatorSettlementTable settlements={settlements} />
        
        <SettlementPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}
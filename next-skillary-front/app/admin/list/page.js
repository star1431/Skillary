'use client';

import { useState, useEffect } from 'react';
import Loading from '@/components/Loading'; // 제공해주신 로딩 컴포넌트 임포트
import { getAdminSettlementRuns } from '@/api/settlements';
import SettlementHeader from '../components/SettlementHeader';
import SettlementPagination from '../components/SettlementPagenation';
import SettlementTable from '../components/SettlementTable';

export default function AdminSettlementRunsPage() {
  const [settlementRuns, setSettlementRuns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchSettlementRuns = async (page) => {
    setIsLoading(true);
    try {
      const response = await getAdminSettlementRuns(page, 10);
      setSettlementRuns(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('정산 기록을 불러오는 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlementRuns(currentPage);
  }, [currentPage]);

  // 데이터 로딩 중일 때 표시
  if (isLoading) {
    return <Loading loadingMessage="정산 기록을 불러오는 중입니다..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettlementHeader currentPage={currentPage} totalPages={totalPages} />
        
        {isLoading ? (
          <Loading loadingMessage="데이터 로딩 중..." />
        ) : (
          <>
            <SettlementTable settlementRuns={settlementRuns} />
            <SettlementPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from 'react';
import { createSubscriptionPlan } from '@/api/subscriptions';

export default function PlanCreateForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 간단한 유효성 검사
    if (!formData.planName || !formData.description || !formData.price) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      // 가격은 숫자로 변환하여 전송
      const res = await createSubscriptionPlan(
        formData.planName, 
        formData.description, 
        Number(formData.price)
      );

      if (res) {
        alert("플랜이 성공적으로 생성되었습니다!");
        if (onSuccess) onSuccess(); // 목록 새로고침 등의 콜백
      }
    } catch (error) {
      console.error("플랜 생성 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">새 구독 플랜 만들기</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 플랜 이름 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">플랜 이름</label>
          <input
            type="text"
            name="planName"
            value={formData.planName}
            onChange={handleChange}
            placeholder="예: 실버 멤버십, 후원자 플랜"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
        </div>

        {/* 플랜 설명 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">플랜 설명 (혜택 등)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="구독자에게 제공할 혜택을 적어주세요."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          />
        </div>

        {/* 월 구독료 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">월 구독료 (KRW)</label>
          <div className="relative">
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pl-12"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₩</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">* 최소 금액은 1,000원 이상을 권장합니다.</p>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition ${
              isSubmitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
            }`}
          >
            {isSubmitting ? '생성 중...' : '플랜 등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
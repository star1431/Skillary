'use client';

import { useState } from 'react';
import { getSubscriptions, unsubscribe } from '../api/subscriptions';

export default function TestPage() {
  const [userIdForGet, setUserIdForGet] = useState(1);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [subscriptions, setSubscriptions] = useState(null);

  const [userIdForDelete, setUserIdForDelete] = useState(1);
  const [planId, setPlanId] = useState('');
  const [deleteResult, setDeleteResult] = useState(null);

  const handleGetSubscriptions = async () => {
    try {
      const result = await getSubscriptions(userIdForGet, page, size);
      setSubscriptions(result);
      console.log('구독 목록:', result);
    } catch (error) {
      console.error('구독 목록 조회 실패:', error);
      setSubscriptions({ error: error.message });
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const result = await unsubscribe();
      setDeleteResult(result);
      console.log('구독 취소 결과:', result);
    } catch (error) {
      console.error('구독 취소 실패:', error);
      setDeleteResult({ error: error.message });
    }
  };

  return (
    <div>
      <h1>Subscription API Test</h1>

      <div>
        <h2>1. Get Subscriptions</h2>
        <div>
          <label>
            User ID:
            <input
              type="number"
              value={userIdForGet}
              onChange={(e) => setUserIdForGet(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            Page:
            <input
              type="number"
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            Size:
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
        </div>
        <button onClick={handleGetSubscriptions}>Get Subscriptions</button>
        {subscriptions && (
          <pre>{JSON.stringify(subscriptions, null, 2)}</pre>
        )}
      </div>

      <hr />

      <div>
        <h2>2. Unsubscribe</h2>
        <div>
          <label>
            User ID:
            <input
              type="number"
              value={userIdForDelete}
              onChange={(e) => setUserIdForDelete(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            Plan ID:
            <input
              type="number"
              value={planId}
              onChange={(e) => setPlanId(Number(e.target.value))}
            />
          </label>
        </div>
        <button onClick={handleUnsubscribe}>Unsubscribe</button>
        {deleteResult !== null && (
          <pre>{JSON.stringify(deleteResult, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
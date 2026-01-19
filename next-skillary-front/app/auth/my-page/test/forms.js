import { PreviewImage } from './components';

/**
 * 프로필 수정 폼 (유저만 / 유저+크리에이터 공용)
 *
 * 저장 동작은 부모에서 `onSubmit`으로 처리:
 * - 유저만: PUT /api/users/me
 * - 크리에이터: PUT /api/creators/me
 */
export function ProfileEditForm({
  userEmail,
  isCreator,
  uploading,
  saving,
  error,
  form,
  setField,
  onSubmit,
  onCancel,
  onProfileFileChange,
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <h3>프로필 수정</h3>
      <p>
        nickname/profile은 유저 기준으로 저장되며,
        크리에이터가 있으면 소개/은행/계좌까지 한 번에 저장됩니다.
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <label>
          이메일(email) - 변경 불가
          <input value={userEmail ?? ''} disabled />
        </label>

        <label>
          닉네임(nickname) - 필수
          <input
            value={form.nickname}
            onChange={(e) => setField('nickname', e.target.value)}
            required
          />
        </label>

        <label>
          프로필 URL(profile) - 선택 (지우면 빈값으로 저장)
          <input
            value={form.profile}
            onChange={(e) => setField('profile', e.target.value)}
            placeholder="비우면 제거됩니다"
          />
        </label>

        <label>
          프로필 이미지 업로드 (S3)
          <input
            type="file"
            accept="image/*"
            disabled={uploading || saving}
            onChange={onProfileFileChange}
          />
        </label>

        {form.profile ? <div>미리보기</div> : null}
        <PreviewImage src={form.profile} alt="edit preview" />

        {/* 크리에이터가 있을 때만 크리에이터 전용 필드 노출 */}
        {isCreator ? (
          <>
            <label>
              소개(introduction)
              <textarea
                value={form.introduction}
                onChange={(e) => setField('introduction', e.target.value)}
                rows={3}
              />
            </label>

            <label>
              은행명(bankName)
              <input
                value={form.bankName}
                onChange={(e) => setField('bankName', e.target.value)}
              />
            </label>

            <label>
              계좌번호(accountNumber)
              <input
                value={form.accountNumber}
                onChange={(e) => setField('accountNumber', e.target.value)}
              />
            </label>
          </>
        ) : null}

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={saving || uploading}>
            {saving ? '저장 중...' : '저장'}
          </button>
          <button type="button" onClick={onCancel} disabled={saving}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * 크리에이터 생성 폼
 * - 생성 전 user 닉네임/프로필 업데이트는 부모에서 처리
 */
export function CreatorCreateForm({
  uploading,
  creating,
  error,
  form,
  setField,
  onSubmit,
  onProfileFileChange,
}) {
  return (
    <>
      <h3>크리에이터 생성</h3>
      <p>
        아래에서 <b>닉네임/프로필</b>을 원하는 값으로 수정한 뒤, 같은 화면에서 크리에이터를 생성합니다.
        (소개/은행명/계좌번호는 크리에이터 정보로 저장)
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
        <label>
          닉네임(nickname) - 필수
          <input
            value={form.nickname}
            onChange={(e) => setField('nickname', e.target.value)}
          />
        </label>

        <label>
          프로필 URL(profile) - 선택
          <input
            value={form.profile}
            onChange={(e) => setField('profile', e.target.value)}
          />
        </label>

        <label>
          프로필 이미지 업로드 (S3)
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={onProfileFileChange}
          />
        </label>

        {form.profile ? <div>미리보기</div> : null}
        <PreviewImage src={form.profile} alt="preview" />

        <label>
          소개(introduction) - 선택
          <textarea
            value={form.introduction}
            onChange={(e) => setField('introduction', e.target.value)}
            rows={3}
          />
        </label>

        <label>
          은행명(bankName) - 선택
          <input
            value={form.bankName}
            onChange={(e) => setField('bankName', e.target.value)}
          />
        </label>

        <label>
          계좌번호(accountNumber) - 선택
          <input
            value={form.accountNumber}
            onChange={(e) => setField('accountNumber', e.target.value)}
          />
        </label>

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

        <button type="submit" disabled={creating}>
          {creating ? '생성 중...' : '크리에이터 생성'}
        </button>
      </form>
    </>
  );
}


const PAYMENT_STATUS_CONFIG = {
  PAID: {
    label: '지불 완료',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500'
  },
  READY: {
    label: '결제 대기',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500'
  },
  CANCELED: {
    label: '철회됨',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
    dotClass: 'bg-slate-400'
  },
  REFUNDED: {
    label: '환불 완료',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500'
  }
};

const DEFAULT_CONFIG = {
  label: '알 수 없음',
  badgeClass: 'bg-gray-50 text-gray-500 border-gray-200',
  dotClass: 'bg-gray-400'
};

export default function PaymentStatusBadge({ status }) {
  const config = PAYMENT_STATUS_CONFIG[status] || DEFAULT_CONFIG;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight border shadow-sm transition-colors ${config.badgeClass}`}
    >
      <span className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        {config.label}
      </span>
    </span>
  );
}
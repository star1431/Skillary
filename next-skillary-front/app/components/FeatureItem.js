export default function FeatureItem({ icon, title, description, borderColor, iconColor }) {
  return (
    <div className="text-center">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 ${borderColor} flex items-center justify-center`}>
        <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
      <h3 className="text-xl font-bold text-black mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

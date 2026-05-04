import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function StatusCard({ departmentName, status, remarks }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'APPROVED':
        return { color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle className="text-green-500" />, text: 'Approved' };
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle className="text-red-500" />, text: 'Rejected' };
      case 'QUERY':
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <AlertCircle className="text-yellow-500" />, text: 'Query Raised' };
      default:
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock className="text-yellow-500" />, text: 'Pending' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`p-6 rounded-xl border ${config.color} bg-white transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg text-gray-800">{departmentName}</h3>
        {config.icon}
      </div>
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/50">
        {config.text}
      </div>
      {remarks && (
        <div className="mt-4 text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-black/5">
          <span className="font-semibold block mb-1">Remarks:</span>
          {remarks}
        </div>
      )}
    </div>
  );
}

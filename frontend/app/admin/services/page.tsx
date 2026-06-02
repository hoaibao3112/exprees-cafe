'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Coffee, Plus, Search, Edit, Trash2, ChevronRight, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAdminServicesQuery, useDeleteServiceMutation } from '@/hooks/useServicesQueries';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { resolveUploadUrl } from '@/lib/api';

export default function AdminServicesPage() {
  const { data: services, isLoading, error } = useAdminServicesQuery();
  const deleteMutation = useDeleteServiceMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredServices = (services || []).filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteConfirmOpen(false);
        setDeleteId(null);
      } catch (err) {
        console.error('Error deleting service:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý Dịch vụ F&B</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Quản trị danh sách các giải pháp F&B hiển thị ngoài giao diện chính của website
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm dịch vụ
        </Link>
      </div>

      {/* 2. Controls & Filters Row */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>
        
        {/* Quick status count */}
        <div className="flex gap-4 items-center shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tổng số: <span className="text-slate-700">{filteredServices.length}</span>
          </span>
        </div>
      </div>

      {/* 3. Main Data Content Area */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
          <p className="text-red-500 font-semibold">Lỗi tải danh sách dịch vụ: {error.message}</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl py-16 text-center">
          <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-extrabold text-base text-slate-800">Không tìm thấy dịch vụ</h3>
          <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc nhấn thêm dịch vụ mới.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-28">Hình ảnh</th>
                  <th className="px-6 py-4">Tên dịch vụ</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4 w-32">Trạng thái</th>
                  <th className="px-6 py-4 w-28 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredServices.map((service) => {
                  const firstImage = service.images?.[0];
                  const thumbUrl = firstImage 
                    ? resolveUploadUrl(firstImage) 
                    : (service.imageUrl || 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=100&auto=format&fit=crop');

                  return (
                    <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Image Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="relative w-16 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                          <img
                            src={thumbUrl}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        <Link href={`/admin/services/${service.id}`} className="block">
                          {service.name}
                        </Link>
                      </td>

                      {/* Description Summary */}
                      <td className="px-6 py-4 max-w-xs md:max-w-md">
                        <p className="line-clamp-2 text-slate-500 font-light leading-relaxed">
                          {service.description || '—'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          service.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {service.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/services/${service.id}`}
                            className="p-2 border border-slate-200 hover:border-blue-200 rounded-xl hover:bg-blue-50/50 text-slate-400 hover:text-blue-600 transition-all"
                            title="Chỉnh sửa dịch vụ"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(service.id)}
                            className="p-2 border border-slate-200 hover:border-rose-200 rounded-xl hover:bg-rose-50/50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Dialog Overlay */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-slate-200 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-500 mb-5 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            
            <h3 className="text-center font-extrabold text-base text-slate-900 uppercase tracking-wide">
              Xác Nhận Xóa Dịch Vụ
            </h3>
            
            <p className="text-center text-xs text-slate-400 mt-2.5 leading-relaxed font-light">
              Hành động này sẽ xóa hoàn toàn dịch vụ F&B khỏi cơ sở dữ liệu và trang hiển thị chính. Bạn có chắc chắn muốn tiếp tục không?
            </p>

            <div className="flex gap-3.5 mt-6 w-full">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-md shadow-rose-500/10"
              >
                XÓA ĐI ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

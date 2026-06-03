'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, Plus, Search, Edit, Trash2, ChevronRight, CheckCircle2, DollarSign, Image as ImageIcon } from 'lucide-react';
import { useFranchisePackagesQuery, useDeleteFranchisePackageMutation } from '@/hooks/useFranchiseQueries';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { resolveUploadUrl } from '@/lib/api';

export default function AdminFranchisePage() {
  const { data: packages, isLoading, error } = useFranchisePackagesQuery();
  const deleteMutation = useDeleteFranchisePackageMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredPackages = (packages || []).filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        console.error('Error deleting package:', err);
      }
    }
  };

  // Helper format currency to VND (e.g. 250,000,000)
  const formatVND = (value: number | string) => {
    const numeric = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numeric)) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numeric);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý Gói đầu tư nhượng quyền</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Quản lý thông tin, chi phí đầu tư tối thiểu và hình ảnh các gói nhượng quyền 0Đ hiển thị trên website
          </p>
        </div>
        <Link
          href="/admin/franchise/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-[0.98]"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm gói đầu tư
        </Link>
      </div>

      {/* 2. Controls Row */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm gói theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-700 font-medium placeholder:text-slate-400"
          />
        </div>
        
        {/* Count */}
        <div className="flex gap-4 items-center shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tổng số: <span className="text-slate-700">{filteredPackages.length}</span>
          </span>
        </div>
      </div>

      {/* 3. Data Area */}
      {isLoading ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
          <TableSkeleton rows={3} cols={5} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
          <p className="text-red-500 font-semibold">Lỗi tải danh sách gói đầu tư: {error.message}</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl py-16 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-extrabold text-base text-slate-800">Không tìm thấy gói đầu tư</h3>
          <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc nhấn thêm gói đầu tư mới.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 w-28">Hình ảnh</th>
                  <th className="px-6 py-4">Tên gói đầu tư</th>
                  <th className="px-6 py-4 w-40">Mô hình</th>
                  <th className="px-6 py-4 w-48">Vốn tối thiểu</th>
                  <th className="px-6 py-4 w-32">Trạng thái</th>
                  <th className="px-6 py-4 w-28 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredPackages.map((pkg) => {
                  const firstImage = pkg.images?.[0];
                  const resolvedImg = firstImage
                    ? resolveUploadUrl(firstImage)
                    : 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?q=80&w=100&auto=format&fit=crop';

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="relative w-16 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                          <img
                            src={resolvedImg}
                            alt={pkg.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        <Link href={`/admin/franchise/${pkg.id}`} className="block">
                          {pkg.name}
                        </Link>
                      </td>

                      {/* Model Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                          pkg.modelType === 'KIOSK'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : pkg.modelType === 'EXPRESS'
                              ? 'bg-blue-50 text-blue-600 border-blue-100'
                              : 'bg-purple-50 text-purple-600 border-purple-100'
                        }`}>
                          {pkg.modelType}
                        </span>
                      </td>

                      {/* Investment Size */}
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {formatVND(pkg.investmentFrom)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          pkg.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pkg.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {pkg.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/franchise/${pkg.id}`}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all active:scale-95"
                            title="Sửa thông tin"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(pkg.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all active:scale-95"
                            title="Xóa gói"
                            disabled={deleteMutation.isPending}
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

      {/* Delete Dialog Confirmation */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in scale-in duration-200">
            <h3 className="text-base font-extrabold text-slate-800 mb-2">Xác nhận xóa gói đầu tư?</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
              Hành động này không thể hoàn tác. Gói đầu tư nhượng quyền này sẽ bị xóa vĩnh viễn khỏi hệ thống cơ sở dữ liệu.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-500/10 active:scale-95"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Đồng ý xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

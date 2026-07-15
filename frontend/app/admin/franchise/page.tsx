'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Award,
  Search,
  Trash2,
  Pencil,
  Plus,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { adminFranchiseApi, FranchisePackage } from '@/lib/admin-api';
import { toast } from '@/components/admin/Toast';

export default function AdminFranchisePage() {
  const qc = useQueryClient();
  const [pkgSearch, setPkgSearch] = useState('');

  // Modals
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<FranchisePackage | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgModelType, setPkgModelType] = useState('EXPRESS');
  const [pkgInvestment, setPkgInvestment] = useState(0);
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgIsActive, setPkgIsActive] = useState(true);

  // Queries
  const { data: packages = [], isLoading: isLoadingPkgs } = useQuery({
    queryKey: ['admin', 'franchise', 'packages'],
    queryFn: () => adminFranchiseApi.getAll() as Promise<FranchisePackage[]>,
  });

  // Mutations
  const createPkgMutation = useMutation({
    mutationFn: (data: Partial<FranchisePackage>) => adminFranchiseApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'franchise', 'packages'] });
      toast.success('Đã thêm gói đầu tư mới');
      setIsPkgModalOpen(false);
      resetPkgForm();
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi tạo gói đầu tư'),
  });

  const updatePkgMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FranchisePackage> }) =>
      adminFranchiseApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'franchise', 'packages'] });
      toast.success('Đã cập nhật gói đầu tư');
      setIsPkgModalOpen(false);
      resetPkgForm();
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi cập nhật gói đầu tư'),
  });

  const deletePkgMutation = useMutation({
    mutationFn: (id: string) => adminFranchiseApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'franchise', 'packages'] });
      toast.success('Đã xóa gói đầu tư thành công');
    },
    onError: (err: any) => toast.error(err.message || 'Lỗi khi xóa gói đầu tư'),
  });

  // Filters
  const filteredPkgs = useMemo(() => {
    let list = [...packages];
    if (pkgSearch.trim()) {
      const q = pkgSearch.toLowerCase();
      list = list.filter(
        (pkg) =>
          pkg.name?.toLowerCase().includes(q) ||
          pkg.modelType?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [packages, pkgSearch]);

  // Handlers
  const handleOpenPkgModal = (pkg: FranchisePackage | null = null) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgName(pkg.name);
      setPkgModelType(pkg.modelType);
      setPkgInvestment(pkg.investmentFrom);
      setPkgDescription(pkg.description || '');
      setPkgIsActive(pkg.isActive);
    } else {
      resetPkgForm();
    }
    setIsPkgModalOpen(true);
  };

  const resetPkgForm = () => {
    setEditingPkg(null);
    setPkgName('');
    setPkgModelType('EXPRESS');
    setPkgInvestment(0);
    setPkgDescription('');
    setPkgIsActive(true);
  };

  const handleSavePkg = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: pkgName,
      modelType: pkgModelType,
      investmentFrom: Number(pkgInvestment),
      description: pkgDescription,
      isActive: pkgIsActive,
    };

    if (editingPkg) {
      updatePkgMutation.mutate({ id: editingPkg.id, data: payload });
    } else {
      createPkgMutation.mutate(payload);
    }
  };

  const handleDeletePkg = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gói đầu tư này? Thao tác này không thể hoàn tác.')) {
      deletePkgMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Title & CTA ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-orange-500" />
            Quản Lý Nhượng Quyền
          </h1>
          <p className="text-xs text-slate-500 mt-1">Quản lý và cấu hình danh sách các gói đầu tư nhượng quyền hiển thị trên website.</p>
        </div>

        <button
          onClick={() => handleOpenPkgModal(null)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" /> THÊM GÓI ĐẦU TƯ
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="flex bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tên gói đầu tư..."
            value={pkgSearch}
            onChange={(e) => setPkgSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-semibold text-slate-700 transition-colors"
          />
        </div>
      </div>

      {/* ── Packages Grid ── */}
      {isLoadingPkgs ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500 mt-2">Đang tải danh sách gói nhượng quyền...</span>
        </div>
      ) : filteredPkgs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-400">
          <ShieldAlert className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-sm text-slate-700">Chưa cấu hình gói đầu tư nào</h3>
          <p className="text-[11px] text-slate-400 mt-1">Nhấp nút "Thêm Gói mới" để cấu hình.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPkgs.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-[#0047cc] text-[9px] font-black rounded uppercase tracking-wider">
                    {pkg.modelType}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${pkg.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} title={pkg.isActive ? 'Đang hoạt động' : 'Tạm ẩn'} />
                </div>

                <div>
                  <h3 className="font-black text-sm text-slate-800 line-clamp-1 uppercase">{pkg.name}</h3>
                  <p className="text-[10px] font-bold text-orange-500 uppercase mt-1">Đầu tư từ: {pkg.investmentFrom.toLocaleString('vi-VN')} đ</p>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3 min-h-[3.3rem]">
                  {pkg.description || 'Chưa có mô tả gói đầu tư này.'}
                </p>
              </div>

              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenPkgModal(pkg)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Sửa gói đầu tư"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePkg(pkg.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Xóa gói"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Add / Edit Package ── */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePkg}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-800 uppercase tracking-wide">
                {editingPkg ? 'Sửa gói đầu tư nhượng quyền' : 'Thêm gói đầu tư nhượng quyền mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsPkgModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tên gói đầu tư *</label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="Ví dụ: MÔ HÌNH XE TAKE AWAY LINH ĐỘNG..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mã loại hình *</label>
                  <select
                    value={pkgModelType}
                    onChange={(e) => setPkgModelType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="EXPRESS">EXPRESS</option>
                    <option value="KIOSK">KIOSK</option>
                    <option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Vốn đầu tư tối thiểu *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={pkgInvestment}
                    onChange={(e) => setPkgInvestment(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mô tả ngắn</label>
                <textarea
                  rows={4}
                  value={pkgDescription}
                  onChange={(e) => setPkgDescription(e.target.value)}
                  placeholder="Mô tả thông tin diện tích tối ưu, cấu hình quầy kệ, trang thiết bị..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-xs font-medium text-slate-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pkgIsActive"
                  checked={pkgIsActive}
                  onChange={(e) => setPkgIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="pkgIsActive" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Kích hoạt hiển thị công khai trên website
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPkgModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={createPkgMutation.isPending || updatePkgMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {(createPkgMutation.isPending || updatePkgMutation.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingPkg ? 'CẬP NHẬT GÓI' : 'TẠO GÓI MỚI'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

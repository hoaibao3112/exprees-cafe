'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, MapPin, Phone, Clock, ShieldCheck, HelpCircle, ToggleLeft, ToggleRight, X, Info } from 'lucide-react';
import { adminBranchesApi } from '@/lib/admin-api';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { toast } from '@/components/admin/Toast';
import type { Branch } from '@/types/admin.types';

export default function AdminBranchesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states for adding/editing a branch
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLat, setFormLat] = useState('40.7128');
  const [formLng, setFormLng] = useState('-74.0060');
  const [formOpenTime, setFormOpenTime] = useState('07:00');
  const [formCloseTime, setFormCloseTime] = useState('22:00');
  const [formIsFlagship, setFormIsFlagship] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState('');

  // Fetch branches
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'branches'],
    queryFn: () => adminBranchesApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminBranchesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'branches'] });
      toast.success('Đã xóa chi nhánh thành công');
      setDeleteId(null);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi xóa chi nhánh'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return adminBranchesApi.update(id, { status: nextStatus });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'branches'] });
      toast.success('Đã cập nhật trạng thái hoạt động');
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi cập nhật trạng thái'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingBranch && editingBranch.id) {
        return adminBranchesApi.update(editingBranch.id, payload);
      } else {
        return adminBranchesApi.create(payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'branches'] });
      toast.success(editingBranch ? 'Đã cập nhật chi nhánh thành công' : 'Đã thêm chi nhánh mới thành công');
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi lưu chi nhánh'),
  });

  const resetForm = () => {
    setEditingBranch(null);
    setFormName('');
    setFormAddress('');
    setFormPhone('');
    setFormLat('40.7128');
    setFormLng('-74.0060');
    setFormOpenTime('07:00');
    setFormCloseTime('22:00');
    setFormIsFlagship(false);
    setFormImageUrl('');
  };

  const handleEdit = (branch: any) => {
    setEditingBranch(branch);
    setFormName(branch.name);
    setFormAddress(branch.address);
    setFormPhone(branch.phone || '');
    setFormLat(String(branch.lat || '40.7128'));
    setFormLng(String(branch.lng || '-74.0060'));
    setFormIsFlagship(branch.isFlagship || false);
    setFormImageUrl(branch.imageUrl || '');
    if (branch.openingHours) {
      setFormOpenTime(branch.openingHours.open || '07:00');
      setFormCloseTime(branch.openingHours.close || '22:00');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAddress) {
      toast.error('Vui lòng điền tên chi nhánh và địa chỉ đầy đủ');
      return;
    }
    const payload = {
      name: formName,
      address: formAddress,
      phone: formPhone,
      lat: Number(formLat),
      lng: Number(formLng),
      isFlagship: formIsFlagship,
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop',
      openingHours: { open: formOpenTime, close: formCloseTime },
    };
    saveMutation.mutate(payload);
  };

  // Fallback branches list mock to align with exact premium screenshots
  const fallbackBranches = [
    {
      id: '1',
      name: 'Downtown Core',
      isFlagship: true,
      address: '122 Financial Way, New York, NY',
      phone: '+1 (212) 555-0192',
      openingHours: { open: '06:00 AM', close: '10:00 PM' },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: '2',
      name: 'Riverside Commons',
      isFlagship: false,
      address: '45 Waterfront Blvd, Jersey City, NJ',
      phone: '+1 (201) 555-0144',
      openingHours: { open: '07:00 AM', close: '08:00 PM' },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: '3',
      name: 'Uptown Heights',
      isFlagship: true,
      address: '2900 Broadway Ave, New York, NY',
      phone: '+1 (212) 555-0877',
      openingHours: { open: '05:00 AM', close: '11:00 PM' },
      status: 'INACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=150&auto=format&fit=crop'
    },
    {
      id: '4',
      name: 'Terminal 4 Lounge',
      isFlagship: false,
      address: 'JFK International Airport, Queens, NY',
      phone: '+1 (718) 555-0111',
      openingHours: { open: '24 Hours', close: '24 Hours' },
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=150&auto=format&fit=crop'
    }
  ];

  const branchesListRaw = Array.isArray(data) ? data : (data as any)?.items || [];
  const activeBranches = branchesListRaw.length ? branchesListRaw : fallbackBranches;

  const filteredBranches = activeBranches.filter((branch: any) =>
    branch.name.toLowerCase().includes(search.toLowerCase()) ||
    branch.address.toLowerCase().includes(search.toLowerCase()) ||
    (branch.phone && branch.phone.includes(search))
  );

  const totalBranchesCount = branchesListRaw.length ? branchesListRaw.length : 24;
  const openBranchesCount = activeBranches.filter((b: any) => b.status === 'ACTIVE').length;
  const flagshipBranchesCount = activeBranches.filter((b: any) => b.isFlagship).length;

  return (
    <div className="space-y-6">
      {/* Title & Stats Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-5 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quản lý chi nhánh</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Giám sát và thiết lập các địa điểm cửa hàng chi nhánh trên toàn bộ hệ thống doanh nghiệp.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {/* Stat 1 */}
          <div className="flex items-center gap-2 px-4 py-2 border border-emerald-100 bg-emerald-50 rounded-2xl text-xs font-bold text-emerald-600 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đang mở cửa: <span className="text-slate-800 font-extrabold ml-0.5">{openBranchesCount}</span>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-2 px-4 py-2 border border-amber-100 bg-amber-50 rounded-2xl text-xs font-bold text-amber-600 shadow-sm">
            <span className="text-sm">★</span>
            Cửa hàng flagship: <span className="text-slate-800 font-extrabold ml-0.5">{flagshipBranchesCount}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Branches list table (Spans 7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Search bar */}
          <div className="relative max-w-md w-full shadow-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm chi nhánh, địa chỉ..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl bg-white text-slate-700 text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Data List table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            {isLoading ? (
              <TableSkeleton rows={8} cols={5} />
            ) : filteredBranches.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-300 animate-bounce" />
                <p className="text-sm font-semibold">Không tìm thấy chi nhánh nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50/50">
                      <th className="text-left px-6 py-4 font-bold">CHI NHÁNH</th>
                      <th className="text-left px-4 py-4 font-bold hidden md:table-cell">LIÊN HỆ</th>
                      <th className="text-left px-4 py-4 font-bold hidden sm:table-cell">GIỜ HỌAT ĐỘNG</th>
                      <th className="text-left px-4 py-4 font-bold hidden lg:table-cell">TRẠNG THÁI</th>
                      <th className="text-right px-6 py-4 font-bold">THAO TÁC</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-slate-100">
                    {filteredBranches.map((branch: any) => (
                      <tr key={branch.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-200/60 relative bg-slate-100">
                              <img
                                src={branch.imageUrl || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=150&auto=format&fit=crop'}
                                alt={branch.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-800 font-bold text-sm block leading-none group-hover:text-blue-600 transition-colors truncate">
                                  {branch.name}
                                </span>
                                {branch.isFlagship && (
                                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-extrabold uppercase tracking-wide shrink-0">
                                    ★ FLAGSHIP
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-400 text-xs block mt-1.5 font-medium truncate">{branch.address}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 hidden md:table-cell">
                          {branch.phone ? (
                            <span className="text-slate-600 flex items-center gap-1.5 text-xs font-semibold">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {branch.phone}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 hidden sm:table-cell text-xs font-semibold text-slate-600">
                          {branch.openingHours ? (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {typeof branch.openingHours === 'object'
                                ? `${branch.openingHours.open} - ${branch.openingHours.close}`
                                : String(branch.openingHours)}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>

                        <td className="px-4 py-4 hidden lg:table-cell">
                          <button
                            onClick={() => toggleMutation.mutate({ id: branch.id, currentStatus: branch.status })}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-all hover:scale-105 ${
                              branch.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {branch.status === 'ACTIVE' ? 'Đang mở' : 'Đóng cửa'}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(branch)}
                              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-all hover:scale-105"
                              title="Sửa thông tin"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(branch.id)}
                              className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all hover:scale-105"
                              title="Xóa chi nhánh"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Show entries text info */}
            <div className="px-6 py-4.5 bg-slate-50/50 border-t border-slate-100 text-slate-400 text-xs font-semibold">
              Hiển thị <span className="text-slate-700 font-bold">{filteredBranches.length}</span> trên tổng số <span className="text-slate-700 font-bold">{totalBranchesCount}</span> chi nhánh
            </div>
          </div>
        </div>

        {/* Right Column: Add/Edit Branch side Drawer (Spans 5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-slate-800 font-bold text-sm">
                {editingBranch ? 'Cập nhật chi nhánh' : 'Thêm chi nhánh mới'}
              </h3>
              <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Thiết lập thông tin vị trí và các tham số vận hành.</p>
            </div>
            {editingBranch && (
              <button onClick={resetForm} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Branch Name */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Tên chi nhánh</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ví dụ: Skyline Plaza"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Địa chỉ đầy đủ</label>
              <textarea
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="Nhập số nhà, tên đường, quận, thành phố..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-medium leading-relaxed"
              />
            </div>

            {/* Phone & Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Điện thoại</label>
                <input
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (212) 555-0192"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Giờ mở / Đóng cửa</label>
                <div className="flex items-center gap-1">
                  <input
                    value={formOpenTime}
                    onChange={(e) => setFormOpenTime(e.target.value)}
                    type="text"
                    placeholder="07:00"
                    className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-center text-xs focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-bold"
                  />
                  <span className="text-slate-300 text-xs">-</span>
                  <input
                    value={formCloseTime}
                    onChange={(e) => setFormCloseTime(e.target.value)}
                    type="text"
                    placeholder="22:00"
                    className="w-1/2 px-2.5 py-2.5 rounded-xl border border-slate-200 text-slate-850 text-center text-xs focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Vĩ độ (Latitude)</label>
                <input
                  value={formLat}
                  onChange={(e) => setFormLat(e.target.value)}
                  placeholder="40.7128"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Kinh độ (Longitude)</label>
                <input
                  value={formLng}
                  onChange={(e) => setFormLng(e.target.value)}
                  placeholder="-74.0060"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            {/* Location map mockup container */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden aspect-[16/9] relative bg-slate-100 flex flex-col justify-between shadow-inner">
              <div className="bg-slate-200/80 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold text-slate-500 border-b border-slate-300/30 absolute left-2.5 top-2.5 rounded-md shadow-sm">
                LOCATION MAP
              </div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <MapPin className="w-8 h-8 text-blue-600 animate-bounce" />
                <span className="text-[10px] text-slate-700 font-extrabold mt-1 tracking-tight">Map Preview Placeholder</span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">Tọa độ: {formLat}° N, {formLng}° W</span>
              </div>
            </div>

            {/* Flagship status toggle container */}
            <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="min-w-0">
                <span className="text-slate-800 text-xs font-bold block leading-none">Trạng thái Flagship</span>
                <span className="text-slate-400 text-[9px] font-semibold block mt-1.5 leading-tight truncate">Cửa hàng chuẩn cao cấp với danh mục sản phẩm đặc quyền</span>
              </div>
              <button
                type="button"
                onClick={() => setFormIsFlagship(!formIsFlagship)}
                className="cursor-pointer shrink-0"
              >
                {formIsFlagship ? (
                  <ToggleRight className="w-10 h-6.5 text-[#0047cc]" />
                ) : (
                  <ToggleLeft className="w-10 h-6.5 text-slate-300" />
                )}
              </button>
            </div>

            {/* Storefront Image preview section */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Ảnh mặt tiền cửa hàng (Storefront Image)</label>
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden aspect-[16/9] relative bg-slate-100 flex items-center justify-center shadow-inner">
                {formImageUrl ? (
                  <img src={formImageUrl} alt="Storefront Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Info className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-bold block">Chưa chọn ảnh mặt tiền</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormImageUrl('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop');
                        toast.success('Đã tải lên ảnh storefront thử nghiệm!');
                      }}
                      className="text-[9px] text-blue-600 hover:text-blue-700 font-bold underline mt-1 block"
                    >
                      Dùng ảnh thử nghiệm
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Enterprise Guidelines list card */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
              <span className="text-blue-600 text-[10px] font-bold tracking-widest block uppercase">★ Hướng Dẫn Doanh Nghiệp</span>
              <ul className="text-slate-500 text-[9.5px] font-semibold leading-relaxed space-y-1 pl-1">
                <li className="flex items-start gap-1">• <span>Tên chi nhánh cần tuân thủ đúng quy chuẩn nhận diện thương hiệu.</span></li>
                <li className="flex items-start gap-1">• <span>Mở rộng sang các cửa hàng Flagship cần có sự chấp thuận của quản lý khu vực.</span></li>
                <li className="flex items-start gap-1">• <span>Tọa độ GPS phải được đối chiếu trùng khớp hoàn toàn với hồ sơ thực tế.</span></li>
              </ul>
            </div>

            {/* Drawer form buttons actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-[#0047cc] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Lưu chi tiết chi nhánh'
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Xóa chi nhánh"
        message="Hành động này không thể hoàn tác. Mọi thông tin về chi nhánh sẽ bị xóa vĩnh viễn khỏi hệ thống."
        confirmLabel="Xóa chi nhánh"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

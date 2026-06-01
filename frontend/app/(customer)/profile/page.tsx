'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAuthQueries } from '../../../hooks/useAuthQueries';
import { useUserQueries, Address } from '../../../hooks/useUserQueries';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Coffee,
  MapPin,
  Award,
  LogOut,
  Save,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, 'Họ và tên không được để trống'),
  phoneNumber: z.string().min(10, 'Số điện thoại không hợp lệ').optional().or(z.literal('')),
});

const addressSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống (ví dụ: Nhà, Công ty)'),
  recipientName: z.string().min(1, 'Tên người nhận không được để trống'),
  phoneNumber: z.string().min(10, 'Số điện thoại người nhận không hợp lệ'),
  street: z.string().min(1, 'Số nhà, tên đường không được để trống'),
  ward: z.string().min(1, 'Phường / Xã không được để trống'),
  district: z.string().min(1, 'Quận / Huyện không được để trống'),
  city: z.string().min(1, 'Tỉnh / Thành phố không được để trống'),
  isDefault: z.boolean().optional(),
});

type ProfileInput = z.infer<typeof profileSchema>;
type AddressInput = z.infer<typeof addressSchema>;

export default function ProfilePage() {
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const { logoutMutation } = useAuthQueries();
  const router = useRouter();

  const {
    updateProfileMutation,
    addressesQuery,
    createAddressMutation,
    updateAddressMutation,
    deleteAddressMutation,
    loyaltyQuery,
  } = useUserQueries(user?.id);

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'loyalty'>('profile');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  // Address form
  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    formState: { errors: addressErrors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      router.push('/login');
    } else if (user) {
      resetProfile({
        name: user.name,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [isAuthenticated, accessToken, user, router, resetProfile]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const onProfileSubmit = async (data: ProfileInput) => {
    setFormError(null);
    try {
      await updateProfileMutation.mutateAsync(data);
      alert('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      setFormError(err.message || 'Cập nhật thất bại.');
    }
  };

  const onAddressSubmit = async (data: AddressInput) => {
    setFormError(null);
    try {
      await createAddressMutation.mutateAsync(data);
      setShowAddAddress(false);
      resetAddress();
    } catch (err: any) {
      setFormError(err.message || 'Thêm địa chỉ thất bại.');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await updateAddressMutation.mutateAsync({
        addressId,
        data: { isDefault: true },
      });
    } catch (err) {
      alert('Không thể đặt làm địa chỉ mặc định');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await deleteAddressMutation.mutateAsync(addressId);
      } catch (err) {
        alert('Xóa địa chỉ thất bại');
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-950 text-zinc-100 font-sans pb-20">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-violet-600/5 blur-[120px] animate-pulse-slow"></div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Express Cafe</span>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </header>

      {/* Hero Banner Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-12 pb-6">
        <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black">{user.name}</h1>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 tracking-wider uppercase">
                  {user.role?.name || 'CUSTOMER'}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>

          {/* Loyalty Highlight Card */}
          <div className="flex items-center gap-4 bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-2xl md:w-80">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Điểm thành viên</p>
              <h2 className="text-3xl font-black text-white mt-0.5">
                {loyaltyQuery.data?.loyaltyPoints ?? user.loyaltyPoints}{' '}
                <span className="text-sm font-semibold text-indigo-400">đoạt được</span>
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Main Panel grid */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mt-6">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-5 h-5" />
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'addresses'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Sổ địa chỉ
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-3 h-12 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'loyalty'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'hover:bg-white/5 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-5 h-5" />
            Lịch sử điểm thưởng
          </button>
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-3">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-xl font-black mb-6">Cập nhật thông tin cá nhân</h2>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">Họ và tên</label>
                    <input
                      type="text"
                      {...registerProfile('name')}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                    {profileErrors.name && (
                      <span className="text-xs text-rose-400 pl-1">{profileErrors.name.message}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">Số điện thoại</label>
                    <input
                      type="text"
                      {...registerProfile('phoneNumber')}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    />
                    {profileErrors.phoneNumber && (
                      <span className="text-xs text-rose-400 pl-1">{profileErrors.phoneNumber.message}</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-2 px-6 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl transition-all shadow-lg"
                  >
                    {updateProfileMutation.isPending ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black">Danh sách địa chỉ giao hàng</h2>
                {!showAddAddress && (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="flex items-center gap-2 px-4 h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm địa chỉ mới
                  </button>
                )}
              </div>

              {/* Add Address Form block */}
              {showAddAddress && (
                <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20">
                  <h3 className="font-extrabold text-base mb-4">Thêm địa chỉ giao hàng mới</h3>
                  <form onSubmit={handleAddressSubmit(onAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tên địa chỉ</label>
                        <input
                          type="text"
                          placeholder="ví dụ: Nhà riêng, Công ty"
                          {...registerAddress('title')}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Người nhận</label>
                        <input
                          type="text"
                          placeholder="Họ và tên người nhận"
                          {...registerAddress('recipientName')}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số điện thoại</label>
                        <input
                          type="text"
                          placeholder="Số điện thoại nhận hàng"
                          {...registerAddress('phoneNumber')}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Số nhà, tên đường</label>
                        <input
                          type="text"
                          placeholder="Địa chỉ số nhà, tên đường"
                          {...registerAddress('street')}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Phường / Xã</label>
                        <input
                          type="text"
                          placeholder="Tên Phường, Xã"
                          {...registerAddress('ward')}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quận / Huyện</label>
                        <input
                          type="text"
                          placeholder="Tên Quận, Huyện"
                          {...registerAddress('district')}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tỉnh / Thành phố</label>
                        <input
                          type="text"
                          placeholder="Tên Tỉnh, Thành phố"
                          {...registerAddress('city')}
                          className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-4 h-10 border border-white/10 bg-transparent text-sm font-semibold rounded-xl hover:bg-white/5 transition-all"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={createAddressMutation.isPending}
                        className="flex items-center gap-2 px-5 h-10 bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white rounded-xl transition-all"
                      >
                        {createAddressMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          'Thêm mới'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Address List */}
              {addressesQuery.isLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : !addressesQuery.data || addressesQuery.data.length === 0 ? (
                <div className="glass-panel p-8 text-center rounded-3xl text-zinc-400 text-sm">
                  Chưa có địa chỉ giao hàng nào được lưu.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {addressesQuery.data.map((address: Address) => (
                    <div
                      key={address.id}
                      className={`glass-panel p-6 rounded-2xl border transition-all ${
                        address.isDefault ? 'border-indigo-500/30 bg-indigo-600/5' : 'border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm tracking-wider uppercase bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                              {address.title}
                            </span>
                            {address.isDefault && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                <Check className="w-3 h-3" />
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-white text-base mt-3">
                            {address.recipientName} <span className="text-zinc-500 font-medium">| {address.phoneNumber}</span>
                          </p>
                          <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                            {address.street}, {address.ward}, {address.district}, {address.city}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="px-3 py-1.5 text-xs font-semibold border border-white/10 rounded-lg hover:bg-indigo-600/10 hover:border-indigo-500/20 hover:text-indigo-300 transition-all"
                            >
                              Đặt mặc định
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-2 border border-white/10 rounded-lg hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all text-zinc-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loyalty History Tab */}
          {activeTab === 'loyalty' && (
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-xl font-black mb-6">Lịch sử giao dịch điểm thưởng</h2>
              
              {loyaltyQuery.isLoading ? (
                <div className="flex justify-center py-10">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : !loyaltyQuery.data || loyaltyQuery.data.history.length === 0 ? (
                <div className="text-center text-zinc-400 text-sm py-8">
                  Chưa có lịch sử giao dịch điểm thành viên nào.
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {loyaltyQuery.data.history.map((tx, idx) => (
                      <li key={tx.id}>
                        <div className="relative pb-8">
                          {idx !== loyaltyQuery.data.history.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/5" aria-hidden="true"></span>
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-950 ${
                                tx.points > 0 ? 'bg-indigo-600/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {tx.points > 0 ? <ArrowUpRight className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-zinc-300 font-bold">{tx.description}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {new Date(tx.createdAt).toLocaleDateString('vi-VN')} {new Date(tx.createdAt).toLocaleTimeString('vi-VN')}
                                </p>
                              </div>
                              <div className="text-right whitespace-nowrap text-sm">
                                <span className={`font-extrabold text-base ${tx.points > 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                                  {tx.points > 0 ? `+${tx.points}` : tx.points}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

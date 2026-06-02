'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, MailOpen, Search, Eye, Calendar, Phone, User, CheckCircle, Trash2, Clock } from 'lucide-react';
import { adminContactsApi } from '@/lib/admin-api';
import { TableSkeleton } from '@/components/admin/Skeleton';
import { toast } from '@/components/admin/Toast';

export default function AdminContactsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [selectedContact, setSelectedContact] = useState<any | null>(null);

  // Fetch contacts
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'contacts'],
    queryFn: () => adminContactsApi.getAll(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminContactsApi.markRead(id),
    onSuccess: () => {
      // Invalidate contacts lists and general admin layout to refresh badge counts!
      qc.invalidateQueries({ queryKey: ['admin', 'contacts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success('Đã đánh dấu xử lý liên hệ');
    },
    onError: (err: Error) => toast.error(err.message || 'Lỗi khi xử lý liên hệ'),
  });

  // Handle both array and wrapped items responses
  const contactsList = Array.isArray(data)
    ? data
    : (data as any)?.items || [];

  // Filter contacts locally
  const filteredContacts = contactsList
    .filter((c: any) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)) ||
        c.message.toLowerCase().includes(search.toLowerCase());

      if (filterRead === 'UNREAD') return matchSearch && !c.isRead;
      if (filterRead === 'READ') return matchSearch && c.isRead;
      return matchSearch;
    })
    // Newest contacts first
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenContact = (contact: any) => {
    setSelectedContact(contact);
    if (!contact.isRead) {
      markReadMutation.mutate(contact.id);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
          {/* Search bar */}
          <div className="relative flex-1 max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên, email, nội dung..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100/60 border border-slate-200/85 self-start shadow-sm">
            <button
              onClick={() => setFilterRead('ALL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterRead === 'ALL'
                  ? 'bg-white text-blue-600 shadow border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({contactsList.length})
            </button>
            <button
              onClick={() => setFilterRead('UNREAD')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterRead === 'UNREAD'
                  ? 'bg-white text-blue-600 shadow border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Chưa đọc ({contactsList.filter((c: any) => !c.isRead).length})
            </button>
            <button
              onClick={() => setFilterRead('READ')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterRead === 'READ'
                  ? 'bg-white text-blue-600 shadow border border-slate-200/40'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đã đọc ({contactsList.filter((c: any) => c.isRead).length})
            </button>
          </div>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <TableSkeleton rows={10} cols={5} />
        ) : filteredContacts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30 animate-bounce text-slate-300" />
            <p className="text-sm font-semibold">Không tìm thấy yêu cầu liên hệ nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/50">
                  <th className="text-left px-5 py-3.5 font-bold">Khách hàng</th>
                  <th className="text-left px-4 py-3.5 font-bold">Lời nhắn</th>
                  <th className="text-left px-4 py-3.5 font-bold hidden sm:table-cell">Ngày gửi</th>
                  <th className="text-left px-4 py-3.5 font-bold hidden md:table-cell">Trạng thái</th>
                  <th className="text-right px-5 py-3.5 font-bold">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((contact: any) => (
                  <tr
                    key={contact.id}
                    onClick={() => handleOpenContact(contact)}
                    className={`hover:bg-slate-50/60 cursor-pointer transition-colors group ${
                      !contact.isRead ? 'bg-blue-50/15' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          !contact.isRead
                            ? 'bg-blue-50 border-blue-100 text-blue-600 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-sm block truncate group-hover:text-blue-600 transition-colors ${
                            !contact.isRead ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'
                          }`}>
                            {contact.name}
                          </span>
                          <span className="text-slate-400 text-xs block truncate mt-0.5">{contact.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs block line-clamp-1 leading-relaxed ${
                        !contact.isRead ? 'text-slate-800 font-semibold' : 'text-slate-400'
                      }`}>
                        {contact.message}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 hidden sm:table-cell text-xs font-medium">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                        !contact.isRead
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {!contact.isRead ? 'Chưa đọc' : 'Đã xử lý'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 group-hover:text-blue-600 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedContact(null)}
          />
          {/* Dialog */}
          <div className="relative z-10 bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 w-full max-w-xl mx-4 animate-[scaleIn_0.2s_cubic-bezier(0.22,1,0.36,1)] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-150 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-slate-800 font-extrabold text-base leading-none">{selectedContact.name}</h3>
                  <span className="text-slate-400 text-xs mt-1.5 block">{selectedContact.email}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-5 overflow-y-auto space-y-4 flex-1">
              {/* Info panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Số điện thoại</span>
                    <span className="text-slate-800 text-xs font-semibold">{selectedContact.phone || 'Chưa cung cấp'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-bold">Ngày gửi</span>
                    <span className="text-slate-800 text-xs font-semibold">{formatDate(selectedContact.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Message text */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nội dung tin nhắn</span>
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[120px] font-medium">
                  {selectedContact.message}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-150 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-450 italic font-medium">Tự động đánh dấu đã đọc khi xem tin</span>
              <button
                onClick={() => setSelectedContact(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

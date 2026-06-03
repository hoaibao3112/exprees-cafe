'use client';

import { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { adminMediaApi } from '@/lib/admin-api';
import { resolveUploadUrl } from '@/lib/api';
import { toast } from '@/components/admin/Toast';

interface ImageUploaderProps {
  /** Current image URL or path */
  value: string;
  /** Called when image URL changes (from upload or URL paste) */
  onChange: (url: string) => void;
  /** Aspect ratio class, e.g. "aspect-[4/3]" or "aspect-video" */
  aspect?: string;
  /** Label displayed above the uploader */
  label?: string;
  /** Helper text below */
  hint?: string;
  /** Allow removing the image */
  allowRemove?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  aspect = 'aspect-[4/3]',
  label,
  hint,
  allowRemove = true,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const res = await adminMediaApi.upload(file);
      if (res?.cdnUrl) {
        onChange(res.cdnUrl);
        toast.success('Tải lên ảnh thành công!');
      } else {
        throw new Error('Đường dẫn ảnh trống');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải ảnh lên server';
      toast.error(message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleUrlConfirm = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setUrlInputValue('');
    }
    setShowUrlInput(false);
  };

  const resolvedSrc = value ? resolveUploadUrl(value) : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
          {label}
        </label>
      )}

      {/* Image Preview Area */}
      <div className={`relative ${aspect} w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 transition-all group`}>
        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
            <span className="text-xs font-bold text-slate-500">Đang tải lên...</span>
          </div>
        ) : resolvedSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedSrc}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl shadow-lg hover:bg-slate-100 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Thay ảnh
              </button>
              {allowRemove && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-rose-600 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              )}
            </div>
          </>
        ) : (
          /* Empty state — click to upload */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer"
          >
            <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
            <span className="text-xs font-bold">Nhấn để chọn ảnh</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5">PNG, JPG, WEBP tối đa 10MB</span>
          </button>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-2">
        {/* Upload from computer */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          Tải ảnh từ máy tính
        </button>

        {/* Paste URL toggle */}
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl transition-all cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Dán đường dẫn URL
        </button>
      </div>

      {/* URL input (collapsed by default) */}
      {showUrlInput && (
        <div className="flex gap-2 items-center animate-in slide-in-from-top-1 duration-150">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlConfirm())}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            autoFocus
          />
          <button
            type="button"
            onClick={handleUrlConfirm}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Dùng URL
          </button>
          <button
            type="button"
            onClick={() => { setShowUrlInput(false); setUrlInputValue(''); }}
            className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {hint && (
        <p className="text-[10px] text-slate-400 font-semibold">{hint}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MultiImageUploader — for pages that support multiple images (services, franchise)
// ─────────────────────────────────────────────────────────────────────────────

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

export function MultiImageUploader({
  images,
  onChange,
  maxImages = 4,
  label,
}: MultiImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, targetIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 10MB');
      return;
    }

    setUploadingIndex(targetIndex);
    try {
      const res = await adminMediaApi.upload(file);
      if (res?.cdnUrl) {
        const updated = [...images];
        if (targetIndex >= updated.length) {
          updated.push(res.cdnUrl);
        } else {
          updated[targetIndex] = res.cdnUrl;
        }
        onChange(updated.filter((img) => img.trim() !== ''));
        toast.success('Tải lên ảnh thành công!');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải ảnh';
      toast.error(message);
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  const handleRemove = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated.length > 0 ? updated : []);
  };

  const handleUrlChange = (idx: number, val: string) => {
    const updated = [...images];
    updated[idx] = val;
    onChange(updated);
  };

  const addSlot = () => {
    if (images.length < maxImages) {
      onChange([...images, '']);
    }
  };

  const slots = images.length === 0 ? [''] : images;

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
            {label}
          </label>
          {slots.length < maxImages && (
            <button
              type="button"
              onClick={addSlot}
              className="text-[10px] text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider"
            >
              + Thêm ảnh
            </button>
          )}
        </div>
      )}

      <div className="space-y-2.5">
        {slots.map((img, idx) => {
          const resolved = img ? resolveUploadUrl(img) : '';
          const isUploading = uploadingIndex === idx;

          return (
            <div key={idx} className="flex gap-2 items-center group">
              {/* Thumbnail */}
              <div className="relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : resolved ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resolved} alt={`img-${idx + 1}`} className="w-full h-full object-cover" />
                  </>
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>

              {/* URL text input */}
              <input
                type="text"
                placeholder="Nhập URL hoặc tải lên từ máy tính..."
                value={img}
                onChange={(e) => handleUrlChange(idx, e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-xs text-slate-700 font-medium"
              />

              {/* Upload button */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`multi-upload-${idx}`}
                onChange={(e) => handleFileChange(e, idx)}
              />
              <label
                htmlFor={`multi-upload-${idx}`}
                className="flex items-center gap-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm shadow-blue-500/20"
                title="Tải ảnh từ máy tính"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tải lên</span>
              </label>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-2.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all cursor-pointer shrink-0"
                title="Xóa ảnh"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {slots.length < maxImages && (
        <button
          type="button"
          onClick={addSlot}
          className="w-full py-2.5 border border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-400 hover:text-blue-600 text-xs font-bold rounded-xl transition-all"
        >
          + Thêm ảnh ({slots.length}/{maxImages})
        </button>
      )}

      {/* Hidden ref for programmatic trigger */}
      <input ref={fileInputRef} type="file" className="hidden" />
    </div>
  );
}

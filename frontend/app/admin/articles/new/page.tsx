'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { adminArticlesApi } from '@/lib/admin-api';
import { toast } from '@/components/admin/Toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ImageUploader } from '@/components/admin/ImageUploader';

// Helper slugify tiếng Việt chuẩn
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const articleSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  slug: z.string().min(1, 'Slug không được để trống').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  blogHandle: z.enum(['news', 'blog', 'services'] as const, {
    message: 'Danh mục không hợp lệ',
  }),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').or(z.literal('')).optional(),
  content: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
  status: z.enum(['DRAFT', 'PUBLISHED'] as const),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
      {error && <p className="text-rose-500 text-xs font-semibold mt-0.5">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium';

export default function AdminNewArticlePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAdminAuth();

  const [isSlugManual, setIsSlugManual] = useState(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      slug: '',
      blogHandle: 'news',
      imageUrl: '',
      content: '',
      status: 'PUBLISHED',
    },
  });

  const titleValue = watch('title');
  const imageUrlValue = watch('imageUrl') ?? '';
  const contentValue = watch('content');

  // Tự động generate slug từ tiêu đề
  useEffect(() => {
    if (!isSlugManual && titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isSlugManual, setValue]);

  const createMutation = useMutation({
    mutationFn: (values: ArticleFormValues) => {
      const payload = {
        title: values.title,
        slug: values.slug,
        blogHandle: values.blogHandle,
        imageUrl: values.imageUrl || undefined,
        contentHtml: values.content,
        status: values.status,
        authorId: user?.id || 'system',
      };
      return adminArticlesApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      toast.success('Đã tạo bài viết thành công!');
      router.push('/admin/articles');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Có lỗi xảy ra khi tạo bài viết');
    },
  });

  const onSubmit = (values: ArticleFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tạo bài viết mới</h2>
            <p className="text-slate-400 text-xs mt-0.5">Thêm tin tức, blog hoặc dịch vụ của Express Cafe</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm"
        >
          {previewMode ? (
            <><EyeOff className="w-4 h-4" /> Soạn thảo</>
          ) : (
            <><Eye className="w-4 h-4" /> Xem trước</>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Pane */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
            {/* Title */}
            <Field label="Tiêu đề bài viết" error={errors.title?.message}>
              <input
                {...register('title')}
                placeholder="Nhập tiêu đề hấp dẫn..."
                className={inputCls + ' text-base font-semibold'}
              />
            </Field>

            {/* Slug */}
            <Field label="Đường dẫn tĩnh (Slug)" error={errors.slug?.message}>
              <div className="flex justify-end mb-1">
                <button
                  type="button"
                  onClick={() => setIsSlugManual(!isSlugManual)}
                  className="text-orange-500 text-[10px] font-bold hover:text-orange-600 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  {isSlugManual ? 'Tự động tạo theo tiêu đề' : 'Tự chỉnh sửa tay'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">/blog/</span>
                <input
                  {...register('slug')}
                  disabled={!isSlugManual}
                  placeholder="tieu-de-bai-viet"
                  className={`${inputCls} pl-[56px] disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
            </Field>

            {/* Content */}
            <Field label="Nội dung bài viết (HTML / Text)" error={errors.content?.message}>
              {previewMode ? (
                <div className="min-h-[350px] max-h-[600px] overflow-y-auto px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 prose max-w-none">
                  {contentValue ? (
                    <div dangerouslySetInnerHTML={{ __html: contentValue }} />
                  ) : (
                    <p className="text-slate-400 text-sm italic">Chưa có nội dung để xem trước.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    {...register('content')}
                    placeholder="Viết nội dung bài viết bằng mã HTML hoặc văn bản thường tại đây..."
                    rows={15}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-mono text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Hỗ trợ thẻ HTML: &lt;p&gt;, &lt;h1&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt;...</span>
                    <span>Tối thiểu 10 ký tự</span>
                  </div>
                </div>
              )}
            </Field>
          </div>
        </div>

        {/* Sidebar Settings Pane */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
            <h3 className="text-slate-800 font-bold text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Thiết lập bài viết
            </h3>

            {/* Category */}
            <Field label="Danh mục hiển thị" error={errors.blogHandle?.message}>
              <select
                {...register('blogHandle')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="news">Tin tức</option>
                <option value="blog">Blog</option>
                <option value="services">Dịch vụ F&B</option>
              </select>
            </Field>

            {/* Status */}
            <Field label="Trạng thái phát hành">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('status', 'DRAFT')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'DRAFT'
                      ? 'bg-yellow-50 border-yellow-400 text-yellow-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Bản nháp
                </button>
                <button
                  type="button"
                  onClick={() => setValue('status', 'PUBLISHED')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'PUBLISHED'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Công bố
                </button>
              </div>
            </Field>

            {/* Image Upload */}
            <ImageUploader
              label="Ảnh đại diện bài viết"
              value={imageUrlValue}
              onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
              aspect="aspect-video"
            />
            {errors.imageUrl && (
              <p className="text-rose-500 text-xs font-semibold -mt-3">{errors.imageUrl.message}</p>
            )}

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu bài viết
              </button>
              <Link
                href="/admin/articles"
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-sm font-semibold transition-all"
              >
                Hủy bỏ
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

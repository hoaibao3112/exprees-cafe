'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, EyeOff, Sparkles, Image as ImageIcon } from 'lucide-react';
import { z } from 'zod';
import { adminArticlesApi } from '@/lib/admin-api';
import { toast } from '@/components/admin/Toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Helper slugify tiếng Việt chuẩn
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // loại bỏ dấu
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-9\s-]|_)+/g, '') // loại bỏ ký tự đặc biệt
    .replace(/\s+/g, '-') // thay khoảng trắng bằng dấu -
    .replace(/-+/g, '-') // loại bỏ nhiều dấu - liên tiếp
    .trim();
}

const articleSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  slug: z.string().min(1, 'Slug không được để trống').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  blogHandle: z.enum(['news', 'blog', 'services'] as const, {
    errorMap: () => ({ message: 'Danh mục không hợp lệ' }),
  }),
  imageUrl: z.string().url('Đường dẫn ảnh không hợp lệ').or(z.literal('')).optional(),
  content: z.string().min(10, 'Nội dung tối thiểu 10 ký tự'),
  status: z.enum(['DRAFT', 'PUBLISHED'] as const),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

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
  const imageUrlValue = watch('imageUrl');
  const contentValue = watch('content');

  // Tự động generate slug từ tiêu đề
  useEffect(() => {
    if (!isSlugManual && titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: true });
    }
  }, [titleValue, isSlugManual, setValue]);

  const createMutation = useMutation({
    mutationFn: (values: ArticleFormValues) => {
      // Backend expects 'contentHtml'
      const payload = {
        title: values.title,
        slug: values.slug,
        blogHandle: values.blogHandle,
        imageUrl: values.imageUrl || undefined,
        contentHtml: values.content, // Map content sang contentHtml cho backend
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
      <div className="flex items-center justify-between border-b border-white/6 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-xl bg-white/5 border border-white/6 hover:bg-white/10 hover:text-white text-gray-400 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white">Tạo bài viết mới</h2>
            <p className="text-gray-500 text-xs mt-0.5">Thêm tin tức, blog hoặc dịch vụ của Express Cafe</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-300 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all"
          >
            {previewMode ? (
              <>
                <EyeOff className="w-4 h-4" /> Soạn thảo
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> Xem trước
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Pane */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#13131f] border border-white/6 rounded-2xl p-6 space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Tiêu đề bài viết</label>
              <input
                {...register('title')}
                placeholder="Nhập tiêu đề hấp dẫn..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all font-medium text-base"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Đường dẫn tĩnh (Slug)</label>
                <button
                  type="button"
                  onClick={() => setIsSlugManual(!isSlugManual)}
                  className="text-orange-400 text-xs font-semibold hover:text-orange-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  {isSlugManual ? 'Tự động tạo theo tiêu đề' : 'Tự chỉnh sửa tay'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm">/blog/</span>
                <input
                  {...register('slug')}
                  disabled={!isSlugManual}
                  placeholder="tieu-de-bai-viet"
                  className="w-full pl-[56px] pr-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
              )}
            </div>

            {/* Content Field */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Nội dung bài viết (HTML / Text)</label>
              
              {previewMode ? (
                <div className="min-h-[350px] max-h-[600px] overflow-y-auto px-4 py-3.5 rounded-xl bg-white/3 border border-white/6 text-gray-200 prose prose-invert max-w-none prose-orange">
                  {contentValue ? (
                    <div dangerouslySetInnerHTML={{ __html: contentValue }} />
                  ) : (
                    <p className="text-gray-600 text-sm italic">Chưa có nội dung để xem trước.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    {...register('content')}
                    placeholder="Viết nội dung bài viết bằng mã HTML hoặc văn bản thường tại đây..."
                    rows={15}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all font-mono text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-gray-600 text-xs">
                    <span>Hỗ trợ thẻ HTML chuẩn như &lt;p&gt;, &lt;h1&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt;...</span>
                    <span>Tối thiểu 10 ký tự</span>
                  </div>
                </div>
              )}
              {errors.content && (
                <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings Pane */}
        <div className="space-y-5">
          <div className="bg-[#13131f] border border-white/6 rounded-2xl p-5 space-y-5">
            <h3 className="text-white font-bold text-sm pb-3 border-b border-white/6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Thiết lập bài viết
            </h3>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Danh mục hiển thị</label>
              <select
                {...register('blogHandle')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-gray-300 text-sm focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
              >
                <option value="news">Tin tức</option>
                <option value="blog">Blog</option>
                <option value="services">Dịch vụ F&B</option>
              </select>
              {errors.blogHandle && (
                <p className="text-red-500 text-xs mt-1">{errors.blogHandle.message}</p>
              )}
            </div>

            {/* Status selection */}
            <div className="space-y-2">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Trạng thái phát hành</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('status', 'DRAFT')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'DRAFT'
                      ? 'bg-yellow-500/15 border-yellow-500/50 text-yellow-400 shadow-md shadow-yellow-500/5'
                      : 'bg-white/3 border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  Bản nháp (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => setValue('status', 'PUBLISHED')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    watch('status') === 'PUBLISHED'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/5'
                      : 'bg-white/3 border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  Công bố (Publish)
                </button>
              </div>
            </div>

            {/* Image URL input & Live Preview */}
            <div className="space-y-3">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Ảnh đại diện bài viết</label>
              <input
                {...register('imageUrl')}
                placeholder="Nhập link ảnh (URL)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
              />
              {imageUrlValue ? (
                <div className="relative aspect-video rounded-xl border border-white/6 overflow-hidden bg-white/3 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrlValue}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/8 rounded-xl bg-white/2 text-gray-600">
                  <ImageIcon className="w-8 h-8 opacity-30 mb-2" />
                  <span className="text-xs">Chưa có ảnh đại diện</span>
                </div>
              )}
              {errors.imageUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>
              )}
            </div>

            {/* Action buttons */}
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
                className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-gray-400 hover:text-white hover:bg-white/10 text-sm font-semibold transition-all"
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

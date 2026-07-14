import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-zinc-50">
      <h1 className="text-6xl font-black text-zinc-900">404</h1>
      <p className="text-lg text-zinc-650 mt-4 font-semibold">Không tìm thấy trang yêu cầu.</p>
      <Link href="/" className="mt-6 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-sm transition-all shadow-md shadow-orange-500/10">
        Quay lại Trang chủ
      </Link>
    </div>
  );
}

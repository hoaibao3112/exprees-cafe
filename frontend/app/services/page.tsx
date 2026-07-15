import type { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
  title: 'Các dịch vụ & Giải pháp F&B | Express Cafe',
  description: 'Express Cafe cung cấp các dịch vụ giải pháp F&B chuyên nghiệp, thiết kế setup quán, cung cấp nguyên liệu sạch và chuyển giao công nghệ quản lý vận hành chuỗi.',
};

export default function ServicesPage() {
  return <ServicesClient />;
}

import type { Metadata } from 'next';
import ServiceDetailClient from './ServiceDetailClient';

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await props.params;
  const id = resolvedParams.id;
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  
  try {
    const res = await fetch(`${baseUrl}/services/${id}`, {
      next: { revalidate: 60 } // revalidate cache every minute
    });
    if (!res.ok) throw new Error('Failed to fetch service');
    
    const json = await res.json();
    const service = json?.data;
    
    if (!service) {
      return {
        title: 'Chi tiết dịch vụ | Express Cafe',
        description: 'Dịch vụ chuyên nghiệp từ Express Cafe.'
      };
    }

    const cleanDesc = service.description ? stripHtml(service.description).slice(0, 160) : 'Dịch vụ chuyên nghiệp từ Express Cafe.';
    
    return {
      title: `${service.name} | Express Cafe`,
      description: cleanDesc,
      openGraph: {
        title: `${service.name} | Express Cafe`,
        description: cleanDesc,
        images: service.imageUrl ? [service.imageUrl] : []
      }
    };
  } catch (error) {
    console.error('Error generating metadata for service:', error);
    return {
      title: 'Chi tiết dịch vụ | Express Cafe',
      description: 'Dịch vụ chuyên nghiệp từ Express Cafe.'
    };
  }
}

export default async function ServiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const resolvedParams = await props.params;
  const id = resolvedParams.id;
  return <ServiceDetailClient id={id} />;
}

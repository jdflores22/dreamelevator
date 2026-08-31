import { Link } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import { isSocialLinkVisible } from '@/utils/socialLinks';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { cn } from '@/utils/cn';

export function StickyCta() {
  const { get } = useSiteSettingsMap();
  const whatsapp = get('social_whatsapp', '');
  const showWhatsapp = isSocialLinkVisible(whatsapp, get('social_whatsapp_enabled', 'true'));
  const calendly = get('calendly_url', '');

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 flex flex-col items-end gap-2">
      {showWhatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
        </a>
      )}
      <Link
        to={calendly || '/contact'}
        target={calendly ? '_blank' : undefined}
        rel={calendly ? 'noopener noreferrer' : undefined}
        className={cn(
          'inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-primary-900 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-800 hover:shadow-xl',
          'w-12 px-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5',
        )}
        aria-label={calendly ? 'Book a call' : 'Get a quote'}
      >
        <Phone className="h-4 w-4" />
        <span className="hidden sm:inline">{calendly ? 'Book a call' : 'Get a quote'}</span>
      </Link>
    </div>
  );
}

import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/site';
import { getManyContent, instagramUrl } from '@/lib/utils';

export default async function Footer() {
  const contact = await getManyContent([
    'contact.address',
    'contact.phone',
    'contact.email',
    'contact.instagram',
    'contact.facebook',
    'contact.whatsapp',
    'contact.hours',
  ]);

  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-ink-900 bg-ink-950">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-shiroi-700/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-sm"
              />
              <div>
                <div className="font-display text-lg text-ink-50">Karate Casilda</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">
                  Dojo Shiroi Ryu — Shotokan SKIF
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-400">
              Un dojo de karate tradicional donde se cultivan la disciplina, el respeto y la búsqueda
              del carácter a través de la práctica seria del Shotokan.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {contact['contact.instagram'] && (
                <a
                  href={instagramUrl(contact['contact.instagram'])}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="grid h-9 w-9 place-items-center rounded-sm border border-ink-800 text-ink-300 transition hover:border-shiroi-700 hover:text-shiroi-400"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {contact['contact.facebook'] && (
                <a
                  href={contact['contact.facebook']}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="grid h-9 w-9 place-items-center rounded-sm border border-ink-800 text-ink-300 transition hover:border-shiroi-700 hover:text-shiroi-400"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {contact['contact.email'] && (
                <a
                  href={`mailto:${contact['contact.email']}`}
                  aria-label="Email"
                  className="grid h-9 w-9 place-items-center rounded-sm border border-ink-800 text-ink-300 transition hover:border-shiroi-700 hover:text-shiroi-400"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-shiroi-500">Sitio</h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-300">
              {SITE_CONFIG.nav.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-shiroi-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-shiroi-500">
              Contacto
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-ink-300">
              {contact['contact.address'] && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none text-shiroi-600" />
                  <span>{contact['contact.address']}</span>
                </li>
              )}
              {contact['contact.phone'] && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-3.5 w-3.5 flex-none text-shiroi-600" />
                  <span>{contact['contact.phone']}</span>
                </li>
              )}
              {contact['contact.email'] && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-3.5 w-3.5 flex-none text-shiroi-600" />
                  <a
                    href={`mailto:${contact['contact.email']}`}
                    className="hover:text-shiroi-400 transition-colors break-all"
                  >
                    {contact['contact.email']}
                  </a>
                </li>
              )}
              {!contact['contact.address'] && !contact['contact.phone'] && !contact['contact.email'] && (
                <li className="text-ink-500 italic text-xs">Información pendiente de validación</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-ink-900 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center">
          <p>
            © {year} {SITE_CONFIG.name}. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-2">
            <span aria-hidden>空</span>
            <span className="italic">El camino del karate comienza y termina con respeto.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { getManyContent, instagramUrl } from '@/lib/utils';
import SectionHeader from '@/components/sections/SectionHeader';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Información de contacto del Dojo Shiroi Ryu en Casilda, Santa Fe.',
};

export default async function ContactoPage() {
  const contact = await getManyContent([
    'contact.address',
    'contact.phone',
    'contact.email',
    'contact.instagram',
    'contact.facebook',
    'contact.whatsapp',
    'contact.hours',
    'contact.mapsUrl',
    'dojo.schedule',
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Sumate al dojo"
        subtitle="Información práctica, horarios y redes."
      />

      <section className="section">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <SectionHeader
              title="Información"
              description="Toda la información de contacto se administra desde el panel. Si falta algún dato, contactanos directamente."
            />

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ContactCard
                icon={<MapPin className="h-5 w-5" />}
                title="Dirección"
                value={contact['contact.address']}
                placeholder="Dirección pendiente de validación"
                link={contact['contact.mapsUrl'] || undefined}
                linkLabel="Ver en mapa"
              />
              <ContactCard
                icon={<Phone className="h-5 w-5" />}
                title="Teléfono"
                value={contact['contact.phone']}
                placeholder="Teléfono pendiente"
                link={contact['contact.phone'] ? `tel:${contact['contact.phone']}` : undefined}
              />
              <ContactCard
                icon={<Mail className="h-5 w-5" />}
                title="Email"
                value={contact['contact.email']}
                placeholder="Email pendiente"
                link={contact['contact.email'] ? `mailto:${contact['contact.email']}` : undefined}
              />
              <ContactCard
                icon={<MessageCircle className="h-5 w-5" />}
                title="WhatsApp"
                value={contact['contact.whatsapp']}
                placeholder="WhatsApp pendiente"
                link={
                  contact['contact.whatsapp']
                    ? `https://wa.me/${contact['contact.whatsapp'].replace(/[^\d]/g, '')}`
                    : undefined
                }
              />
              <ContactCard
                icon={<Clock className="h-5 w-5" />}
                title="Horarios"
                value={contact['dojo.schedule'] || contact['contact.hours']}
                placeholder="Horarios pendientes de validación"
                multiline
              />
              <ContactCard
                icon={<Instagram className="h-5 w-5" />}
                title="Instagram"
                value={contact['contact.instagram']}
                placeholder="Instagram pendiente"
                link={contact['contact.instagram'] ? instagramUrl(contact['contact.instagram']) : undefined}
                external
              />
              <ContactCard
                icon={<Facebook className="h-5 w-5" />}
                title="Facebook"
                value={contact['contact.facebook']}
                placeholder="Facebook pendiente"
                link={contact['contact.facebook'] || undefined}
                external
              />
            </div>
          </div>

          <aside>
            <div className="card-minimal p-6 lg:sticky lg:top-24">
              <div className="eyebrow">¿Querés entrenar?</div>
              <h3 className="mt-2 font-display text-xl text-ink-100">Sumate al dojo</h3>
              <p className="mt-3 text-sm text-ink-400 leading-relaxed">
                Si te interesa conocer más sobre el dojo, las clases, los horarios o cualquier
                duda, contactanos por el medio que te resulte más cómodo.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink-300">
                <li>• Clases para todas las edades.</li>
                <li>• Sin necesidad de experiencia previa.</li>
                <li>• Primera clase de prueba sin compromiso.</li>
              </ul>
              {contact['contact.whatsapp'] && (
                <a
                  href={`https://wa.me/${contact['contact.whatsapp'].replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-6 w-full"
                >
                  Escribinos por WhatsApp
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {contact['contact.mapsUrl'] && (
        <section className="section border-t border-ink-900">
          <SectionHeader title="Ubicación" />
          <div className="mt-8 aspect-video overflow-hidden rounded-md border border-ink-800">
            <iframe
              src={contact['contact.mapsUrl']}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del dojo"
              className="w-full h-full"
              style={{ border: 0, filter: 'invert(0.92) hue-rotate(180deg) saturate(0.6)' }}
              allowFullScreen
            />
          </div>
        </section>
      )}
    </>
  );
}

function ContactCard({
  icon,
  title,
  value,
  placeholder,
  link,
  linkLabel,
  multiline,
  external,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  placeholder: string;
  link?: string;
  linkLabel?: string;
  multiline?: boolean;
  external?: boolean;
}) {
  return (
    <div className="card-minimal p-5">
      <div className="flex items-center gap-3 text-shiroi-500 mb-2">{icon}<div className="text-xs uppercase tracking-wider text-ink-400">{title}</div></div>
      {value ? (
        <>
          <div className={multiline ? 'text-sm text-ink-200 whitespace-pre-wrap' : 'text-sm text-ink-200 break-words'}>
            {value}
          </div>
          {link && (
            <a
              href={link}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="mt-2 inline-block text-xs text-shiroi-400 hover:text-shiroi-300"
            >
              {linkLabel || title} →
            </a>
          )}
        </>
      ) : (
        <div className="text-xs italic text-ink-500">{placeholder}</div>
      )}
    </div>
  );
}

function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-ink-900 bg-gradient-to-b from-ink-950 to-ink-950 pt-32 pb-16">
      <div className="absolute inset-0 -z-10 opacity-20" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-shiroi-900 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-12 bg-shiroi-600" aria-hidden />
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h1 className="mt-4 h-section text-balance text-ink-50">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-400">{subtitle}</p>
      </div>
    </header>
  );
}

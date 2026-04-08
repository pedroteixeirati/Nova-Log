import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../../lib/utils';
import { NavItem } from '../../../shared/types/common.types';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNavigationSections } from '../config/nav.config';
import { getPathFromNavItem } from '../../../app/router/navigation';

interface SidebarProps {
  activeItem: NavItem;
}

export default function Sidebar({ activeItem }: SidebarProps) {
  const { userProfile } = useAuth();
  const sections = useNavigationSections();
  const navigate = useNavigate();

  const sectionForActiveItem =
    sections.find((section) => section.items.some((item) => item.id === activeItem))?.id || sections[0]?.id;

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((section) => [section.id, section.id === sectionForActiveItem]))
  );

  useEffect(() => {
    if (!sectionForActiveItem) return;
    setOpenSections((current) => ({
      ...Object.fromEntries(sections.map((section) => [section.id, current[section.id] ?? false])),
      [sectionForActiveItem]: true,
    }));
  }, [activeItem, sectionForActiveItem, sections]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden sidebar-glass px-4 py-8 shadow-[32px_0_32px_rgba(26,28,21,0.06)]">
      <div className="mb-10 shrink-0 px-4">
        {userProfile?.tenantLogoUrl ? (
          <div className="flex h-28 items-center justify-start px-1">
            <img
              src={userProfile.tenantLogoUrl}
              alt={`Logo da ${userProfile.tenantName}`}
              className="max-h-full max-w-full object-contain object-left"
            />
          </div>
        ) : (
          <>
            <h1 className="font-headline text-xl font-bold tracking-tighter text-primary">
              {userProfile?.tenantName || 'JP Soft'}
            </h1>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">Plataforma</p>
          </>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <nav className="min-h-0 overflow-y-auto pr-1">
          <div className="rounded-[2rem] p-1">
            <div className="space-y-0.5">
              {sections.map((section, index) => {
                const isOpen = openSections[section.id];
                const hasActiveChild = section.items.some((item) => item.id === activeItem);

                return (
                  <div
                    key={section.id}
                    className={cn('pb-1', index !== sections.length - 1 ? 'mb-1.5 border-b border-outline-variant/10' : '')}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-[1rem] px-3 py-2.5 text-left transition-colors',
                        hasActiveChild ? 'bg-primary-fixed/55 text-on-surface' : 'text-on-surface-variant hover:bg-primary-fixed-dim/15'
                      )}
                    >
                      <section.icon className={cn('h-4 w-4 shrink-0', hasActiveChild ? 'text-primary' : 'text-on-surface-variant')} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em]">{section.label}</p>
                        <p className="mt-0.5 text-[9px] text-on-surface-variant">
                          {section.items.length} item{section.items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', isOpen ? 'rotate-180' : '')} />
                    </button>

                    {isOpen && (
                      <div className="mt-1 space-y-0.5 px-1">
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => navigate(getPathFromNavItem(item.id))}
                            className={cn(
                              'flex min-h-9 w-full items-center gap-2.5 rounded-full px-3.5 py-2 transition-all duration-300',
                              activeItem === item.id
                                ? 'bg-primary text-on-primary font-bold shadow-lg shadow-primary/15'
                                : 'text-on-surface-variant hover:bg-primary-fixed-dim/20'
                            )}
                          >
                            <item.icon className={cn('h-4 w-4 shrink-0', activeItem === item.id ? 'text-on-primary' : 'text-on-surface-variant')} />
                            <span className="font-headline text-[13px] leading-none whitespace-nowrap">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="mt-4 shrink-0 border-t border-outline-variant/10 pt-4" />
      </div>
    </aside>
  );
}

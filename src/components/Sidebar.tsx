import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Truck,
  Users,
  Building2,
  FileText,
  Route,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  User,
} from 'lucide-react';
import { NavItem } from '../types';
import { cn } from '../lib/utils';
import { useFirebase } from '../context/FirebaseContext';
import { canAccess } from '../lib/permissions';
import { logout } from '../firebase';

interface SidebarProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
}

function roleLabel(role?: string) {
  if (!role) return 'Perfil nao carregado';
  switch (role) {
    case 'dev': return 'Desenvolvedor';
    case 'owner': return 'Proprietario';
    case 'admin': return 'Administrador';
    case 'financial': return 'Financeiro';
    case 'operational': return 'Operacional';
    case 'driver': return 'Motorista';
    default: return 'Visualizador';
  }
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const { user, userProfile } = useFirebase();

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, allowed: true },
    { id: 'tenantProfile', label: 'Transportadora', icon: Building2, allowed: canAccess(userProfile, 'tenantProfile', 'read') },
    { id: 'expenses', label: 'Despesas', icon: CreditCard, allowed: canAccess(userProfile, 'expenses', 'read') },
    { id: 'vehicles', label: 'Veiculos', icon: Truck, allowed: canAccess(userProfile, 'vehicles', 'read') },
    { id: 'suppliers', label: 'Fornecedores', icon: Users, allowed: canAccess(userProfile, 'providers', 'read') },
    { id: 'companies', label: 'Empresas', icon: Building2, allowed: canAccess(userProfile, 'companies', 'read') },
    { id: 'contracts', label: 'Contratos', icon: FileText, allowed: canAccess(userProfile, 'contracts', 'read') },
    { id: 'freights', label: 'Fretes', icon: Route, allowed: canAccess(userProfile, 'freights', 'read') },
    { id: 'reports', label: 'Relatorios', icon: BarChart3, allowed: canAccess(userProfile, 'reports', 'read') },
  ].filter((item) => item.allowed);

  const bottomItems = [
    { id: 'settings', label: 'Configuracoes', icon: Settings, allowed: canAccess(userProfile, 'settings', 'read') },
    { id: 'support', label: 'Suporte', icon: HelpCircle, allowed: true },
  ].filter((item) => item.allowed);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 sidebar-glass flex flex-col py-8 px-4 z-50 shadow-[32px_0_32px_rgba(26,28,21,0.06)] overflow-hidden">
      <div className="px-4 mb-10 shrink-0">
        <h1 className="text-xl font-bold text-primary font-headline tracking-tighter">
          {userProfile?.tenantName || 'JP Soft'}
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">Plataforma</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <nav className="flex flex-col gap-1 min-h-0 overflow-y-auto pr-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as NavItem)}
              className={cn(
                'flex min-h-12 shrink-0 items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 group',
                activeItem === item.id
                  ? 'bg-primary-fixed text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-primary-fixed-dim/20'
              )}
            >
              <item.icon className={cn('w-5 h-5 shrink-0', activeItem === item.id ? 'text-primary' : 'text-on-surface-variant')} />
              <span className="font-headline text-sm leading-none whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-4 flex flex-col gap-1 border-t border-outline-variant/10 pt-4 pb-2 shrink-0">
          {bottomItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as NavItem)}
              className={cn(
                'flex min-h-12 items-center gap-3 px-4 py-3 rounded-full transition-all duration-300',
                activeItem === item.id
                  ? 'bg-primary-fixed text-on-surface font-bold'
                  : 'text-on-surface-variant hover:bg-primary-fixed-dim/20'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="font-headline text-sm leading-none whitespace-nowrap">{item.label}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="flex min-h-12 items-center gap-3 px-4 py-3 rounded-full text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-all duration-300 mt-2"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="font-headline text-sm leading-none whitespace-nowrap">Sair</span>
          </button>

          <div className="px-4 mt-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-container overflow-hidden flex items-center justify-center shrink-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">
                {userProfile?.name ||
                 (user?.email?.endsWith('@novalog.test') ? user.email.split('@')[0] : user?.displayName) ||
                 'Usuario'}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">{roleLabel(userProfile?.role)}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

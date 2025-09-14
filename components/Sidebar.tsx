'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { User, Briefcase, CreditCard, Settings, X } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  active?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  onItemClick: (itemId: string) => void;
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({
  items,
  onItemClick,
  className,
  isMobile = false,
  isOpen = true,
  onToggle,
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string>('');

  // Auto-detect active section based on scroll position - TEMPORANEAMENTE DISABILITATO
  // const handleScroll = useCallback(() => {
  //   if (isMobile) return;
  //
  //   const sections = items
  //     .map(item => document.getElementById(item.id))
  //     .filter(Boolean);
  //
  //   let current = '';
  //   sections.forEach(section => {
  //     if (!section) return;
  //
  //     const rect = section.getBoundingClientRect();
  //     if (rect.top <= 100 && rect.bottom >= 100) {
  //       current = section.id;
  //     }
  //   });
  //
  //   if (current && current !== activeItem) {
  //     setActiveItem(current);
  //   }
  // }, [items, activeItem, isMobile]);
  //
  // useEffect(() => {
  //   if (isMobile) return;
  //
  //   window.addEventListener('scroll', handleScroll, { passive: true });
  //   handleScroll(); // Check initial position
  //
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, [handleScroll, isMobile]);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    onItemClick(itemId);

    if (isMobile && onToggle) {
      onToggle();
    }
  };

  const sidebarContent = (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header with toggle button for mobile */}
      {isMobile && (
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-semibold'>Menu</h2>
          <Button variant='ghost' size='sm' onClick={onToggle} className='p-2'>
            <X className='h-5 w-5' />
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className='flex-1 p-4'>
        <ul className='space-y-2'>
          {items.map(item => (
            <li key={item.id}>
              <Button
                variant={activeItem === item.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start text-left',
                  activeItem === item.id
                    ? 'bg-[#333366] hover:bg-[#333366]/90 text-white'
                    : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                )}
                onClick={() => handleItemClick(item.id)}
              >
                <span className='mr-3'>
                  {item.icon && typeof item.icon === 'function'
                    ? React.createElement(item.icon, { className: 'h-5 w-5' })
                    : item.icon}
                </span>
                <span className='truncate'>{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className='p-4 border-t'>
        <div className='text-xs text-gray-500 text-center'>Dashboard Rider</div>
      </div>
    </div>
  );

  // Gestione unificata per desktop e mobile
  if (isMobile) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onToggle}
      >
        <div
          className={cn(
            'fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={e => e.stopPropagation()}
        >
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Desktop: sempre visible su schermi grandi
  return (
    <div className='hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-sm z-30'>
      {sidebarContent}
    </div>
  );
}

// Hook per gestire lo stato della sidebar
export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, toggle, open, close };
}

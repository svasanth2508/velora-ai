import React from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Grid,
  List,
  Layers,
  SlidersHorizontal,
  X,
  Compass,
  Filter
} from 'lucide-react';

export interface FilterTab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface VisualIndexProps {
  title?: string;
  description?: string;
  itemCount?: number;
  itemLabel?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filterTabs?: FilterTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  viewMode?: 'grid' | 'list' | 'compact';
  onViewModeChange?: (mode: 'grid' | 'list' | 'compact') => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const VisualIndex: React.FC<VisualIndexProps> = ({
  title,
  description,
  itemCount,
  itemLabel = 'Items',
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search index...',
  filterTabs,
  activeTab,
  onTabChange,
  viewMode = 'grid',
  onViewModeChange,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title & Stats Bar if provided */}
      {(title || itemCount !== undefined) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {title && (
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
                <span>{title}</span>
                {itemCount !== undefined && (
                  <span className="bg-slate-900 text-white text-xs px-2.5 py-0.5 rounded-full font-mono">
                    {itemCount} {itemLabel}
                  </span>
                )}
              </h3>
              {description && <p className="text-xs text-slate-500 font-medium">{description}</p>}
            </div>
          )}

          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}

      {/* Floating Index Controls Header (Search + Category Filter Chips + View Mode) */}
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-[28px] p-3 shadow-sm sticky top-20 z-30 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input Bar */}
        {onSearchChange !== undefined && (
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs font-bold text-slate-900 rounded-full border border-slate-200/60 focus:border-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Filter Category Chips */}
        {filterTabs && filterTabs.length > 0 && onTabChange && (
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full no-scrollbar py-1">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-extrabold transition-all shrink-0 flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D8F864]' : 'text-slate-500'}`} />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-slate-800 text-[#D8F864]' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* View Density Mode Toggles */}
        {onViewModeChange && (
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full shrink-0">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Render Visual Index Content Grid */}
      <div>{children}</div>
    </div>
  );
};

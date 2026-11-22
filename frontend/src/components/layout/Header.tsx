import { Bell, Settings, Menu, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-dark-surface border-b border-border z-50">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Logo and Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-text-primary hover:text-orange-primary transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-orange-primary flex items-center gap-2">
            <span className="text-2xl">📰</span>
            News Pulse
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            className="text-text-secondary hover:text-orange-primary transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-primary rounded-full" />
          </button>
          <button
            className="text-text-secondary hover:text-orange-primary transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-orange-primary text-white flex items-center justify-center font-medium hover:bg-orange-secondary transition-colors"
            aria-label="User profile"
          >
            <User size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

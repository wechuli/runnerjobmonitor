import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface SidebarProps {
  title?: string;
  onBack?: () => void;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ title, onBack, children }) => {
  return (
    <div className="space-y-4">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full justify-start"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}
      {title && (
        <div className="px-2">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

export default Sidebar;

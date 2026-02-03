import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: React.ElementType;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between animate-fade-in">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 hover:scale-110 transition-transform">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">{description}</p>
        </div>
      </div>
      {children && <div className="flex gap-3 shrink-0">{children}</div>}
    </div>
  );
}

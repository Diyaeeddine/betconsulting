import { LucideIcon } from 'lucide-react';

export type NavItem = {
    title: string;
    href: string;
    icon: LucideIcon; // plus de any
};

export type SharedData = {
  auth: {
    user: {
      id: number;
      name: string;
      role: string;
    };
  };
};


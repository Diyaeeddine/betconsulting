import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const currentUrl = page.url;

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Auto-expand submenu if current URL matches any subitem
  useEffect(() => {
    const initiallyExpanded = items
      .filter(item => item.items?.some(sub => sub.href && currentUrl.startsWith(sub.href)))
      .map(item => item.title);
    setExpandedItems(initiallyExpanded);
  }, [currentUrl, items]);

  const isExpanded = (title: string) => expandedItems.includes(title);

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item: NavItem) => {
          const hasSubItems = item.items && item.items.length > 0;
          const isActive = item.href ? currentUrl.startsWith(item.href) : false;

          return (
            <SidebarMenuItem key={item.title}>
              {hasSubItems ? (
                <>
                  <SidebarMenuButton
                    onClick={() => toggleExpanded(item.title)}
                    className="w-full justify-between group"
                  >
                    <div className="flex items-center">
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-200 ease-in-out ${
                        isExpanded(item.title) ? 'rotate-90' : 'rotate-0'
                      }`}
                    />
                  </SidebarMenuButton>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded(item.title) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.items && (
                      <SidebarMenuSub className="animate-in slide-in-from-top-1">
                        {item.items.map((subItem: NavItem) => {
                          const isSubActive = subItem.href ? currentUrl.startsWith(subItem.href) : false;

                          return (
                            <SidebarMenuSubItem
                              key={subItem.title}
                              className={`transform transition-all duration-200 ease-out hover:translate-x-1 ${
                                isSubActive ? 'bg-gray-100 dark:bg-gray-800 rounded' : ''
                              }`}
                            >
                              <SidebarMenuSubButton asChild isActive={isSubActive}>
                                <Link href={subItem.href || '#'} prefetch>
                                  {subItem.icon && <subItem.icon className="mr-2 h-4 w-4" />}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </div>
                </>
              ) : (
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link href={item.href || '#'} prefetch>
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

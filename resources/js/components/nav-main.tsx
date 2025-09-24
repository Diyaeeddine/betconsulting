import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // Déterminer quels accordions doivent être ouverts par défaut
    const defaultOpenValue = useMemo(() => {
        const currentUrl = page.url;
        const activeItem = items.find((item) => {
            if (item.items) {
                return item.items.some((subItem) => currentUrl.startsWith(subItem.href));
            }
            return false;
        });
        return activeItem?.title || undefined;
    }, [page.url, items]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.items ? (
                        <SidebarMenuItem key={item.title}>
                            <Accordion
                                type="single"
                                collapsible
                                defaultValue={defaultOpenValue === item.title ? item.title : undefined}
                                className="w-full"
                            >
                                <AccordionItem value={item.title} className="border-0">
                                    <AccordionTrigger className="rounded-md px-3 py-2 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:no-underline [&>svg]:ml-1 [&[data-state=open]>svg]:rotate-180">
                                        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium">
                                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="pb-2">
                                        <div className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-3">
                                            {item.items
                                                .filter((subItem) => subItem.href) // Filtrer les items sans href
                                                .map((subItem) => {
                                                    const href = subItem.href as string; // TypeScript sait maintenant que href existe
                                                    const isActive = page.url.startsWith(href);
                                                    return (
                                                        <SidebarMenuItem key={subItem.title}>
                                                            <SidebarMenuButton
                                                                asChild
                                                                isActive={isActive}
                                                                tooltip={{ children: subItem.title }}
                                                                className="w-full"
                                                            >
                                                                <Link
                                                                    href={href}
                                                                    prefetch
                                                                    className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors ${
                                                                        isActive
                                                                            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                                                                            : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                                                                    }`}
                                                                >
                                                                    {subItem.icon && <subItem.icon className="h-3.5 w-3.5 shrink-0" />}
                                                                    <span className="truncate">{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    );
                                                })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </SidebarMenuItem>
                    ) : item.href ? (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={page.url.startsWith(item.href)} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ) : null,
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { type NavItem } from '@/types'
import { Link, usePage } from '@inertiajs/react'
import { Method } from 'node_modules/@inertiajs/core/types/types'
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react'
import { JSX } from 'react/jsx-runtime'

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage()

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Accordion type="single" collapsible key={item.title}>
              <AccordionItem value={item.title}>
                <AccordionTrigger className="flex items-center gap-2 text-sm">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="ml-6 flex flex-col gap-1">
                    {item.items.map((subItem: { title: boolean | Key | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; href: string | { url: string; method: Method }; icon: JSX.IntrinsicAttributes }) => (
                      <SidebarMenuItem key={subItem.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={page.url.startsWith(subItem.href)}
                          tooltip={{ children: subItem.title }}
                        >
                          <Link href={subItem.href} prefetch>
                            {subItem.icon && <subItem.icon className="h-4 w-4" />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={page.url.startsWith(item.href)}
                tooltip={{ children: item.title }}
              >
                <Link href={item.href} prefetch>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}

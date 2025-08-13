// Base types for the application
export interface BreadcrumbItem {
  label: string
  href: string
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface MenuItem {
  label: string
  href: string
  icon?: string
  children?: MenuItem[]
}


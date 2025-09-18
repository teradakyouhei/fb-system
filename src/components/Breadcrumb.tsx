'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav className={`flex ${className}`} aria-label="パンくずリスト">
      <ol className="flex items-center space-x-1 text-sm">
        {/* ホーム */}
        <li>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-700 flex items-center transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">ホーム</span>
          </Link>
        </li>

        {/* パンくずアイテム */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
            {item.current || !item.href ? (
              <span className="font-medium text-gray-900 truncate">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
// Header Component

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Logo } from './Logo';
import { Search, Menu, X } from 'lucide-react';
import { StoreSearchData } from '../lib/types';

interface HeaderProps {
  stores: StoreSearchData[];
}

// Helper to show domain from URL for display
function formatWebsiteDisplay(url: string | undefined): string {
  if (!url || !url.trim()) return '';
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url.length > 32 ? url.slice(0, 29) + '...' : url;
  }
}

// Helper component for search store logos with error handling (compact)
function SearchStoreLogo({ logo, name, size = 'sm' }: { logo: string; name: string; size?: 'sm' | 'md' }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  return (
    <div className={`relative ${dim} rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200`}>
      {imgError || !logo ? (
        <span className={`font-semibold ${textSize} text-gray-600`}>{name.charAt(0)}</span>
      ) : (
        <Image 
          src={logo} 
          alt={name}
          fill
          sizes={size === 'sm' ? '32px' : '40px'}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}

export function Header({ stores }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StoreSearchData[]>([]);
  const [featuredStores, setFeaturedStores] = useState<StoreSearchData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is now only via dropdown - no separate results page
  };

  // Get featured stores from props on mount
  useEffect(() => {
    // Stores passed from wrapper are already filtered to be featured only
    setFeaturedStores(stores);
  }, [stores]);

  // Search stores as user types (async via API)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/stores?search=${encodeURIComponent(searchQuery.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.slice(0, 8)); // Limit to 8 results
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is inside desktop search
      const isInsideDesktop = searchRef.current?.contains(event.target as Node);
      
      // Check if click is inside mobile search (only if mobile menu is open)
      const isInsideMobile = mobileSearchRef.current?.contains(event.target as Node);
      
      // Close if click is outside both areas
      if (!isInsideDesktop && !isInsideMobile) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect scroll for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 border-b border-border ${
      isScrolled ? 'bg-white/80 backdrop-blur-md' : 'bg-background'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Logo className="h-10 w-auto" fillClassName="fill-[#0d2245]" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/magazini"
              className="text-sm text-foreground hover:text-[#5bd72c] transition-colors"
            >
              Магазини
            </Link>
            <Link
              href="/kuponi"
              className="text-sm text-foreground hover:text-[#5bd72c] transition-colors"
            >
              Купони
            </Link>
            <Link
              href="/kategorii"
              className="text-sm text-foreground hover:text-[#5bd72c] transition-colors"
            >
              Категории
            </Link>
          </nav>

          {/* Desktop Search */}
          <div ref={searchRef} className="hidden md:block relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#5bd72c]" />
              <Input
                type="search"
                placeholder="Търси магазини..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="pl-10 w-80"
              />
            </div>

            {/* Search Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Търсене...
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  // Show search results when user has typed
                  searchResults.length > 0 ? (
                    <>
                      <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
                        Магазини
                      </div>
                      <div className="divide-y divide-border">
                        {searchResults.map((store) => (
                          <Link
                            key={store.id}
                            href={`/magazin/${store.slug}`}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-background transition-colors"
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                          >
                            <SearchStoreLogo logo={store.logo} name={store.name} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{store.name}</div>
                              {store.website && (
                                <div className="text-xs text-muted-foreground truncate">{formatWebsiteDisplay(store.website)}</div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      Няма намерени магазини
                    </div>
                  )
                ) : (
                  // Show popular stores when search is empty
                  featuredStores.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
                        Препоръчани магазини
                      </div>
                      <div className="divide-y divide-border">
                        {featuredStores.map((store) => (
                          <Link
                            key={store.id}
                            href={`/magazin/${store.slug}`}
                            className="flex items-center gap-2.5 px-4 py-2 hover:bg-background transition-colors"
                            onClick={() => {
                              setShowDropdown(false);
                              setSearchQuery('');
                            }}
                          >
                            <SearchStoreLogo logo={store.logo} name={store.name} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{store.name}</div>
                              {store.website && (
                                <div className="text-xs text-muted-foreground truncate">{formatWebsiteDisplay(store.website)}</div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Icon & Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              className="p-2 text-[#5bd72c] hover:bg-accent rounded-lg transition-colors"
              onClick={() => {
                setShowDropdown(!showDropdown);
                if (showDropdown) setSearchQuery('');
              }}
              aria-label="Toggle search"
            >
              {showDropdown ? <X className="w-7 h-7" /> : <Search className="w-7 h-7" />}
            </button>
            <button
              className="p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown (outside menu) */}
        {showDropdown && (
          <div ref={mobileSearchRef} className="md:hidden py-4 border-t border-border bg-card -mx-4 px-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-[#5bd72c]" />
              <Input
                type="search"
                placeholder="Търси магазини..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {/* Mobile Search Results Dropdown */}
            <div className="bg-card rounded-lg border border-gray-200 max-h-96 overflow-y-auto touch-auto">
              {isSearching ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Търсене...
                </div>
              ) : searchQuery.trim().length >= 2 ? (
                // Show search results when user has typed
                searchResults.length > 0 ? (
                  <>
                    <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
                      Магазини
                    </div>
                    <div className="divide-y divide-border">
                      {searchResults.map((store) => (
                        <a
                          key={store.id}
                          href={`/magazin/${store.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowDropdown(false);
                            setSearchQuery('');
                            router.push(`/magazin/${store.slug}`);
                          }}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-background transition-colors block cursor-pointer"
                        >
                          <SearchStoreLogo logo={store.logo} name={store.name} size="sm" />
                          <div className="flex-1 min-w-0 pointer-events-none">
                            <div className="text-sm font-medium truncate">{store.name}</div>
                            {store.website && (
                              <div className="text-xs text-muted-foreground truncate">{formatWebsiteDisplay(store.website)}</div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    Няма намерени магазини
                  </div>
                )
              ) : (
                // Show popular stores when search is empty
                featuredStores.length > 0 && (
                  <>
                    <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
                      Препоръчани магазини
                    </div>
                    <div className="divide-y divide-border">
                      {featuredStores.map((store) => (
                        <a
                          key={store.id}
                          href={`/magazin/${store.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setShowDropdown(false);
                            setSearchQuery('');
                            router.push(`/magazin/${store.slug}`);
                          }}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-background transition-colors block cursor-pointer"
                        >
                          <SearchStoreLogo logo={store.logo} name={store.name} size="sm" />
                          <div className="flex-1 min-w-0 pointer-events-none">
                            <div className="text-sm font-medium truncate">{store.name}</div>
                            {store.website && (
                              <div className="text-xs text-muted-foreground truncate">{formatWebsiteDisplay(store.website)}</div>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border bg-card -mx-4 px-4">
            <nav className="flex flex-col gap-3">
              <Link
                href="/magazini"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2 text-sm text-foreground transition-colors hover:text-[#5bd72c]"
              >
                Магазини
              </Link>
              <Link
                href="/kuponi"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2 text-sm text-foreground transition-colors hover:text-[#5bd72c]"
              >
                Купони
              </Link>
              <Link
                href="/kategorii"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left py-2 text-sm text-foreground transition-colors hover:text-[#5bd72c]"
              >
                Категории
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

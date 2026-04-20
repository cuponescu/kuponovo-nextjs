// Coupon Reveal Modal Component - CSS-only (works without JavaScript)

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Copy, Check, ExternalLink, ChevronDown, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { Coupon } from '../lib/types';
import { copyToClipboard, trackEvent, getOutboundUrl, normalizeUrl, decodeHTMLEntities } from '../lib/utils';
import { toast } from 'sonner';
import { voteCoupon } from '../lib/api-client';

interface CouponRevealModalProps {
  coupon: Coupon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponRevealModal({ coupon, open, onOpenChange }: CouponRevealModalProps) {
  const [copied, setCopied] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [votes, setVotes] = useState(coupon.votes);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);
  const [isClient, setIsClient] = useState(false);
  const modalId = `modal-coupon-${coupon.id}`;
  
  // Track client-side mount to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Load saved vote from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVote = localStorage.getItem(`coupon_vote_${coupon.id}`);
      if (savedVote === 'up' || savedVote === 'down') {
        setVoted(savedVote);
      }
    }
  }, [coupon.id]);
  
  // Update votes when coupon changes
  useEffect(() => {
    setVotes(coupon.votes);
  }, [coupon.votes.up, coupon.votes.down]);

  const handleClose = useCallback((e: React.MouseEvent | KeyboardEvent) => {
    if ('preventDefault' in e) {
      e.preventDefault();
    }
    if ('stopPropagation' in e) {
      e.stopPropagation();
    }
    // Remove hash without scrolling to top
    if (typeof window !== 'undefined') {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Update state FIRST to add .hidden class
      onOpenChange(false);
      
      // Remove hash (this removes CSS :target selector match)
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      
      // Force a reflow to ensure CSS :has() selector updates
      void document.documentElement.offsetHeight;
      
      // Ensure scroll is unlocked (CSS should handle it via :has() but ensure it)
      document.documentElement.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow');
      
      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
  }, [onOpenChange]);
  
  // Sync with URL hash for CSS-only functionality (only on client)
  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      const isOpen = window.location.hash === `#${modalId}`;
      if (isOpen !== open) {
        onOpenChange(isOpen);
      }
    };
    
    // Also listen for popstate (browser back/forward)
    const handlePopState = () => {
      handleHashChange();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    
    // Check initial state on mount (after hydration)
    // Small delay to avoid hydration conflicts
    const timeoutId = setTimeout(handleHashChange, 50);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(timeoutId);
    };
  }, [modalId, open, onOpenChange, isClient]);
  
  // Handle Escape key to close modal (only on client)
  useEffect(() => {
    if (!isClient || typeof window === 'undefined' || !open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose(e);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, handleClose, isClient]);
  
  const handleVote = async (type: 'up' | 'down', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent voting if already voted (one vote per coupon total)
    if (voted !== null) {
      toast.info('Вече си гласувал за този купон');
      return;
    }
    
    try {
      const response = await voteCoupon(coupon.id, type);
      
      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Твърде много заявки. Моля, опитай отново след минута.');
          return;
        }
        throw new Error('Failed to vote');
      }
      
      const result = await response.json();
      if (result.success) {
        setVotes(result.votes);
        setVoted(type);
        
        // Save vote to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`coupon_vote_${coupon.id}`, type);
        }
        
        trackEvent({
          event: 'coupon_vote',
          data: {
            coupon_id: coupon.id,
            vote_type: type,
            placement: 'modal',
          },
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Грешка при гласуване');
    }
  };

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return;
    
    if (open && coupon.code) {
      // Track modal open (don't auto-copy to avoid permission prompts)
      trackEvent({
        event: 'coupon_modal_open',
        data: {
          coupon_id: coupon.id,
          store_id: coupon.storeId,
          type: coupon.type,
        },
      });

      // Removed auto-copy to avoid browser permission prompts
      // User can manually click the copy button if they want
      
      // NOTE: Scroll locking is handled by CSS :target selector
      // html:has(.modal-css-only:target:not(.hidden)) { overflow: hidden; }
      // Do NOT set inline styles here as it conflicts with CSS
    }
    
    // Cleanup on unmount - ensure scroll is always enabled
    return () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };
  }, [open, coupon.code, coupon.id, coupon.storeId, coupon.type, isClient]);

  const handleCopy = async (silent = false) => {
    if (!coupon.code) return;

    const success = await copyToClipboard(coupon.code);
    
    if (success) {
      setCopied(true);
      if (!silent) {
        toast.success('Кодът е копиран!', {
          description: 'Кодът е копиран в клипборда.',
        });
      }
      
      trackEvent({
        event: 'coupon_copy',
        data: {
          coupon_id: coupon.id,
        },
      });

      setTimeout(() => setCopied(false), 2000);
    } else {
      // Only show error if user explicitly clicked copy button
      if (!silent) {
        toast.error('Кодът не може да бъде копиран автоматично', {
          description: 'Избери и копирай кода ръчно.',
        });
      }
    }
  };

  const handleGoToStore = () => {
    trackEvent({
      event: 'coupon_cta_click',
      data: {
        coupon_id: coupon.id,
        store_id: coupon.storeId,
        placement: 'modal',
      },
    });
    // Always check affiliate URL first, then fallback to store URL
    // Coupon's affiliateUrl/storeUrl come from the store in WordPress API
    const affiliateUrl = coupon.affiliateUrl && coupon.affiliateUrl.trim() ? normalizeUrl(coupon.affiliateUrl) : '';
    const storeUrl = coupon.storeUrl && coupon.storeUrl.trim() ? normalizeUrl(coupon.storeUrl) : '';
    const targetUrl = affiliateUrl || storeUrl; // Prioritize affiliate URL
    if (targetUrl) {
      fetch('/api/track-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coupon_id: coupon.id }), keepalive: true }).catch(() => {});

      setTimeout(() => {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }, 100);
    }
  };

  const handleOpenNewTab = () => {
    // Always check affiliate URL first, then fallback to store URL
    // Coupon's affiliateUrl/storeUrl come from the store in WordPress API
    const affiliateUrl = coupon.affiliateUrl && coupon.affiliateUrl.trim() ? normalizeUrl(coupon.affiliateUrl) : '';
    const storeUrl = coupon.storeUrl && coupon.storeUrl.trim() ? normalizeUrl(coupon.storeUrl) : '';
    const targetUrl = affiliateUrl || storeUrl; // Prioritize affiliate URL
    if (targetUrl) {
      fetch('/api/track-click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coupon_id: coupon.id }), keepalive: true }).catch(() => {});

      setTimeout(() => {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }, 100);
    }
  };

  // Modal must be in DOM for CSS :target to work without JavaScript
  // IMPORTANT: Let CSS :target handle ALL visibility - don't use inline styles or className toggles
  // This prevents hydration mismatches and ensures CSS scroll lock works correctly
  
  return (
    <div 
      id={modalId}
      className={`modal-css-only ${!isClient || !open ? 'hidden' : ''}`}
      suppressHydrationWarning
    >
      {/* Overlay - clickable to close */}
      <a 
        href="#" 
        className="modal-overlay" 
        aria-label="Close modal"
        onClick={(e) => {
          e.preventDefault();
          handleClose(e);
        }}
      />
      
      {/* Modal Content */}
      <div className="modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="relative z-50 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6">
          {/* Close button */}
          <a 
            href="#"
            className="absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close modal"
            onClick={(e) => {
              e.preventDefault();
              handleClose(e);
            }}
          >
            <X className="w-4 h-4" />
          </a>

          {/* Header */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">
              Твоят код за {coupon.storeName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Кодът може да бъде копиран. Постави го при финализиране на поръчката.
            </p>
          </div>

          <div className="space-y-4">
            {/* Code box */}
            <div className="relative">
              <div className="flex flex-col items-center gap-3 bg-[#5bd72c]/5 border-2 border-[#5bd72c]/20 border-dashed rounded-lg" style={{ paddingTop: '16px', paddingBottom: '16px', paddingLeft: '12px', paddingRight: '12px' }}>
                <code className="font-sans select-all font-black uppercase text-center break-all w-full" style={{ letterSpacing: '0.15rem', fontSize: '1.50rem', lineHeight: '1.75rem' }}>
                  {coupon.code}
                </code>
                <button
                  onClick={() => handleCopy(false)}
                  className="px-4 py-1.5 text-sm font-medium bg-[#5bd72c] text-[#0d2245] rounded-lg hover:bg-[#5ecc2f] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 inline mr-1" />
                      Copiat
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 inline mr-1" />
                      Copiază
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Discount info */}
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {coupon.discount}
              </div>
              <p className="text-sm text-muted-foreground">
                {decodeHTMLEntities(coupon.title)}
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <a 
                href={(coupon.affiliateUrl && coupon.affiliateUrl.trim()) || (coupon.storeUrl && coupon.storeUrl.trim()) || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-foreground rounded-lg font-medium hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoToStore();
                }}
              >
                <ExternalLink className="w-4 h-4" />
                Към {coupon.storeName}
              </a>
            </div>

            {/* Voting */}
            <div>
              {voted !== null ? (
                <p className="text-sm text-center text-muted-foreground">
                  Благодарим за обратната връзка! 🥰
                </p>
              ) : (
                <>
                  <p className="text-sm text-center text-muted-foreground mb-3">
                    Кажи ни дали кодът е работил:
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={(e) => handleVote('up', e)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-[#5bd72c] bg-[#5bd72c]/10 hover:bg-[#5bd72c]/20"
                      aria-label="Vote up"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{votes.up}</span>
                    </button>
                    <button
                      onClick={(e) => handleVote('down', e)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-red-500 bg-red-500/10 hover:bg-red-500/20"
                      aria-label="Vote down"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span className="text-sm font-medium">{votes.down}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Terms & Conditions */}
            {coupon.terms && (
              <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground">
                  <span>Общи условия</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${termsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded-lg">
                    {coupon.terms}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Instagram CTA - placeholder; update href when Kuponovo Instagram account exists */}
            {/* <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100 hover:opacity-80 transition-opacity"
            >
              <Instagram className="w-5 h-5 text-[#5bd72c] flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Последвай <span className="font-medium text-foreground">@kuponovo</span> за нови кодове
              </p>
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
}

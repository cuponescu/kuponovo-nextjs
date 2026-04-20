'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookie_consent')
    if (!accepted) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 z-[100] sm:max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-[#012c3b] rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5 shrink-0 text-[#5bd72c] mt-0.5"
          >
            <path fill="currentColor" d="M21.598 11.064a1.006 1.006 0 0 0-.854-.172A2.938 2.938 0 0 1 20 11a3 3 0 0 1-3-3 2.938 2.938 0 0 1 .108-.744A1.007 1.007 0 0 0 16.168 6.2 4.992 4.992 0 0 1 14 6a3 3 0 0 1-3-3 4.012 4.012 0 0 1 .04-.726A1.003 1.003 0 0 0 9.89 1.158 10.014 10.014 0 0 0 2 11c0 5.523 4.477 10 10 10s10-4.477 10-10a2.59 2.59 0 0 0-.012-.262 1.007 1.007 0 0 0-.39-.674zM8.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-2 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm2-6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          </svg>

          <div className="flex flex-col gap-2.5">
            <p className="text-xs text-white/80 leading-relaxed">
              Използваме бисквитки, за да персонализираме изживяването ти и да анализираме трафика. Виж{' '}
              <Link href="/biskvitki" className="underline font-medium text-white hover:text-[#5bd72c]">
                Политика за бисквитки
              </Link>.
            </p>

            <button
              onClick={handleAccept}
              className="w-full bg-[#5bd72c] hover:bg-[#4bc220] text-[#0d2245] font-medium h-8 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs"
            >
              Съгласен съм
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

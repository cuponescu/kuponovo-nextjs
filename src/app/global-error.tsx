'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Нещо се обърка!</h2>
            <p className="text-muted-foreground mb-6">
              Съжаляваме, възникна грешка. Моля, презаредете страницата.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Опитай отново
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

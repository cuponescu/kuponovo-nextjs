# Testing SSR (Server-Side Rendering)

## The Problem
When JavaScript is disabled, you're seeing a blank page. This shouldn't happen with proper SSR.

## Quick Test Steps

1. **Check what's actually rendered:**
   ```bash
   # Start your Next.js server
   npm run dev
   
   # In another terminal, fetch the page HTML directly (no JS)
   curl http://localhost:3000 > test-output.html
   cat test-output.html
   ```
   
   Look for:
   - Does it contain actual content (store names, coupon titles)?
   - Or is it just empty divs?

2. **Check browser DevTools:**
   - Open DevTools → Network tab
   - Disable JavaScript (Settings → Debugger → Disable JavaScript)
   - Refresh page
   - Check what HTML was received (Response tab)
   - Look for error messages in the HTML

3. **Check Server Logs:**
   - Look at the terminal where `npm run dev` is running
   - Look for API errors, fetch failures, or React errors

## Expected Behavior

With JavaScript **disabled**, you should see:
- ✅ HTML content (store names, coupon titles, etc.)
- ✅ Navigation links (they won't be clickable, but visible)
- ✅ Page structure and layout
- ✅ The green "SSR Working!" debug box

## Current Debug Features Added

I've added debug boxes that will always show:
1. Blue box: Shows data counts (stores, coupons, etc.)
2. Green box: Confirms SSR is working
3. Red box: Shows API errors (if any)

## If Still Blank

The issue might be:
1. **Header/Footer breaking SSR** - They're client components
2. **API failing silently** - Check server logs for errors
3. **Next.js build error** - Run `npm run build` to see errors
4. **Hydration mismatch** - Client/server rendering differently

## Next Steps

1. Run `npm run dev` and check the terminal for errors
2. Visit `http://localhost:3000` with JS disabled
3. View page source (right-click → View Source)
4. Tell me what you see in:
   - The HTML source
   - The browser (blank or content?)
   - The server terminal (any errors?)


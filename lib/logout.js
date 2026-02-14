// lib/logout.js
export async function performLogout() {
  console.log('🚪 Starting logout process...');
  
  try {
    // 1. Call NextAuth signOut
    if (typeof window !== 'undefined') {
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
      console.log('✅ NextAuth signOut completed');
    }

    // 2. Call custom logout API
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('✅ Custom logout API called', await response.json());

    // 3. Aggressive cookie clearing
    const cookies = document.cookie.split(';');
    console.log('📝 Cookies before clearing:', cookies);

    cookies.forEach(cookie => {
      const [name] = cookie.split('=');
      const cookieName = name.trim();
      
      // Try multiple domain/path variations
      const domains = [window.location.hostname, `.${window.location.hostname}`, '', 'localhost'];
      const paths = ['/', '/api', '/admin', '/auth'];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; secure=${window.location.protocol === 'https:'}; samesite=lax`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; secure=${window.location.protocol === 'https:'}; samesite=strict`;
        });
      });
    });

    // 4. Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // 5. Clear IndexedDB (if used)
    if (window.indexedDB) {
      const databases = await window.indexedDB.databases?.() || [];
      databases.forEach(db => {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      });
    }

    // 6. Clear service workers
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    console.log('✅ All storage cleared');
    console.log('📝 Cookies after clearing:', document.cookie);

    // 7. Redirect with cache busting
    window.location.href = '/?t=' + Date.now();
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Force redirect on error
    window.location.href = '/';
  }
}
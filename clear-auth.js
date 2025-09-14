console.log('🧹 Clearing all authentication data...');

// Clear local storage
localStorage.clear();
sessionStorage.clear();

// Clear Supabase-related cookies
document.cookie.split(';').forEach(cookie => {
  const [name] = cookie.split('=');
  if (name.trim().includes('supabase') || name.trim().includes('sb-')) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  }
});

console.log('✅ All authentication data cleared');
console.log('🔄 Redirecting to login page...');

// Force reload to clear all cached data
window.location.href = '/auth/login';

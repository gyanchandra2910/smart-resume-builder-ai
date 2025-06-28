// Test utility to simulate login state
function simulateLogin() {
    const testUser = {
        name: "Test User",
        email: "test@example.com",
        id: "test123"
    };
    
    localStorage.setItem('token', 'test-token-123');
    localStorage.setItem('user', JSON.stringify(testUser));
    
    console.log('Simulated login - refreshing page...');
    window.location.reload();
}

function simulateLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('resumeData');
    
    console.log('Simulated logout - refreshing page...');
    window.location.reload();
}

// Auto-run on load
console.log('Test utilities loaded. Use simulateLogin() or simulateLogout() in console.');

// Check current auth state
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');
console.log('Current auth state:', { token: !!token, user: !!user });

if (user) {
    console.log('Current user:', JSON.parse(user));
}

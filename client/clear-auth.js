// Run this in browser console to clear invalid auth data
console.log("Clearing invalid auth data...");

// Check current data
const token = localStorage.getItem("gh_access_token");
const user = localStorage.getItem("gh_user");

console.log("Current token:", token);
console.log("Current user data:", user);

// Clear if invalid
if (user === "undefined" || user === "null" || !user) {
  localStorage.removeItem("gh_access_token");
  localStorage.removeItem("gh_user");
  console.log("✅ Cleared invalid auth data");
} else {
  try {
    JSON.parse(user);
    console.log("✅ Auth data is valid");
  } catch (e) {
    localStorage.removeItem("gh_access_token");
    localStorage.removeItem("gh_user");
    console.log("✅ Cleared invalid JSON auth data");
  }
}

// Also clear any old demo auth
localStorage.removeItem("gh-runner-auth");

console.log("Auth data cleanup complete. Refresh the page.");

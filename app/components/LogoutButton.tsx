import { Button } from "./ui/button";

export default function LogoutButton() {

  const handleLogout = () => {
    // Clear specifically the user_email which is used to check login status
    sessionStorage.removeItem("user_email");
    // Clear all other session data
    sessionStorage.clear();
    // Force page reload instead of just navigating
    window.location.href = "/";
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="absolute top-4 left-4 bg-white/10 border border-white/20 text-white rounded-full px-4 py-2 hover:bg-rose-500 hover:border-rose-500 transition-all duration-300 shadow-lg backdrop-blur-md"
    >
      <span className="flex items-center gap-1">
        🚪 <span className="text-sm">Çıkış</span>
      </span>
    </Button>
  );
} 
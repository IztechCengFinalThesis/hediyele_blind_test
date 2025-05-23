import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export default function DonePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/");
    }, 4000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 text-white relative">
      <div className="animate-fadeIn backdrop-blur-lg bg-white/10 border border-white/20 p-4 sm:p-8 rounded-3xl text-center space-y-3 sm:space-y-5 max-w-md w-full transition-all duration-300 hover:shadow-2xl hover:border-white/40">
        <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-md">
          🎉 Teşekkürler!
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-gray-200">
          Seçimlerin başarıyla kaydedildi. <br />
          Birazdan ana sayfaya yönlendirileceksin.
        </p>
        <p className="text-xs sm:text-sm text-gray-400 italic">
          Beklediğin için teşekkür ederiz 💫
        </p>
      </div>
    </div>
  );
}

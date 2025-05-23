import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import LogoutButton from "../components/LogoutButton";

type UserParams = {
  gender: string;
  age: string;
  special: string;
  interests: string[];
  min_budget: number;
  max_budget: number;
};

type Product = {
  product_id: number;
  product_name: string;
  price: number;
  score: number;
};

// Updated to support variable number of algorithms
type Recommendations = Record<string, Product[]>;

export default function ComparePage() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] =
    useState<Recommendations | null>(null);
  const [userParams, setUserParams] = useState<UserParams | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, number | null>>({});
  const [badSteps, setBadSteps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const rec = sessionStorage.getItem("recommendations");
    const params = sessionStorage.getItem("user_params");
    const email = sessionStorage.getItem("user_email");
    
    if (!rec || !params || !email) {
      navigate("/");
      return;
    }
    
    setRecommendations(JSON.parse(rec));
    setUserParams(JSON.parse(params));
  }, [navigate]);

  const handleSelect = (productId: number) => {
    if (badSteps[currentStep]) return; // Don't allow selection if step is marked as bad
    setSelections((prev) => ({ ...prev, [currentStep]: productId }));
  };

  const handleBadRecommendation = () => {
    setBadSteps((prev) => ({ ...prev, [currentStep]: true }));
    setSelections((prev) => ({ ...prev, [currentStep]: null })); // Clear selection for this step
  };

  const handleSubmit = async () => {
    if (!recommendations || !userParams) return;

    // Dynamically get algorithm names from the recommendations object
    const productSources = Object.keys(recommendations);

    const allSelections = [];

    for (let step = 0; step < 5; step++) {
      for (const algo of productSources) {
        // Check if the algorithm has this step
        if (recommendations[algo] && recommendations[algo][step]) {
          const product = recommendations[algo][step];
          const isSelected = selections[step] === product.product_id;

          allSelections.push({
            algorithm: algo,
            product_id: product.product_id,
            recommended_order: step + 1,
            is_selected: isSelected,
            bad_recommendation: badSteps[step] || false,
          });
        }
      }
    }

    const email = sessionStorage.getItem("user_email");
    
    const payload = {
      email: email,
      session_parameters: userParams,
      selections: allSelections,
    };
    
    console.log("Submitting payload:", payload);
    
    const res = await fetch("https://hediyelebackend-production.up.railway.app/api/blind-test/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      // Don't clear email from sessionStorage to maintain login state
      const email = sessionStorage.getItem("user_email");
      sessionStorage.clear();
      if (email) {
        sessionStorage.setItem("user_email", email);
      }
      navigate("/done");
    } else {
      const errorData = await res.text();
      console.error("Submission error:", res.status, errorData);
      alert("Bir hata oluştu: " + res.status);
    }
  };

  if (!recommendations) return null;

  // Dynamically get algorithm names from the recommendations object
  const productSources = Object.keys(recommendations);
  const isCurrentStepBad = badSteps[currentStep];

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-8">
      <LogoutButton />
      
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 drop-shadow-xl tracking-wide">
        Adım {currentStep + 1}/5
      </h2>

      <RadioGroup
        value={selections[currentStep]?.toString() ?? ""}
        onValueChange={(val) => handleSelect(parseInt(val))}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 w-full max-w-6xl"
      >
        {productSources.map((algo) => {
          const product = recommendations?.[algo][currentStep];
          if (!product) return null;

          const isSelected = selections[currentStep] === product.product_id;

          return (
            <label
              key={`${algo}-${product.product_id}`}
              htmlFor={`product-${product.product_id}`}
              className={`flex flex-col items-center space-y-3 sm:space-y-4 p-3 sm:p-6 rounded-2xl backdrop-blur-md transition-all transform hover:scale-105 ${
                isSelected
                  ? "bg-white/30 border-4 border-rose-400 scale-105 shadow-xl"
                  : isCurrentStepBad
                  ? "bg-red-500/20 border-2 border-red-500"
                  : "bg-white/20 border border-white/20 hover:border-white/50"
              }`}
            >
              <img
                src={`https://hediyelebackend-production.up.railway.app/api/public/products/${product.product_id}/thumbnail`}
                alt={product.product_name}
                className="w-40 h-40 sm:w-56 sm:h-56 object-cover rounded-xl shadow-lg"
              />
              <p className="text-center font-semibold text-lg sm:text-xl drop-shadow-sm">
                {product.product_name}
              </p>
              <p className="text-center text-xs sm:text-sm text-gray-200 bg-white/10 px-2 sm:px-3 py-1 rounded-full shadow-sm">
                {product.price.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </p>
              <RadioGroupItem
                value={product.product_id.toString()}
                id={`product-${product.product_id}`}
                className="sr-only"
                disabled={isCurrentStepBad}
              />
            </label>
          );
        })}
      </RadioGroup>

      {!isCurrentStepBad && (
        <Button
          onClick={handleBadRecommendation}
          className="mt-6 sm:mt-8 bg-red-500 hover:bg-red-600 text-white font-medium px-6 sm:px-8 py-2 sm:py-3 rounded-full transition-all duration-300 text-sm sm:text-base"
        >
          Hepsi Çok Kötü ❌
        </Button>
      )}

      <div className="flex justify-between mt-8 sm:mt-12 w-full max-w-6xl px-2 sm:px-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-white border border-white/30 px-4 sm:px-6 py-2 rounded-full bg-white/20 hover:bg-white/80 hover:border-white/50 transition-all duration-300 text-sm sm:text-base"
          onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}
          disabled={currentStep === 0}
        >
          ◀<span className="hidden sm:inline">Geri</span>
        </Button>

        {currentStep < 4 ? (
          <Button
            className="flex items-center gap-2 bg-white text-black font-medium px-4 sm:px-6 py-2 rounded-full hover:bg-rose-400 hover:text-white transition-all duration-300 text-sm sm:text-base"
            onClick={() => setCurrentStep((s) => Math.min(s + 1, 4))}
            disabled={!isCurrentStepBad && selections[currentStep] == null}
          >
            <span className="hidden sm:inline">İleri</span>▶
          </Button>
        ) : (
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-4 sm:px-6 py-2 rounded-full transition-all duration-300 text-sm sm:text-base"
            onClick={handleSubmit}
            disabled={Object.keys(selections).length < 5 && !Object.values(badSteps).some(Boolean)}
          >
            Gönder 🚀
          </Button>
        )}
      </div>
    </div>
  );
}

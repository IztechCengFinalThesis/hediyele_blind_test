import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { Button } from "../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";

type UserParams = {
  gender: string;
  age: string;
  special: string;
  interests: string[];
};

type Product = {
  product_id: number;
  product_name: string;
  price: number;
  score: number;
};

type Recommendations = {
  algorithm_1: Product[];
  algorithm_2: Product[];
  algorithm_3: Product[];
};

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
    if (!rec || !params) {
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

    const productSources = [
      "algorithm_1",
      "algorithm_2",
      "algorithm_3",
    ] as const;

    const allSelections = [];

    for (let step = 0; step < 5; step++) {
      for (const algo of productSources) {
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

    const res = await fetch("http://localhost:8000/api/blind-test/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_parameters: userParams,
        selections: allSelections,
      }),
    });

    if (res.ok) {
      sessionStorage.clear();
      navigate("/done");
    } else {
      alert("Bir hata oluştu.");
    }
  };

  if (!recommendations) return null;

  const productSources = ["algorithm_1", "algorithm_2", "algorithm_3"] as const;
  const isCurrentStepBad = badSteps[currentStep];

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 drop-shadow-xl tracking-wide">
        Adım {currentStep + 1}/5
      </h2>

      <RadioGroup
        value={selections[currentStep]?.toString() ?? ""}
        onValueChange={(val) => handleSelect(parseInt(val))}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"
      >
        {productSources.map((algo) => {
          const product = recommendations?.[algo][currentStep];
          if (!product) return null;

          const isSelected = selections[currentStep] === product.product_id;

          return (
            <label
              key={`${algo}-${product.product_id}`}
              htmlFor={`product-${product.product_id}`}
              className={`flex flex-col items-center space-y-4 p-6 rounded-2xl backdrop-blur-md transition-all transform hover:scale-105 ${
                isSelected
                  ? "bg-white/30 border-4 border-rose-400 scale-105 shadow-xl"
                  : isCurrentStepBad
                  ? "bg-red-500/20 border-2 border-red-500"
                  : "bg-white/20 border border-white/20 hover:border-white/50"
              }`}
            >
              <img
                src="/products/indir.jpeg"
                alt={product.product_name}
                className="w-56 h-56 object-cover rounded-xl shadow-lg"
              />
              <p className="text-center font-semibold text-xl drop-shadow-sm">
                {product.product_name}
              </p>
              <p className="text-center text-sm text-gray-200 bg-white/10 px-3 py-1 rounded-full shadow-sm">
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
          className="mt-8 bg-red-500 hover:bg-red-600 text-white font-medium px-8 py-3 rounded-full transition-all duration-300"
        >
          Hepsi Çok Kötü ❌
        </Button>
      )}

      <div className="flex justify-between mt-12 w-full max-w-6xl px-4">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-white border border-white/30 px-6 py-2 rounded-full bg-white/20 hover:bg-white/80 hover:border-white/50 transition-all duration-300"
          onClick={() => setCurrentStep((s) => Math.max(s - 1, 0))}
          disabled={currentStep === 0}
        >
          ◀<span className="hidden sm:inline">Geri</span>
        </Button>

        {currentStep < 4 ? (
          <Button
            className="flex items-center gap-2 bg-white text-black font-medium px-6 py-2 rounded-full hover:bg-rose-400 hover:text-white transition-all duration-300"
            onClick={() => setCurrentStep((s) => Math.min(s + 1, 4))}
            disabled={!isCurrentStepBad && selections[currentStep] == null}
          >
            <span className="hidden sm:inline">İleri</span>▶
          </Button>
        ) : (
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-2 rounded-full transition-all duration-300"
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

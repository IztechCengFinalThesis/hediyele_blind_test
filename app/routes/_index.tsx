import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import PreviousSessions from "../components/PreviousSessions";
import EmailEntry from "../components/EmailEntry";
import LogoutButton from "../components/LogoutButton";

const interestsList = [
  "sports",
  "music",
  "books",
  "technology",
  "travel",
  "art",
  "food",
  "fitness",
  "health",
  "photography",
  "fashion",
  "pets",
  "home_decor",
  "movies_tv",
];

export default function IndexPage() {
  const navigate = useNavigate();

  const [emailSubmitted, setEmailSubmitted] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [special, setSpecial] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [isPreviousOpen, setIsPreviousOpen] = useState<boolean>(false);

  // Check if email is already in session storage on component mount
  useEffect(() => {
    const email = sessionStorage.getItem("user_email");
    if (email) {
      setUserEmail(email);
      setEmailSubmitted(true);
    } else {
      // If no email in session storage, ensure we're showing the email entry screen
      setEmailSubmitted(false);
      setUserEmail(null);
    }
  }, []);

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setEmailSubmitted(true);
  };

  const handleInterestToggle = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const random = <T extends string>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  const randomize = () => {
    setGender(random(["male", "female"]));
    setAge(
      random([
        "0_2",
        "3_5",
        "6_12",
        "13_18",
        "19_29",
        "30_45",
        "45_65",
        "65_plus",
      ])
    );
    setSpecial(
      random([
        "birthday",
        "anniversary",
        "valentines",
        "new_year",
        "house_warming",
        "mothers_day",
        "fathers_day",
      ])
    );

    const howMany = Math.floor(Math.random() * 3) + 1;
    setInterests(
      interestsList.sort(() => 0.5 - Math.random()).slice(0, howMany)
    );

    // 🔻 Min-Max bütçeyi rastgele ata
    const min = Math.floor(Math.random() * 300); // 0-300₺
    const max = min + Math.floor(Math.random() * 1000) + 100; // min + (100 - 1000₺)
    setMinBudget(min.toString());
    setMaxBudget(max.toString());
  };

  const isReady =
    gender &&
    age &&
    special &&
    minBudget &&
    maxBudget &&
    parseFloat(minBudget) >= 0 &&
    parseFloat(maxBudget) >= 0 &&
    parseFloat(minBudget) <= parseFloat(maxBudget);

  const handleNext = async () => {
    if (!userEmail) return;
    
    const payload = {
      email: userEmail,
      gender,
      age,
      special,
      interests,
      min_budget: parseFloat(minBudget),
      max_budget: parseFloat(maxBudget),
    };
    const res = await fetch(
      "https://hediyelebackend-production.up.railway.app/api/blind-test/recommendations",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem("recommendations", JSON.stringify(data));
      
      // Store parameters correctly structured for the backend
      const userParams = {
        gender,
        age,
        special,
        interests,
        min_budget: parseFloat(minBudget),
        max_budget: parseFloat(maxBudget),
      };
      sessionStorage.setItem("user_params", JSON.stringify(userParams));
      
      navigate("/compare");
    } else {
      const errorData = await res.text();
      console.error("Error:", res.status, errorData);
      alert("Bir hata oluştu: " + res.status);
    }
  };

  const handleSessionSelect = (session: any) => {
    setGender(session.parameters.gender);
    setAge(session.parameters.age);
    setSpecial(session.parameters.special);
    setInterests(session.parameters.interests);
    setMinBudget(session.parameters.min_budget?.toString() || "");
    setMaxBudget(session.parameters.max_budget?.toString() || "");
  };

  // If email not yet submitted, show email entry screen
  if (!emailSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <EmailEntry onSubmit={handleEmailSubmit} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <LogoutButton />
      
      <div className="absolute top-4 right-4 sm:top-4 sm:right-4">
        <Button
          onClick={randomize}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 border border-white text-white rounded-full hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all duration-300 shadow-lg backdrop-blur-md text-sm sm:text-base"
        >
          🔀 <span className="font-medium">Random</span>
        </Button>
      </div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 sm:p-8 rounded-2xl w-full max-w-xl space-y-4 sm:space-y-6 shadow-xl mt-16 sm:mt-10 mb-4 sm:mb-10">
        <h1 className="text-white text-2xl sm:text-3xl font-bold text-center tracking-wide drop-shadow-lg">
          Hediyele Blind Test 🎁
        </h1>

        {parseFloat(minBudget) > parseFloat(maxBudget) && (
          <p className="text-red-400 text-xs sm:text-sm font-medium text-center">
            Minimum bütçe, maksimum bütçeden büyük olamaz!
          </p>
        )}
        {/* Budget Input */}
        <div className="flex flex-col sm:flex-row gap-4 items-center text-white">
          <div className="flex flex-col w-full">
            <label htmlFor="minBudget" className="mb-1 text-sm sm:text-base">
              Min Bütçe (₺):
            </label>
            <input
              id="minBudget"
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="rounded-lg px-3 py-2 bg-white/10 text-white border border-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm sm:text-base"
              placeholder="0"
              min={0}
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="maxBudget" className="mb-1 text-sm sm:text-base">
              Max Bütçe (₺):
            </label>
            <input
              id="maxBudget"
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="rounded-lg px-3 py-2 bg-white/10 text-white border border-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm sm:text-base"
              placeholder="1000"
              min={0}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2 text-white">
          <span className="block font-medium text-sm sm:text-base">Cinsiyet:</span>
          <RadioGroup
            value={gender ?? ""}
            onValueChange={setGender}
            className="flex flex-col sm:flex-row gap-4"
          >
            {["male", "female"].map((val) => (
              <div
                key={val}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <RadioGroupItem
                  value={val}
                  id={`gender-${val}`}
                  className="border-white transition-all duration-200 ease-in-out
                    data-[state=checked]:border-rose-500
                    data-[state=checked]:border-8
                    data-[state=checked]:bg-rose-500"
                />
                <label
                  htmlFor={`gender-${val}`}
                  className="text-sm sm:text-base cursor-pointer"
                >
                  {val === "male" ? "Erkek" : "Kadın"}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Age */}
        <div className="space-y-2 text-white">
          <span className="block font-medium text-sm sm:text-base">Yaş:</span>
          <RadioGroup
            value={age ?? ""}
            onValueChange={setAge}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4"
          >
            {[
              { value: "0_2", label: "0-2" },
              { value: "3_5", label: "3-5" },
              { value: "6_12", label: "6-12" },
              { value: "13_18", label: "13-18" },
              { value: "19_29", label: "19-29" },
              { value: "30_45", label: "30-45" },
              { value: "45_65", label: "45-65" },
              { value: "65_plus", label: "65+" },
            ].map(({ value, label }) => (
              <div
                key={value}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <RadioGroupItem
                  value={value}
                  id={`age-${value}`}
                  className="border-white transition-all duration-200 ease-in-out
                    data-[state=checked]:border-rose-500
                    data-[state=checked]:border-8
                    data-[state=checked]:bg-rose-500"
                />
                <label
                  htmlFor={`age-${value}`}
                  className="text-sm sm:text-base cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Special */}
        <div className="space-y-2 text-white">
          <span className="block font-medium text-sm sm:text-base">Özel Gün:</span>
          <RadioGroup
            value={special ?? ""}
            onValueChange={setSpecial}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4"
          >
            {[
              { value: "birthday", label: "Doğum Günü" },
              { value: "anniversary", label: "Yıldönümü" },
              { value: "valentines", label: "Sevgililer Günü" },
              { value: "new_year", label: "Yılbaşı" },
              { value: "house_warming", label: "Yeni Ev" },
              { value: "mothers_day", label: "Anneler Günü" },
              { value: "fathers_day", label: "Babalar Günü" },
            ].map(({ value, label }) => (
              <div
                key={value}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <RadioGroupItem
                  value={value}
                  id={`special-${value}`}
                  className="border-white transition-all duration-200 ease-in-out
                    data-[state=checked]:border-rose-500
                    data-[state=checked]:border-8
                    data-[state=checked]:bg-rose-500"
                />
                <label
                  htmlFor={`special-${value}`}
                  className="text-sm sm:text-base cursor-pointer"
                >
                  {label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Interests */}
        <div className="space-y-2 text-white">
          <span className="block font-medium text-sm sm:text-base">İlgi Alanları:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {interestsList.map((interest) => (
              <div
                key={interest}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <Checkbox
                  id={`interest-${interest}`}
                  checked={interests.includes(interest)}
                  onCheckedChange={() => handleInterestToggle(interest)}
                  className="border-white data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                />
                <label
                  htmlFor={`interest-${interest}`}
                  className="text-sm sm:text-base cursor-pointer"
                >
                  {interest
                    .split("_")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ")}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleNext}
          disabled={!isReady}
          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          Devam Et
        </Button>
      </div>

      {userEmail && (
        <div className="fixed bottom-4 right-4 sm:static sm:ml-4">
          <Button
            onClick={() => setIsPreviousOpen(!isPreviousOpen)}
            className="sm:hidden bg-white/10 border border-white text-white rounded-full p-2 hover:bg-rose-500 hover:border-rose-500 transition-all duration-300"
          >
            📋
          </Button>
          <div className={`${isPreviousOpen ? 'block' : 'hidden'} sm:block`}>
            <PreviousSessions 
              onSessionSelect={handleSessionSelect} 
              onClose={() => setIsPreviousOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

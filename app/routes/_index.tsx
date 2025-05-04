import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import PreviousSessions from "../components/PreviousSessions";

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

  const [gender, setGender] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [special, setSpecial] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");

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
    const payload = {
      gender,
      age,
      special,
      interests,
      min_budget: parseFloat(minBudget),
      max_budget: parseFloat(maxBudget),
    };
    const res = await fetch(
      "http://localhost:8000/api/blind-test/recommendations",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem("recommendations", JSON.stringify(data));
      sessionStorage.setItem("user_params", JSON.stringify(payload));
      navigate("/compare");
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

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute top-4 right-4">
        <Button
          onClick={randomize}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white text-white rounded-full hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all duration-300 shadow-lg backdrop-blur-md"
        >
          🔀 <span className="font-medium">Random</span>
        </Button>
      </div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-2xl w-full max-w-xl space-y-6 shadow-xl m-10">
        <h1 className="text-white text-3xl font-bold text-center tracking-wide drop-shadow-lg">
          Hediyele Blind Test 🎁
        </h1>

        {parseFloat(minBudget) > parseFloat(maxBudget) && (
          <p className="text-red-400 text-sm font-medium text-center">
            Minimum bütçe, maksimum bütçeden büyük olamaz!
          </p>
        )}
        {/* Budget Input */}
        <div className="flex gap-4 items-center text-white">
          <div className="flex flex-col w-full">
            <label htmlFor="minBudget" className="mb-1">
              Min Bütçe (₺):
            </label>
            <input
              id="minBudget"
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="rounded-lg px-3 py-2 bg-white/10 text-white border border-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="0"
              min={0}
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="maxBudget" className="mb-1">
              Max Bütçe (₺):
            </label>
            <input
              id="maxBudget"
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="rounded-lg px-3 py-2 bg-white/10 text-white border border-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="1000"
              min={0}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-2 text-white">
          <span className="block font-medium">Cinsiyet:</span>
          <RadioGroup
            value={gender ?? ""}
            onValueChange={setGender}
            className="flex gap-4"
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
                    data-[state=checked]:bg-rose-500
                    data-[state=checked]:text-white"
                />
                <label htmlFor={`gender-${val}`}>
                  {val === "male" ? "Erkek" : "Kadın"}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Age */}
        <div className="space-y-2 text-white">
          <span className="block font-medium">Yaş Aralığı:</span>
          <RadioGroup
            value={age ?? ""}
            onValueChange={setAge}
            className="grid grid-cols-4 gap-2"
          >
            {[
              "0_2",
              "3_5",
              "6_12",
              "13_18",
              "19_29",
              "30_45",
              "45_65",
              "65_plus",
            ].map((a) => (
              <div
                key={a}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <RadioGroupItem
                  value={a}
                  id={`age-${a}`}
                  className="border-white transition-all duration-200 ease-in-out
                    data-[state=checked]:border-rose-500
                    data-[state=checked]:border-8
                    data-[state=checked]:bg-rose-500
                    data-[state=checked]:text-white"
                />
                <label htmlFor={`age-${a}`}>{a.replaceAll("_", "-")}</label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Special */}
        <div className="space-y-2 text-white">
          <span className="block font-medium">Özel Gün:</span>
          <RadioGroup
            value={special ?? ""}
            onValueChange={setSpecial}
            className="flex flex-wrap gap-2"
          >
            {[
              "birthday",
              "anniversary",
              "valentines",
              "new_year",
              "house_warming",
              "mothers_day",
              "fathers_day",
            ].map((s) => (
              <div
                key={s}
                className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
              >
                <RadioGroupItem
                  value={s}
                  id={`special-${s}`}
                  className="border-white transition-all duration-200 ease-in-out
                    data-[state=checked]:border-rose-500
                    data-[state=checked]:border-8
                    data-[state=checked]:bg-rose-500
                    data-[state=checked]:text-white"
                />
                <label htmlFor={`special-${s}`}>{s.replaceAll("_", " ")}</label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Interests */}
        <div className="space-y-2 text-white">
          <span className="block font-medium">İlgi Alanları:</span>
          <div className="grid grid-cols-2 gap-2">
            {interestsList.map((i) => (
              <label
                key={i}
                htmlFor={`interest-${i}`}
                className="flex items-center gap-2 hover:scale-[1.02] transition-transform duration-200"
              >
                <Checkbox
                  id={`interest-${i}`}
                  checked={interests.includes(i)}
                  onCheckedChange={() => handleInterestToggle(i)}
                  className="text-white border-white transition-all duration-200 ease-in-out
                    data-[state=checked]:bg-rose-500
                    data-[state=checked]:border-rose-500"
                />
                <span>{i.replaceAll("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <Button
            onClick={handleNext}
            disabled={!isReady}
            className={`w-full font-semibold transition-all duration-300 ${
              isReady
                ? "bg-gray-300 hover:bg-rose-500 text-black hover:text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            İleri →
          </Button>
        </div>
      </div>

      <PreviousSessions onSessionSelect={handleSessionSelect} />
    </div>
  );
}

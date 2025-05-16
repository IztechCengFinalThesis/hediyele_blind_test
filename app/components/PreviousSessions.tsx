import { useEffect, useState } from "react";
import "./tailwind-animations.css";

interface PreviousSession {
  session_id: number;
  parameters: {
    email: string;
    age: string;
    gender: string;
    special: string;
    interests: string[];
    min_budget?: number;
    max_budget?: number;
  };
  created_at: string;
}

interface PreviousSessionsProps {
  onSessionSelect: (session: PreviousSession) => void;
}

export default function PreviousSessions({ onSessionSelect }: PreviousSessionsProps) {
  const [sessions, setSessions] = useState<PreviousSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const email = sessionStorage.getItem("user_email");
        if (!email) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://hediyelebackend-production.up.railway.app/api/blind-test/previous-sessions?email=${encodeURIComponent(email)}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to load previous sessions");
        }
        
        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError("Failed to load previous sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) return (
    <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 p-4 rounded-2xl shadow-xl w-80 z-10 animate-fadeIn">
      <h3 className="text-white text-lg font-semibold mb-2">Previous Sessions</h3>
      <div className="text-white animate-pulse">Loading previous sessions...</div>
    </div>
  );
  if (error) return <div className="text-red-400 fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl border-2 border-red-400/30 p-4 rounded-2xl shadow-xl w-80 z-10 animate-fadeIn">{error}</div>;
  if (sessions.length === 0) return (
    <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 p-4 rounded-2xl shadow-xl w-80 z-10 animate-fadeIn">
      <h3 className="text-white text-lg font-semibold mb-2">Previous Sessions</h3>
      <div className="text-white bg-white/5 p-3 rounded-lg border border-white/10">Previous sessions not found</div>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 p-4 rounded-2xl shadow-xl w-80 z-10 animate-fadeIn">
      <h3 className="text-white text-lg font-semibold mb-2">Previous Sessions</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {sessions.map((session, index) => (
          <button
            key={session.session_id}
            onClick={() => onSessionSelect(session)}
            className="w-full text-left p-2 hover:bg-white/20 rounded-lg transition-all duration-300 text-white border border-white/10 bg-white/5 hover:scale-[1.02] hover:shadow-md"
          >
            <div className="text-sm truncate">
              <span className="font-medium">
                {session.parameters.gender === "male" ? "Erkek" : "Kadın"}
              </span>
              {" • "}
              <span>{session.parameters.age.replaceAll("_", "-")}</span>
              {" • "}
              <span>{session.parameters.special.replaceAll("_", " ")}</span>
            </div>
            <div className="text-xs text-white/70 truncate">
              {new Date(session.created_at).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 
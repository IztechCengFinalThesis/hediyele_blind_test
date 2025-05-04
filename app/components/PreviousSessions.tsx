import { useEffect, useState } from "react";

interface PreviousSession {
  session_id: number;
  parameters: {
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
        const response = await fetch("http://localhost:8000/api/blind-test/previous-sessions");
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

  if (loading) return <div className="text-white">Loading previous sessions...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl max-w-xs z-10">
      <h3 className="text-white text-lg font-semibold mb-2">Previous Sessions</h3>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {sessions.map((session) => (
          <button
            key={session.session_id}
            onClick={() => onSessionSelect(session)}
            className="w-full text-left p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
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
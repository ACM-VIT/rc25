import LiveLeaderboard from "./live-leaderboard";

export default function RotatingLobbyWrapper() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <LiveLeaderboard />
    </div>
  );
}

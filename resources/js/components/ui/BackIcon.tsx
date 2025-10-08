import { ArrowLeft } from "lucide-react";

export default function BackIcon() {
  return (
    <button
      onClick={() => window.history.back()}
      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 text-black" />
    </button>
  );
}

import Image from "next/image";
import { BackgroundCircles } from "../components/ui/background-circles";

export default function Home() {
  return (
    <div className="font-sans relative min-h-screen">
      <BackgroundCircles 
        variant="primary"
      />
      {/* Все текстовые элементы удалены, оставлен только фон */}
    </div>
  );
}

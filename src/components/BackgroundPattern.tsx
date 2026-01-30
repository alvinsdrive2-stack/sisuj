import bgComponents from "@/assets/bg components.png"

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 -z-10" />

      {/* Floating circles */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      {/* Random bg components scattered */}
      <img src={bgComponents} alt="" className="absolute top-[5%] left-[8%] w-32 h-32 opacity-60 animate-float" style={{ animationDelay: "0.5s" }} />
      <img src={bgComponents} alt="" className="absolute top-[15%] right-[5%] w-70 h-70 opacity-50 animate-float" style={{ animationDelay: "1.2s" }} />
      <img src={bgComponents} alt="" className="absolute top-[45%] left-[5%] w-48 h-48 opacity-40 animate-float" style={{ animationDelay: "0.8s" }} />
      <img src={bgComponents} alt="" className="absolute bottom-[5%] right-[50%] w-36 h-36 opacity-55 animate-float" style={{ animationDelay: "1.5s" }} />
      <img src={bgComponents} alt="" className="absolute bottom-[15%] left-[15%] w-40 h-40 opacity-45 animate-float" style={{ animationDelay: "2s" }} />
      <img src={bgComponents} alt="" className="absolute bottom-[25%] right-[20%] w-44 h-44 opacity-35 animate-float" style={{ animationDelay: "0.3s" }} />
      <img src={bgComponents} alt="" className="absolute top-[30%] left-[20%] w-32 h-32 opacity-65 animate-float" style={{ animationDelay: "1.8s" }} />
      <img src={bgComponents} alt="" className="absolute top-[15%] left-[40%] w-48 h-48 opacity-40 animate-float" style={{ animationDelay: "0.7s" }} />
      <img src={bgComponents} alt="" className="absolute top-[85%] right-[5%] w-36 h-36 opacity-50 animate-float" style={{ animationDelay: "1.3s" }} />
    </div>
  )
}

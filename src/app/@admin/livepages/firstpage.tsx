"use client"

export default function Dashboard() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url("/dashbg.png")',
      }}
    >
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/90" /> {/* Logo placeholder */}
          <span className="text-white/90 font-medium">HEXNODE</span>
        </div>
        <div className="text-white/90 font-['Orbitron'] tracking-wider">SPONSORS</div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card */}
          <div className="bg-[#1a1a2e]/70 rounded-lg p-12 flex flex-col items-center justify-center">
            <div className="text-white text-center">
              <div className="text-3xl mb-8 font-['Orbitron']">Executed By</div>
              <div className="text-7xl font-['Orbitron'] tracking-wider">JUDGE0</div>
            </div>
          </div>

          {/* Right Card */}
          <div className="bg-[#1a1a2e]/70 rounded-lg p-8">
            <p className="text-white text-center font-['Orbitron'] leading-relaxed tracking-wide">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took a galley of type
              and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap
              into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the
              release of Letraset sheets containing Lorem Ipsum passages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


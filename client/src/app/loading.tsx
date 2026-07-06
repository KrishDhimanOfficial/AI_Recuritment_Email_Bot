
export default function loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-900 text-white">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-brand-300 font-medium tracking-wide">Loading AI Recruitment Portal...</p>
    </div>
  )
}
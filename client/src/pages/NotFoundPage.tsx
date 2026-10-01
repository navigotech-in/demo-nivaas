import { Link } from 'react-router-dom'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'

export default function NotFoundPage() {
  useSeoMeta({
    title: '404 - Page Not Found | Indore House Makers',
    description: 'The architectural plan or page you are looking for does not exist.',
    canonicalUrl: 'https://indorehousemakers.in/404',
  })

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full text-center bg-white rounded-lg border border-[#E7E0D7] p-8 shadow-xs">
        <div className="h-16 w-16 rounded-full bg-[#FFF6E8] text-[#C94F36] flex items-center justify-center mx-auto mb-4 border border-[#E7E0D7]">
          <Icons.Blueprint size={32} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#C94F36] block mb-1">
          404 ERROR
        </span>
        <h1 className="font-display font-black text-2xl text-[#292725] tracking-tight">
          Page Not Found
        </h1>
        <p className="mt-2 text-xs text-[#54504A] leading-relaxed">
          The house plan or page you requested could not be found or may have been moved.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#C94F36] text-white text-xs font-bold rounded-lg hover:bg-[#B33E26] transition shadow-xs"
          >
            Back to Home
          </Link>
          <Link
            to="/house-plans"
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#E7E0D7] text-[#292826] text-xs font-bold rounded-lg hover:bg-[#FFF6E8] transition"
          >
            Browse House Plans
          </Link>
        </div>
      </div>
    </div>
  )
}

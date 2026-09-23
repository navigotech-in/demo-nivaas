import { Icons } from './Icons'

const states = [
  { name: 'Telangana', count: '2,400+' },
  { name: 'Karnataka', count: '3,100+' },
  { name: 'Maharashtra', count: '2,800+' },
  { name: 'Delhi NCR', count: '1,900+' },
  { name: 'Rajasthan', count: '1,200+' },
  { name: 'Tamil Nadu', count: '1,500+' },
  { name: 'Madhya Pradesh', count: '1,800+' },
  { name: 'Gujarat', count: '1,600+' },
]

export default function ProjectCompleted() {
  return (
    <section className="py-14 bg-[#FDFCF9] border-t border-[#E7E0D7] text-center">
      <div className="container-content">
        <div className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#E7E0D7] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#74706A] mb-4">
          <Icons.MapPin size={13} className="text-[#E76F2E]" />
          <span>Pan-India Projects Completed</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-6">
          {states.map((s) => (
            <div key={s.name} className="rounded-lg border border-[#E7E0D7] bg-white px-4 py-5">
              <div className="font-display text-xl sm:text-2xl font-extrabold text-[#E76F2E]">{s.count}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#74706A]">{s.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
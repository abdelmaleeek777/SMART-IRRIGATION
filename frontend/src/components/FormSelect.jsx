import { ChevronDown } from 'lucide-react';

export default function FormSelect({ label, icon: Icon, error, children, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-2 block text-sm font-semibold text-[#023047]">{label}</span> : null}
      <div className="group relative">
        {Icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 transition group-focus-within:text-[#0077B6]">
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </span>
        ) : null}
        <select
          className={[
            'w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition duration-200 focus:border-[#0077B6] focus:ring-4 focus:ring-[#CAF0F8]/60',
            Icon ? 'pl-11' : '',
            error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : '',
          ].join(' ')}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute inset-y-0 right-4 my-auto h-4 w-4 text-slate-400" />
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}

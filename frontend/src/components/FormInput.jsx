import { forwardRef } from 'react';

const FormInput = forwardRef(function FormInput(
  { label, icon: Icon, error, className = '', inputClassName = '', ...props },
  ref,
) {
  const isReadOnly = props.readOnly;

  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-2 block text-sm font-semibold text-[#023047]">{label}</span> : null}
      <div className="group relative">
        {Icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 transition group-focus-within:text-[#0077B6]">
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </span>
        ) : null}
        <input
          ref={ref}
          className={[
            'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#0077B6] focus:ring-4 focus:ring-[#CAF0F8]/60 disabled:cursor-not-allowed disabled:bg-slate-50',
            Icon ? 'pl-11' : '',
            isReadOnly ? 'bg-[#F7FBFC]' : '',
            error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : '',
            inputClassName,
          ].join(' ')}
          {...props}
        />
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-rose-600">{error}</p> : null}
    </label>
  );
});

export default FormInput;

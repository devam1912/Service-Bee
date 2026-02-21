export default function Input({ label, type = "text", name, value, onChange, placeholder, required = false, className = "", inputClassName = "" }) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider ml-1">{label}</label>}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-bee-accent dark:text-white focus:outline-none focus:border-bee-yellow focus:ring-1 focus:ring-bee-yellow transition-all duration-300 placeholder-gray-400 text-sm shadow-inner ${inputClassName}`}
            />
        </div>
    );
}


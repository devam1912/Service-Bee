export default function Input({ label, type = "text", name, value, onChange, placeholder, required = false, className = "" }) {
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && <label className="text-gray-400 text-sm font-medium ml-1">{label}</label>}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="px-4 py-2 rounded-lg bg-spooky-card border border-gray-700 text-gray-200 focus:outline-none focus:border-spooky-purple focus:ring-1 focus:ring-spooky-purple transition-all duration-300 placeholder-gray-600"
            />
        </div>
    );
}

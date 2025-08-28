export default function Button({ text, onClick, type = "button", variant = "primary" }) {
  const baseClass = "w-full font-semibold py-2 rounded-xl transition";
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  };

  return (
    <button type={type} onClick={onClick} className={`${baseClass} ${styles[variant]}`}>
      {text}
    </button>
  );
}

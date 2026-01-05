// Components/ui/input.jsx
export const Input = (props) => (
    <input
        {...props}
        className={`border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-400 ${props.className || ""}`}
    />
);

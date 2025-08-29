/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: 'class', // Enable class-based dark mode
	theme: {
		extend: {
			colors: {
				// Light mode colors
				light: {
					primary: '#ffffff',
					secondary: '#f3f4f6',
					accent: '#3b82f6',
					text: '#1f2937',
					border: '#e5e7eb'
				},
				// Dark mode colors
				dark: {
					primary: '#1f2937',
					secondary: '#111827',
					accent: '#3b82f6',
					text: '#f3f4f6',
					border: '#374151'
				}
			}
		},
	},
	plugins: [],
};

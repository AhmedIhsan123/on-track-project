import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
	const [health, setHealth] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		const checkHealth = async () => {
			try {
				const res = await fetch(`${API_URL}/health`);
				const data = await res.json();
				setHealth(data);
			} catch (err) {
				setError(err.message);
			}
		};
		checkHealth();
	}, []);

	const status = health ? JSON.stringify(health) : (error ?? "checking...");

	return (
		<div>
			<h1>On-Track</h1>
			<p>Backend: {status}</p>
		</div>
	);
}

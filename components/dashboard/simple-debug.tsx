"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SimpleDebug() {
	const [results, setResults] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const testEndpoints = async () => {
		setLoading(true);
		setResults([]);

		const log = (msg: string) => setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

		// Test basic endpoint
		try {
			log("Testing basic endpoint...");
			const res = await fetch("/api/test");
			log(`Basic test: ${res.status} - ${await res.text()}`);
		} catch (e) {
			log(`Basic test error: ${e.message}`);
		}

		// Test investigations endpoint
		try {
			log("Testing investigations endpoint...");
			const res = await fetch("/api/investigations");
			log(`Investigations: ${res.status} - ${res.statusText}`);
			const text = await res.text();
			log(`Response length: ${text.length} chars`);
			if (text) log(`Response: ${text.substring(0, 100)}...`);
		} catch (e) {
			log(`Investigations error: ${e.message}`);
		}

		setLoading(false);
	};

	return (
		<div className="p-4 border rounded-lg bg-muted/20">
			<div className="flex items-center gap-4 mb-4">
				<h3 className="font-medium">Quick API Test</h3>
				<Button onClick={testEndpoints} disabled={loading} size="sm">
					{loading ? "Testing..." : "Test APIs"}
				</Button>
			</div>

			{results.length > 0 && (
				<div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-64 overflow-y-auto">
					{results.map((result, i) => (
						<div key={i}>{result}</div>
					))}
				</div>
			)}
		</div>
	);
}

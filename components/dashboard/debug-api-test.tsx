"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugApiTest() {
	const [testResults, setTestResults] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const addResult = (message: string) => {
		setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
	};

	const testApiEndpoints = async () => {
		setLoading(true);
		setTestResults([]);

		addResult("🧪 Starting API Debug Tests...");
		addResult("=" * 50);

		// Test basic endpoint first
		try {
			addResult("Testing GET /api/test (basic endpoint)...");
			const response = await fetch("/api/test");
			addResult(`Test Response status: ${response.status} ${response.statusText}`);

			const responseText = await response.text();
			addResult(`Test Response: ${responseText}`);

			if (responseText) {
				try {
					const json = JSON.parse(responseText);
					addResult(`Test JSON: ${JSON.stringify(json, null, 2)}`);
				} catch (e) {
					addResult(`Test JSON parse error: ${e.message}`);
				}
			}
		} catch (error) {
			addResult(`Test endpoint error: ${error.message}`);
		}

		// Test Supabase connection
		try {
			addResult("Testing POST /api/test (Supabase connection)...");
			const response = await fetch("/api/test", { method: "POST" });
			addResult(`Supabase Test Response status: ${response.status} ${response.statusText}`);

			const responseText = await response.text();
			addResult(`Supabase Test Response: ${responseText}`);
		} catch (error) {
			addResult(`Supabase test error: ${error.message}`);
		}

		// Test middleware components individually
		try {
			addResult("Testing GET /api/test-middleware (security headers only)...");
			const response = await fetch("/api/test-middleware");
			addResult(`Middleware Test 1 status: ${response.status} ${response.statusText}`);

			const responseText = await response.text();
			if (responseText) {
				addResult(`Middleware Test 1 Response: ${responseText.substring(0, 100)}`);
			} else {
				addResult("Middleware Test 1: Empty response");
			}
		} catch (error) {
			addResult(`Middleware test 1 error: ${error.message}`);
		}

		try {
			addResult("Testing POST /api/test-middleware (headers + rate limit)...");
			const response = await fetch("/api/test-middleware", { method: "POST" });
			addResult(`Middleware Test 2 status: ${response.status} ${response.statusText}`);

			const responseText = await response.text();
			if (responseText) {
				addResult(`Middleware Test 2 Response: ${responseText.substring(0, 100)}`);
			} else {
				addResult("Middleware Test 2: Empty response");
			}
		} catch (error) {
			addResult(`Middleware test 2 error: ${error.message}`);
		}

		try {
			addResult("Testing PUT /api/test-middleware (full auth chain)...");
			const response = await fetch("/api/test-middleware", { method: "PUT" });
			addResult(`Middleware Test 3 status: ${response.status} ${response.statusText}`);

			const responseText = await response.text();
			if (responseText) {
				addResult(`Middleware Test 3 Response: ${responseText.substring(0, 100)}`);
			} else {
				addResult("Middleware Test 3: Empty response");
			}
		} catch (error) {
			addResult(`Middleware test 3 error: ${error.message}`);
		}

		// Test GET /api/investigations
		try {
			addResult("Testing GET /api/investigations...");
			const response = await fetch("/api/investigations");
			addResult(`Response status: ${response.status} ${response.statusText}`);
			addResult(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);

			const responseText = await response.text();
			addResult(`Response length: ${responseText.length} characters`);
			addResult(`Response preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? "..." : ""}`);

			if (responseText) {
				try {
					const json = JSON.parse(responseText);
					addResult(`JSON parsed successfully: ${JSON.stringify(json, null, 2).substring(0, 300)}`);
				} catch (e) {
					addResult(`JSON parse error: ${e.message}`);
				}
			} else {
				addResult("Empty response body!");
			}
		} catch (error) {
			addResult(`GET test error: ${error.message}`);
		}

		// Test POST /api/investigations
		try {
			addResult("Testing POST /api/investigations...");
			const response = await fetch("/api/investigations", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: "Test Investigation - " + Date.now(),
					description: "Test investigation for debugging",
					access_level: "internal",
				}),
			});

			addResult(`POST Response status: ${response.status} ${response.statusText}`);
			const responseText = await response.text();
			addResult(`POST Response length: ${responseText.length} characters`);
			addResult(`POST Response preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? "..." : ""}`);

			if (responseText) {
				try {
					const json = JSON.parse(responseText);
					addResult(`POST JSON parsed successfully: ${JSON.stringify(json, null, 2).substring(0, 300)}`);
				} catch (e) {
					addResult(`POST JSON parse error: ${e.message}`);
				}
			} else {
				addResult("POST Empty response body!");
			}
		} catch (error) {
			addResult(`POST test error: ${error.message}`);
		}

		setLoading(false);
	};

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle>API Debug Test</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Button onClick={testApiEndpoints} disabled={loading}>
					{loading ? "Testing..." : "Test API Endpoints"}
				</Button>

				{testResults.length > 0 && (
					<div className="bg-muted p-4 rounded-lg">
						<h3 className="font-medium mb-2">Test Results:</h3>
						<div className="space-y-1 text-sm font-mono">
							{testResults.map((result, index) => (
								<div key={index} className="whitespace-pre-wrap break-words">
									{result}
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

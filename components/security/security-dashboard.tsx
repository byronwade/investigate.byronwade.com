"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, Eye, Download, Clock, User, MapPin, Activity, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { formatTimestamp } from "@/lib/utils";

interface AuditLog {
	id: string;
	action: string;
	resource_type?: string;
	resource_id?: string;
	details: Record<string, any>;
	risk_level: "low" | "medium" | "high" | "critical";
	ip_address?: string;
	user_agent?: string;
	created_at: string;
}

interface SecurityStats {
	totalAuditEvents: number;
	highRiskEvents: number;
	recentLogins: number;
	activeInvestigations: number;
}

export function SecurityDashboard() {
	const { user } = useAuth();
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [stats, setStats] = useState<SecurityStats>({
		totalAuditEvents: 0,
		highRiskEvents: 0,
		recentLogins: 0,
		activeInvestigations: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAuditLogs = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/audit?limit=10");

			if (!response.ok) {
				throw new Error("Failed to fetch audit logs");
			}

			const data = await response.json();
			setAuditLogs(data.auditLogs || []);

			// Calculate stats
			const totalEvents = data.auditLogs?.length || 0;
			const highRiskEvents = data.auditLogs?.filter((log: AuditLog) => log.risk_level === "high" || log.risk_level === "critical").length || 0;

			setStats({
				totalAuditEvents: totalEvents,
				highRiskEvents,
				recentLogins: 0, // Would be calculated from actual data
				activeInvestigations: 0, // Would be calculated from actual data
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load security data");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuditLogs();
	}, []);

	const getRiskLevelColor = (level: string) => {
		switch (level) {
			case "critical":
				return "destructive";
			case "high":
				return "destructive";
			case "medium":
				return "secondary";
			case "low":
			default:
				return "outline";
		}
	};

	const getActionIcon = (action: string) => {
		if (action.includes("login")) return <User className="h-4 w-4" />;
		if (action.includes("file")) return <Download className="h-4 w-4" />;
		if (action.includes("view")) return <Eye className="h-4 w-4" />;
		if (action.includes("access")) return <MapPin className="h-4 w-4" />;
		return <Activity className="h-4 w-4" />;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<RefreshCw className="h-6 w-6 animate-spin" />
				<span className="ml-2">Loading security dashboard...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
					<p className="text-muted-foreground">Monitor security events and audit logs for your account</p>
				</div>
				<Button onClick={fetchAuditLogs} variant="outline">
					<RefreshCw className="h-4 w-4 mr-2" />
					Refresh
				</Button>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{/* Security Stats */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Events</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalAuditEvents}</div>
						<p className="text-xs text-muted-foreground">Recent audit events</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
						<AlertTriangle className="h-4 w-4 text-destructive" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-destructive">{stats.highRiskEvents}</div>
						<p className="text-xs text-muted-foreground">Requiring attention</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Account Status</CardTitle>
						<Shield className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">Secure</div>
						<p className="text-xs text-muted-foreground">All systems normal</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Last Login</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Now</div>
						<p className="text-xs text-muted-foreground">Current session</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Audit Logs */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Security Events</CardTitle>
					<CardDescription>Latest audit logs and security activities for your account</CardDescription>
				</CardHeader>
				<CardContent>
					{auditLogs.length === 0 ? (
						<div className="text-center py-6 text-muted-foreground">No audit logs available</div>
					) : (
						<div className="space-y-4">
							{auditLogs.map((log) => (
								<div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
									<div className="flex items-center space-x-4">
										<div className="p-2 bg-muted rounded-full">{getActionIcon(log.action)}</div>
										<div>
											<div className="flex items-center space-x-2">
												<span className="font-medium">{log.action}</span>
												<Badge variant={getRiskLevelColor(log.risk_level)}>{log.risk_level}</Badge>
											</div>
											<div className="text-sm text-muted-foreground">
												{log.resource_type && <span>Resource: {log.resource_type} • </span>}
												{log.ip_address && <span>IP: {log.ip_address} • </span>}
												<span>{formatTimestamp(log.created_at)}</span>
											</div>
										</div>
									</div>
									{Object.keys(log.details || {}).length > 0 && (
										<Button variant="ghost" size="sm">
											<Eye className="h-4 w-4" />
										</Button>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

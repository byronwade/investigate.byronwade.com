"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
	Brain, 
	Send, 
	Loader2, 
	User, 
	Sparkles, 
	Eye, 
	Search, 
	FileText, 
	Users, 
	MapPin,
	Copy,
	ThumbsUp,
	ThumbsDown
} from "lucide-react";

interface Message {
	id: string;
	type: "user" | "ai";
	content: string;
	timestamp: Date;
	metadata?: {
		confidence?: number;
		sources?: string[];
		analysis_type?: string;
	};
}

interface AIChatProps {
	investigationId: string;
	selectedFile?: any;
}

export function AIChat({ investigationId, selectedFile }: AIChatProps) {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "welcome",
			type: "ai",
			content: "Hello! I'm your AI Investigation Assistant. I can help you analyze evidence, find patterns, identify people and objects, extract text, and answer questions about your investigation. What would you like to explore?",
			timestamp: new Date(),
			metadata: {
				confidence: 1.0,
				analysis_type: "introduction"
			}
		}
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const quickQuestions = [
		{ icon: <Eye className="h-4 w-4" />, text: "What do you see in this image?", category: "visual" },
		{ icon: <Users className="h-4 w-4" />, text: "How many people can you identify?", category: "people" },
		{ icon: <FileText className="h-4 w-4" />, text: "Extract all readable text", category: "text" },
		{ icon: <MapPin className="h-4 w-4" />, text: "Find location information", category: "location" },
		{ icon: <Search className="h-4 w-4" />, text: "Look for suspicious activities", category: "analysis" },
	];

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			type: "user",
			content: input,
			timestamp: new Date()
		};

		setMessages(prev => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			// Simulate AI processing
			await new Promise(resolve => setTimeout(resolve, 2000));

			const aiResponse: Message = {
				id: (Date.now() + 1).toString(),
				type: "ai",
				content: generateAIResponse(input),
				timestamp: new Date(),
				metadata: {
					confidence: 0.87 + Math.random() * 0.13,
					sources: selectedFile ? [selectedFile.original_name] : ["Investigation data"],
					analysis_type: detectAnalysisType(input)
				}
			};

			setMessages(prev => [...prev, aiResponse]);
		} catch (error) {
			console.error("AI chat error:", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				type: "ai",
				content: "I apologize, but I encountered an error processing your request. Please try again.",
				timestamp: new Date(),
				metadata: {
					confidence: 0,
					analysis_type: "error"
				}
			};
			setMessages(prev => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const generateAIResponse = (query: string): string => {
		const lowerQuery = query.toLowerCase();
		
		if (lowerQuery.includes("see") || lowerQuery.includes("image") || lowerQuery.includes("visual")) {
			return `Based on my analysis of ${selectedFile?.original_name || "the selected evidence"}, I can identify several key visual elements: I see what appears to be 2-3 people in the frame, a building structure in the background, and what looks like a vehicle. The lighting suggests this was taken during daytime hours. I can detect text elements and various objects that may be relevant to your investigation. Would you like me to focus on any specific aspect?`;
		}
		
		if (lowerQuery.includes("people") || lowerQuery.includes("person") || lowerQuery.includes("identify")) {
			return `I've detected 2 individuals in this evidence. Person 1 appears to be an adult male, approximately 5'10" tall based on environmental references. Person 2 is partially visible in the background. I can perform facial recognition analysis if you'd like to cross-reference these individuals with other evidence in your investigation.`;
		}
		
		if (lowerQuery.includes("text") || lowerQuery.includes("read") || lowerQuery.includes("extract")) {
			return `I've performed OCR analysis and extracted the following text: "DOWNTOWN OFFICE BUILDING", "MARCH 15, 2024", "AUTHORIZED PERSONNEL ONLY". The text appears to be from signage and timestamps visible in the evidence. I can provide more detailed text extraction if needed.`;
		}
		
		if (lowerQuery.includes("location") || lowerQuery.includes("where") || lowerQuery.includes("place")) {
			return `Location analysis reveals this evidence was captured near downtown area, specifically around Main Street. I can see building numbers and street signs that help establish the geographic context. The metadata indicates GPS coordinates if available. This location appears in 3 other pieces of evidence in your investigation.`;
		}
		
		if (lowerQuery.includes("suspicious") || lowerQuery.includes("unusual") || lowerQuery.includes("pattern")) {
			return `Analyzing for anomalies and patterns... I notice some interesting timing correlations. This evidence was captured at 3:42 AM, which aligns with a pattern of activity I've observed in 4 other files from your investigation. The presence of multiple individuals at this location during off-hours may warrant further investigation.`;
		}
		
		return `I've analyzed your query about "${query}" in the context of your investigation. Based on the available evidence, I can provide insights about visual elements, extracted data, and potential connections to other files in your investigation. The current file shows relevant information that correlates with your investigation timeline. Would you like me to elaborate on any specific aspect?`;
	};

	const detectAnalysisType = (query: string): string => {
		const lowerQuery = query.toLowerCase();
		if (lowerQuery.includes("see") || lowerQuery.includes("image")) return "visual_analysis";
		if (lowerQuery.includes("people") || lowerQuery.includes("person")) return "person_detection";
		if (lowerQuery.includes("text") || lowerQuery.includes("read")) return "text_extraction";
		if (lowerQuery.includes("location") || lowerQuery.includes("where")) return "location_analysis";
		if (lowerQuery.includes("suspicious") || lowerQuery.includes("pattern")) return "pattern_analysis";
		return "general_inquiry";
	};

	const handleQuickQuestion = (question: string) => {
		setInput(question);
		inputRef.current?.focus();
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const copyMessage = (content: string) => {
		navigator.clipboard.writeText(content);
	};

	return (
		<Card className="h-full flex flex-col">
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2">
					<Brain className="h-5 w-5 text-primary" />
					AI Investigation Assistant
				</CardTitle>
			</CardHeader>
			
			<CardContent className="flex-1 flex flex-col p-0">
				{/* Messages */}
				<ScrollArea className="flex-1 px-4">
					<div className="space-y-4 pb-4">
						{messages.map((message) => (
							<div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
								<div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
									<div className={`flex items-start gap-3 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
										<div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === "user" ? "bg-primary" : "bg-muted"}`}>
											{message.type === "user" ? (
												<User className="h-4 w-4 text-primary-foreground" />
											) : (
												<Brain className="h-4 w-4 text-primary" />
											)}
										</div>
										
										<div className={`rounded-lg p-3 ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
											<p className="text-sm leading-relaxed">{message.content}</p>
											
											{message.metadata && message.type === "ai" && (
												<div className="mt-3 pt-3 border-t border-border/50 space-y-2">
													{message.metadata.confidence && (
														<div className="flex items-center gap-2">
															<Badge variant="outline" className="text-xs">
																<Sparkles className="h-3 w-3 mr-1" />
																{Math.round(message.metadata.confidence * 100)}% confidence
															</Badge>
														</div>
													)}
													
													{message.metadata.sources && (
														<div className="flex items-center gap-2">
															<span className="text-xs text-muted-foreground">Sources:</span>
															{message.metadata.sources.map((source, idx) => (
																<Badge key={idx} variant="secondary" className="text-xs">
																	{source}
																</Badge>
															))}
														</div>
													)}
													
													<div className="flex items-center gap-1">
														<Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)}>
															<Copy className="h-3 w-3" />
														</Button>
														<Button variant="ghost" size="sm">
															<ThumbsUp className="h-3 w-3" />
														</Button>
														<Button variant="ghost" size="sm">
															<ThumbsDown className="h-3 w-3" />
														</Button>
													</div>
												</div>
											)}
										</div>
									</div>
									
									<div className={`text-xs text-muted-foreground mt-1 ${message.type === "user" ? "text-right" : "text-left"}`}>
										{message.timestamp.toLocaleTimeString()}
									</div>
								</div>
							</div>
						))}
						
						{isLoading && (
							<div className="flex justify-start">
								<div className="flex items-start gap-3">
									<div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
										<Brain className="h-4 w-4 text-primary" />
									</div>
									<div className="bg-muted rounded-lg p-3">
										<div className="flex items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span className="text-sm text-muted-foreground">Analyzing...</span>
										</div>
									</div>
								</div>
							</div>
						)}
						
						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>

				{/* Quick Questions */}
				<div className="px-4 pb-3">
					<div className="text-xs text-muted-foreground mb-2">Quick questions:</div>
					<div className="flex flex-wrap gap-2">
						{quickQuestions.map((question, idx) => (
							<Button
								key={idx}
								variant="outline"
								size="sm"
								onClick={() => handleQuickQuestion(question.text)}
								className="text-xs h-7"
							>
								{question.icon}
								<span className="ml-1">{question.text}</span>
							</Button>
						))}
					</div>
				</div>

				{/* Input */}
				<div className="px-4 pb-4">
					<div className="flex gap-2">
						<Input
							ref={inputRef}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Ask about this evidence... (e.g., 'What do you see in this image?')"
							disabled={isLoading}
							className="flex-1"
						/>
						<Button 
							onClick={handleSend} 
							disabled={!input.trim() || isLoading}
							size="icon"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
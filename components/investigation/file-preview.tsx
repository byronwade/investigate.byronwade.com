"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
	Play, 
	Pause, 
	SkipForward, 
	SkipBack, 
	Volume2, 
	VolumeX,
	Maximize, 
	Minimize,
	RotateCw,
	ZoomIn,
	ZoomOut,
	Download,
	FileImage,
	FileVideo,
	FileText,
	File
} from "lucide-react";

interface FilePreviewProps {
	file: {
		id: string;
		original_name: string;
		mime_type: string;
		file_size: number;
		file_path: string;
	};
	onAnnotationClick?: (position: { x: number; y: number }) => void;
}

export function FilePreview({ file, onAnnotationClick }: FilePreviewProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [zoom, setZoom] = useState(100);
	const [rotation, setRotation] = useState(0);
	const [signedUrl, setSignedUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const videoRef = useRef<HTMLVideoElement>(null);
	const imageRef = useRef<HTMLImageElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchSignedUrl();
	}, [file.id]);

	const fetchSignedUrl = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/files/${file.id}/access`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type: "view" }),
			});

			if (response.ok) {
				const data = await response.json();
				setSignedUrl(data.url);
			}
		} catch (error) {
			console.error("Failed to get file access:", error);
		} finally {
			setLoading(false);
		}
	};

	const handlePlayPause = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const handleTimeUpdate = () => {
		if (videoRef.current) {
			setCurrentTime(videoRef.current.currentTime);
		}
	};

	const handleLoadedMetadata = () => {
		if (videoRef.current) {
			setDuration(videoRef.current.duration);
		}
	};

	const handleSeek = (value: number[]) => {
		if (videoRef.current) {
			videoRef.current.currentTime = value[0];
			setCurrentTime(value[0]);
		}
	};

	const handleVolumeChange = (value: number[]) => {
		const newVolume = value[0];
		setVolume(newVolume);
		if (videoRef.current) {
			videoRef.current.volume = newVolume;
		}
		setIsMuted(newVolume === 0);
	};

	const toggleMute = () => {
		if (videoRef.current) {
			videoRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	const handleSkip = (seconds: number) => {
		if (videoRef.current) {
			videoRef.current.currentTime += seconds;
		}
	};

	const toggleFullscreen = () => {
		if (!isFullscreen) {
			containerRef.current?.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
		setIsFullscreen(!isFullscreen);
	};

	const handleZoom = (direction: "in" | "out") => {
		setZoom(prev => {
			const newZoom = direction === "in" ? prev + 25 : prev - 25;
			return Math.max(25, Math.min(400, newZoom));
		});
	};

	const handleRotate = () => {
		setRotation(prev => (prev + 90) % 360);
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
		if (onAnnotationClick) {
			const rect = event.currentTarget.getBoundingClientRect();
			const x = ((event.clientX - rect.left) / rect.width) * 100;
			const y = ((event.clientY - rect.top) / rect.height) * 100;
			onAnnotationClick({ x, y });
		}
	};

	if (loading) {
		return (
			<Card className="h-full">
				<CardContent className="h-full flex items-center justify-center">
					<div className="text-center">
						<File className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
						<p className="text-sm text-muted-foreground">Loading preview...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!signedUrl) {
		return (
			<Card className="h-full">
				<CardContent className="h-full flex items-center justify-center">
					<div className="text-center">
						<File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">Preview not available</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full flex flex-col">
			{/* Toolbar */}
			<div className="p-4 border-b flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Badge variant="outline">
						{file.mime_type.split("/")[0]}
					</Badge>
					<span className="text-sm text-muted-foreground">{file.original_name}</span>
				</div>
				
				<div className="flex items-center space-x-2">
					{file.mime_type.startsWith("image/") && (
						<>
							<Button variant="outline" size="sm" onClick={() => handleZoom("out")}>
								<ZoomOut className="h-4 w-4" />
							</Button>
							<span className="text-xs text-muted-foreground min-w-12 text-center">
								{zoom}%
							</span>
							<Button variant="outline" size="sm" onClick={() => handleZoom("in")}>
								<ZoomIn className="h-4 w-4" />
							</Button>
							<Button variant="outline" size="sm" onClick={handleRotate}>
								<RotateCw className="h-4 w-4" />
							</Button>
						</>
					)}
					
					<Button variant="outline" size="sm" onClick={toggleFullscreen}>
						{isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
					</Button>
					
					<Button variant="outline" size="sm">
						<Download className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Preview Content */}
			<CardContent className="flex-1 p-0 relative overflow-hidden" ref={containerRef}>
				{file.mime_type.startsWith("image/") && (
					<div className="h-full flex items-center justify-center bg-muted/10">
						<img
							ref={imageRef}
							src={signedUrl}
							alt={file.original_name}
							className="max-w-full max-h-full object-contain cursor-crosshair transition-transform"
							style={{
								transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
							}}
							onClick={handleImageClick}
						/>
					</div>
				)}

				{file.mime_type.startsWith("video/") && (
					<div className="h-full flex flex-col">
						<div className="flex-1 bg-black flex items-center justify-center">
							<video
								ref={videoRef}
								src={signedUrl}
								className="max-w-full max-h-full"
								onTimeUpdate={handleTimeUpdate}
								onLoadedMetadata={handleLoadedMetadata}
								onPlay={() => setIsPlaying(true)}
								onPause={() => setIsPlaying(false)}
							/>
						</div>
						
						{/* Video Controls */}
						<div className="p-4 space-y-3 bg-card">
							{/* Progress Bar */}
							<div className="space-y-2">
								<Slider
									value={[currentTime]}
									onValueChange={handleSeek}
									max={duration}
									step={0.1}
									className="w-full"
								/>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>{formatTime(currentTime)}</span>
									<span>{formatTime(duration)}</span>
								</div>
							</div>
							
							{/* Control Buttons */}
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Button variant="outline" size="sm" onClick={() => handleSkip(-10)}>
										<SkipBack className="h-4 w-4" />
									</Button>
									<Button variant="outline" size="sm" onClick={handlePlayPause}>
										{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
									</Button>
									<Button variant="outline" size="sm" onClick={() => handleSkip(10)}>
										<SkipForward className="h-4 w-4" />
									</Button>
								</div>
								
								<div className="flex items-center space-x-2">
									<Button variant="outline" size="sm" onClick={toggleMute}>
										{isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
									</Button>
									<div className="w-24">
										<Slider
											value={[isMuted ? 0 : volume]}
											onValueChange={handleVolumeChange}
											max={1}
											step={0.1}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{(file.mime_type.includes("pdf") || file.mime_type.includes("document")) && (
					<div className="h-full flex items-center justify-center bg-muted/10">
						<div className="text-center">
							<FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
							<p className="text-lg font-medium mb-2">Document Preview</p>
							<p className="text-sm text-muted-foreground mb-4">
								{file.original_name}
							</p>
							<Button>
								<Download className="h-4 w-4 mr-2" />
								Download to View
							</Button>
						</div>
					</div>
				)}

				{file.mime_type.startsWith("audio/") && (
					<div className="h-full flex items-center justify-center">
						<div className="text-center">
							<Volume2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
							<p className="text-lg font-medium mb-2">Audio File</p>
							<p className="text-sm text-muted-foreground mb-4">
								{file.original_name}
							</p>
							<audio controls className="w-full max-w-md">
								<source src={signedUrl} type={file.mime_type} />
								Your browser does not support the audio element.
							</audio>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
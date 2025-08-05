// Advanced Video Processor for comprehensive video analysis

import { BaseAIProcessor, ProcessingContext, ProcessingOptions, ProcessingStage } from "./base-processor";
import { AIAnalysisType } from "../../shared/types/common";
import { AIProcessingError } from "../../shared/errors/domain-errors";
import { VideoAnalysisResult, KeyFrame, MotionAnalysis, SceneChange, ActionRecognition, TemporalSegment, VideoAnomaly, MotionVector, CameraMovement, createAnalysisResult, DetectedObject, DetectedFace, TextBlock, SceneAnalysis } from "../models/ai-analysis-result";
import { ImageProcessor } from "./image-processor";
import { generateId } from "../../shared/utils/generators";

export interface VideoData {
	filePath: string;
	duration: number;
	frameRate: number;
	resolution: { width: number; height: number };
	codec: string;
	bitrate: number;
	totalFrames: number;
	metadata?: Record<string, any>;
}

export interface VideoProcessingOptions extends ProcessingOptions {
	keyFrameInterval?: number; // seconds between key frames
	motionThreshold?: number; // 0-1
	sceneChangeThreshold?: number; // 0-1
	trackObjects?: boolean;
	trackFaces?: boolean;
	extractAudio?: boolean;
	generateThumbnails?: boolean;
	analysisDepth?: "basic" | "standard" | "comprehensive";
}

export interface FrameAnalysis {
	frameNumber: number;
	timestamp: number;
	objects: DetectedObject[];
	faces: DetectedFace[];
	text: TextBlock[];
	scene: SceneAnalysis;
	motionData: MotionData;
	isKeyFrame: boolean;
	qualityScore: number;
}

export interface MotionData {
	vectors: MotionVector[];
	intensity: number;
	direction: number;
	type: "static" | "linear" | "chaotic" | "rotational";
}

export class VideoProcessor extends BaseAIProcessor<VideoAnalysisResult> {
	private static readonly SUPPORTED_MIME_TYPES = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm", "video/mkv", "video/flv"];

	private imageProcessor: ImageProcessor;

	constructor() {
		super(
			AIAnalysisType.VIDEO_ANALYSIS,
			"advanced-video-model",
			"v1.8",
			VideoProcessor.SUPPORTED_MIME_TYPES,
			500 * 1024 * 1024, // 500MB max
			600000 // 10 minutes timeout
		);

		this.imageProcessor = new ImageProcessor();
	}

	protected async preprocess(context: ProcessingContext, options: ProcessingOptions): Promise<VideoData> {
		this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 10, "Extracting video metadata");

		try {
			// Extract video metadata
			const videoMetadata = await this.extractVideoMetadata(context.filePath);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 50, "Validating video format");

			// Validate video format and codec
			await this.validateVideoFormat(videoMetadata);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 80, "Preparing video for analysis");

			// Prepare video for processing (optional transcoding, etc.)
			const processedVideoPath = await this.prepareVideoForAnalysis(context.filePath, options as VideoProcessingOptions);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 100, "Preprocessing complete");

			return {
				...videoMetadata,
				filePath: processedVideoPath,
			};
		} catch (error) {
			throw new AIProcessingError(this.analysisType, `Video preprocessing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	protected async performAnalysis(videoData: VideoData, context: ProcessingContext, options: ProcessingOptions): Promise<VideoAnalysisResult> {
		const videoOptions = options as VideoProcessingOptions;
		const analysisDepth = videoOptions.analysisDepth || "standard";

		try {
			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 5, "Extracting key frames");

			// 1. Extract and analyze key frames
			const keyFrames = await this.extractAndAnalyzeKeyFrames(videoData, videoOptions);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 25, "Analyzing motion patterns");

			// 2. Analyze motion and camera movement
			const motionAnalysis = await this.analyzeMotion(videoData, videoOptions);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 45, "Detecting scene changes");

			// 3. Detect scene changes
			const sceneChanges = await this.detectSceneChanges(videoData, keyFrames);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 60, "Recognizing actions");

			// 4. Recognize actions and events
			const actionRecognition = await this.recognizeActions(videoData, keyFrames, videoOptions);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 75, "Segmenting temporal content");

			// 5. Create temporal segments
			const temporalSegments = await this.createTemporalSegments(videoData, keyFrames, sceneChanges, actionRecognition);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 90, "Detecting anomalies");

			// 6. Detect anomalies (only for comprehensive analysis)
			const anomalies = analysisDepth === "comprehensive" ? await this.detectAnomalies(videoData, keyFrames, motionAnalysis) : [];

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 100, "Analysis complete");

			// Calculate overall confidence
			const overallConfidence = this.calculateVideoConfidence(keyFrames, motionAnalysis, actionRecognition);

			const result = createAnalysisResult<VideoAnalysisResult>({
				analysisType: AIAnalysisType.VIDEO_ANALYSIS,
				confidence: overallConfidence,
				processingTimeMs: 0, // Will be set by base class
				modelVersion: this.modelVersion,
				duration: videoData.duration,
				frameRate: videoData.frameRate,
				resolution: videoData.resolution,
				keyFrames,
				motionAnalysis,
				sceneChanges,
				actionRecognition,
				temporalSegments,
				anomalies,
			});

			return result;
		} catch (error) {
			throw new AIProcessingError(this.analysisType, `Video analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	// Private implementation methods
	private async extractVideoMetadata(filePath: string): Promise<VideoData> {
		// Mock video metadata extraction
		// In reality, this would use FFmpeg or similar library
		return {
			filePath,
			duration: 120, // 2 minutes
			frameRate: 30,
			resolution: { width: 1920, height: 1080 },
			codec: "h264",
			bitrate: 5000000, // 5 Mbps
			totalFrames: 3600, // 120 * 30
			metadata: {
				container: "mp4",
				audioTracks: 1,
				videoTracks: 1,
				hasSubtitles: false,
			},
		};
	}

	private async validateVideoFormat(videoData: VideoData): Promise<void> {
		if (videoData.duration <= 0) {
			throw new AIProcessingError(this.analysisType, "Invalid video duration");
		}

		if (videoData.frameRate <= 0 || videoData.frameRate > 120) {
			throw new AIProcessingError(this.analysisType, "Invalid frame rate");
		}

		if (videoData.resolution.width <= 0 || videoData.resolution.height <= 0) {
			throw new AIProcessingError(this.analysisType, "Invalid video resolution");
		}
	}

	private async prepareVideoForAnalysis(filePath: string, options: VideoProcessingOptions): Promise<string> {
		// In a real implementation, this might:
		// - Transcode to a standard format if needed
		// - Extract audio track separately if requested
		// - Create preview/thumbnail versions

		return filePath; // For now, return original path
	}

	private async extractAndAnalyzeKeyFrames(videoData: VideoData, options: VideoProcessingOptions): Promise<KeyFrame[]> {
		const keyFrameInterval = options.keyFrameInterval || 5; // Every 5 seconds
		const totalKeyFrames = Math.ceil(videoData.duration / keyFrameInterval);
		const keyFrames: KeyFrame[] = [];

		for (let i = 0; i < totalKeyFrames; i++) {
			const timestamp = i * keyFrameInterval;
			const frameNumber = Math.floor(timestamp * videoData.frameRate);

			// Extract frame at timestamp
			const frameImagePath = await this.extractFrame(videoData.filePath, timestamp);

			// Analyze frame using image processor
			const frameAnalysis = await this.analyzeFrame(frameImagePath, timestamp);

			const keyFrame: KeyFrame = {
				timestamp,
				frameNumber,
				importance: frameAnalysis.qualityScore,
				thumbnailUrl: frameImagePath,
				analysis: {
					objects: frameAnalysis.objects,
					faces: frameAnalysis.faces,
					text: frameAnalysis.text,
					scene: frameAnalysis.scene,
				},
			};

			keyFrames.push(keyFrame);
		}

		return keyFrames;
	}

	private async extractFrame(videoPath: string, timestamp: number): Promise<string> {
		// Mock frame extraction
		// In reality, this would use FFmpeg to extract frame at specific timestamp
		return `/tmp/frame_${timestamp}.jpg`;
	}

	private async analyzeFrame(imagePath: string, timestamp: number): Promise<FrameAnalysis> {
		// Create a mock processing context for the frame
		const frameContext: ProcessingContext = {
			fileId: generateId(),
			fileName: `frame_${timestamp}.jpg`,
			mimeType: "image/jpeg",
			fileSize: 1024 * 1024, // 1MB estimated
			filePath: imagePath,
			investigationId: "mock",
			userId: "system",
			priority: 1,
			retryCount: 0,
		};

		// Use image processor to analyze the frame
		try {
			const objectDetection = await this.imageProcessor.process(frameContext);
			const ocrResult = await this.imageProcessor.performOCRAnalysis(frameContext);
			const faceResult = await this.imageProcessor.performFaceRecognitionAnalysis(frameContext);

			return {
				frameNumber: Math.floor(timestamp * 30), // Assuming 30 FPS
				timestamp,
				objects: objectDetection.objects,
				faces: faceResult.faces,
				text: ocrResult.textBlocks,
				scene: objectDetection.sceneAnalysis,
				motionData: {
					vectors: [],
					intensity: 0.5,
					direction: 0,
					type: "static",
				},
				isKeyFrame: true,
				qualityScore: 0.85,
			};
		} catch (error) {
			// Return minimal analysis if frame analysis fails
			return {
				frameNumber: Math.floor(timestamp * 30),
				timestamp,
				objects: [],
				faces: [],
				text: [],
				scene: {
					sceneType: "unknown",
					description: "Frame analysis failed",
					lighting: "unknown" as any,
				},
				motionData: {
					vectors: [],
					intensity: 0,
					direction: 0,
					type: "static",
				},
				isKeyFrame: true,
				qualityScore: 0.1,
			};
		}
	}

	private async analyzeMotion(videoData: VideoData, options: VideoProcessingOptions): Promise<MotionAnalysis> {
		// Mock motion analysis
		// In reality, this would analyze optical flow between frames
		const motionVectors: MotionVector[] = [
			{
				startPoint: { x: 100, y: 200 },
				endPoint: { x: 150, y: 220 },
				magnitude: 52.9,
				timestamp: 5.0,
				objectId: "person_1",
			},
			{
				startPoint: { x: 500, y: 300 },
				endPoint: { x: 480, y: 290 },
				magnitude: 22.4,
				timestamp: 5.0,
				objectId: "vehicle_1",
			},
		];

		const cameraMovement: CameraMovement = {
			type: "pan",
			confidence: 0.78,
			parameters: {
				speed: 2.5,
				direction: 45,
				smoothness: 0.85,
			},
		};

		return {
			overallMotion: "moderate",
			motionVectors,
			stabilityScore: 0.75,
			cameraMovement,
		};
	}

	private async detectSceneChanges(videoData: VideoData, keyFrames: KeyFrame[]): Promise<SceneChange[]> {
		const sceneChanges: SceneChange[] = [];

		for (let i = 1; i < keyFrames.length; i++) {
			const prevFrame = keyFrames[i - 1];
			const currentFrame = keyFrames[i];

			// Calculate similarity between frames
			const similarity = this.calculateFrameSimilarity(prevFrame, currentFrame);

			if (similarity < 0.6) {
				// Threshold for scene change
				sceneChanges.push({
					timestamp: currentFrame.timestamp,
					changeType: "cut",
					confidence: 1 - similarity,
					contextSimilarity: similarity,
				});
			}
		}

		return sceneChanges;
	}

	private calculateFrameSimilarity(frame1: KeyFrame, frame2: KeyFrame): number {
		// Mock similarity calculation
		// In reality, this would compare frame histograms, object overlap, etc.
		const objectSimilarity = this.calculateObjectOverlap(frame1.analysis.objects, frame2.analysis.objects);

		const sceneSimilarity = frame1.analysis.scene.sceneType === frame2.analysis.scene.sceneType ? 1 : 0;

		return (objectSimilarity + sceneSimilarity) / 2;
	}

	private calculateObjectOverlap(objects1: DetectedObject[], objects2: DetectedObject[]): number {
		if (objects1.length === 0 && objects2.length === 0) return 1;
		if (objects1.length === 0 || objects2.length === 0) return 0;

		let totalOverlap = 0;
		let comparisons = 0;

		for (const obj1 of objects1) {
			for (const obj2 of objects2) {
				if (obj1.label === obj2.label) {
					const overlap = this.calculateBoundingBoxOverlap(obj1.boundingBox, obj2.boundingBox);
					totalOverlap += overlap;
					comparisons++;
				}
			}
		}

		return comparisons > 0 ? totalOverlap / comparisons : 0;
	}

	private calculateBoundingBoxOverlap(box1: any, box2: any): number {
		// Calculate intersection over union (IoU)
		const x1 = Math.max(box1.x, box2.x);
		const y1 = Math.max(box1.y, box2.y);
		const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
		const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

		if (x2 <= x1 || y2 <= y1) return 0;

		const intersection = (x2 - x1) * (y2 - y1);
		const union = box1.width * box1.height + box2.width * box2.height - intersection;

		return intersection / union;
	}

	private async recognizeActions(videoData: VideoData, keyFrames: KeyFrame[], options: VideoProcessingOptions): Promise<ActionRecognition[]> {
		// Mock action recognition
		return [
			{
				action: "person_walking",
				confidence: 0.89,
				startTime: 5.0,
				endTime: 15.0,
				participants: ["person_1"],
				objects: ["sidewalk"],
				location: { x: 100, y: 200, width: 200, height: 400 },
			},
			{
				action: "vehicle_driving",
				confidence: 0.92,
				startTime: 10.0,
				endTime: 25.0,
				participants: [],
				objects: ["vehicle_1", "road"],
				location: { x: 400, y: 300, width: 300, height: 150 },
			},
		];
	}

	private async createTemporalSegments(videoData: VideoData, keyFrames: KeyFrame[], sceneChanges: SceneChange[], actions: ActionRecognition[]): Promise<TemporalSegment[]> {
		const segments: TemporalSegment[] = [];

		// Create segments based on scene changes
		let currentStart = 0;

		for (const sceneChange of sceneChanges) {
			if (sceneChange.timestamp > currentStart) {
				segments.push({
					startTime: currentStart,
					endTime: sceneChange.timestamp,
					segmentType: "main_content",
					description: `Scene segment ${segments.length + 1}`,
					keyEvents: actions.filter((action) => action.startTime >= currentStart && action.endTime <= sceneChange.timestamp).map((action) => action.action),
					importance: 0.7,
				});

				currentStart = sceneChange.timestamp;
			}
		}

		// Add final segment
		if (currentStart < videoData.duration) {
			segments.push({
				startTime: currentStart,
				endTime: videoData.duration,
				segmentType: "conclusion",
				description: `Final segment`,
				keyEvents: actions.filter((action) => action.startTime >= currentStart).map((action) => action.action),
				importance: 0.6,
			});
		}

		return segments;
	}

	private async detectAnomalies(videoData: VideoData, keyFrames: KeyFrame[], motionAnalysis: MotionAnalysis): Promise<VideoAnomaly[]> {
		const anomalies: VideoAnomaly[] = [];

		// Detect motion anomalies
		for (const vector of motionAnalysis.motionVectors) {
			if (vector.magnitude > 100) {
				// Threshold for sudden movement
				anomalies.push({
					timestamp: vector.timestamp,
					duration: 1.0,
					type: "motion_anomaly",
					description: "Sudden movement detected",
					severity: "medium",
					confidence: 0.75,
				});
			}
		}

		// Detect lighting anomalies
		for (let i = 1; i < keyFrames.length; i++) {
			const prevLighting = keyFrames[i - 1].analysis.scene.lighting;
			const currentLighting = keyFrames[i].analysis.scene.lighting;

			if (prevLighting !== currentLighting) {
				anomalies.push({
					timestamp: keyFrames[i].timestamp,
					duration: 0.5,
					type: "lighting_anomaly",
					description: `Lighting change from ${prevLighting} to ${currentLighting}`,
					severity: "low",
					confidence: 0.6,
				});
			}
		}

		return anomalies;
	}

	private calculateVideoConfidence(keyFrames: KeyFrame[], motionAnalysis: MotionAnalysis, actions: ActionRecognition[]): number {
		const frameConfidences = keyFrames.map((frame) => frame.importance);
		const avgFrameConfidence = frameConfidences.reduce((sum, conf) => sum + conf, 0) / frameConfidences.length;

		const motionConfidence = motionAnalysis.stabilityScore;

		const actionConfidences = actions.map((action) => action.confidence);
		const avgActionConfidence = actionConfidences.length > 0 ? actionConfidences.reduce((sum, conf) => sum + conf, 0) / actionConfidences.length : 0.5;

		return (avgFrameConfidence + motionConfidence + avgActionConfidence) / 3;
	}

	estimateProcessingTime(context: ProcessingContext): number {
		// Video processing is more complex and time-consuming
		const baseTime = 30000; // 30 seconds base
		const sizeMultiplier = context.fileSize / (1024 * 1024); // MB
		const durationEstimate = 120; // Assume 2 minutes if not known

		return Math.round(baseTime + sizeMultiplier * 100 + durationEstimate * 1000);
	}
}

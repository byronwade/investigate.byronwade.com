// AI Analysis Result models for structured data extraction

import { AIAnalysisType, ConfidenceScore, BoundingBox, Coordinates } from "../../shared/types/common";
import { ValidationError } from "../../shared/errors/domain-errors";
import { validateConfidenceScore } from "../../shared/utils/validators";

export interface BaseAnalysisResult {
	analysisType: AIAnalysisType;
	confidence: ConfidenceScore;
	processingTimeMs: number;
	modelVersion: string;
	extractedAt: Date;
}

// OCR Results
export interface OCRResult extends BaseAnalysisResult {
	analysisType: AIAnalysisType.OCR;
	text: string;
	textBlocks: TextBlock[];
	detectedLanguages: DetectedLanguage[];
	readingOrder: number[];
}

export interface TextBlock {
	id: string;
	text: string;
	confidence: ConfidenceScore;
	boundingBox: BoundingBox;
	fontSize?: number;
	fontFamily?: string;
	textStyle?: {
		bold: boolean;
		italic: boolean;
		underlined: boolean;
	};
	language?: string;
}

export interface DetectedLanguage {
	code: string; // ISO 639-1 code
	name: string;
	confidence: ConfidenceScore;
	textPercentage: number;
}

// Object Detection Results
export interface ObjectDetectionResult extends BaseAnalysisResult {
	analysisType: AIAnalysisType.OBJECT_DETECTION;
	objects: DetectedObject[];
	sceneAnalysis: SceneAnalysis;
	visualElements: VisualElement[];
}

export interface DetectedObject {
	id: string;
	label: string;
	confidence: ConfidenceScore;
	boundingBox: BoundingBox;
	category: ObjectCategory;
	attributes: ObjectAttribute[];
	relationships: ObjectRelationship[];
}

export enum ObjectCategory {
	PERSON = "person",
	VEHICLE = "vehicle",
	BUILDING = "building",
	DOCUMENT = "document",
	WEAPON = "weapon",
	EVIDENCE = "evidence",
	ELECTRONICS = "electronics",
	FURNITURE = "furniture",
	OTHER = "other",
}

export interface ObjectAttribute {
	name: string;
	value: string;
	confidence: ConfidenceScore;
}

export interface ObjectRelationship {
	type: "near" | "holding" | "inside" | "on" | "behind" | "in_front_of";
	targetObjectId: string;
	confidence: ConfidenceScore;
}

export interface SceneAnalysis {
	sceneType: string;
	description: string;
	lighting: LightingCondition;
	weather?: WeatherCondition;
	timeOfDay?: TimeOfDay;
	location?: LocationAnalysis;
}

export enum LightingCondition {
	BRIGHT = "bright",
	DIM = "dim",
	DARK = "dark",
	ARTIFICIAL = "artificial",
	NATURAL = "natural",
	MIXED = "mixed",
}

export enum WeatherCondition {
	CLEAR = "clear",
	CLOUDY = "cloudy",
	RAINY = "rainy",
	SNOWY = "snowy",
	FOGGY = "foggy",
}

export enum TimeOfDay {
	DAWN = "dawn",
	MORNING = "morning",
	MIDDAY = "midday",
	AFTERNOON = "afternoon",
	EVENING = "evening",
	NIGHT = "night",
}

export interface LocationAnalysis {
	type: "indoor" | "outdoor" | "vehicle" | "unknown";
	specificLocation?: string;
	landmarks?: string[];
	confidence: ConfidenceScore;
}

export interface VisualElement {
	type: "text" | "logo" | "sign" | "license_plate" | "barcode" | "qr_code";
	content: string;
	boundingBox: BoundingBox;
	confidence: ConfidenceScore;
	metadata?: Record<string, any>;
}

// Face Recognition Results
export interface FaceRecognitionResult extends BaseAnalysisResult {
	analysisType: AIAnalysisType.FACE_RECOGNITION;
	faces: DetectedFace[];
	facialAnalytics: FacialAnalytics;
}

export interface DetectedFace {
	id: string;
	boundingBox: BoundingBox;
	confidence: ConfidenceScore;
	identity?: FaceIdentity;
	demographics: Demographics;
	emotions: EmotionAnalysis;
	pose: FacePose;
	quality: FaceQuality;
	landmarks: FacialLandmark[];
}

export interface FaceIdentity {
	personId?: string;
	name?: string;
	confidence: ConfidenceScore;
	similarFaces: SimilarFace[];
}

export interface SimilarFace {
	personId: string;
	name?: string;
	similarity: ConfidenceScore;
	sourceFileId: string;
}

export interface Demographics {
	ageRange: {
		min: number;
		max: number;
		confidence: ConfidenceScore;
	};
	gender: {
		value: "male" | "female" | "unknown";
		confidence: ConfidenceScore;
	};
	ethnicity?: {
		value: string;
		confidence: ConfidenceScore;
	};
}

export interface EmotionAnalysis {
	primary: Emotion;
	emotions: Emotion[];
}

export interface Emotion {
	type: "happy" | "sad" | "angry" | "surprised" | "fearful" | "disgusted" | "neutral";
	confidence: ConfidenceScore;
	intensity: number; // 0-1
}

export interface FacePose {
	yaw: number; // Left-right rotation
	pitch: number; // Up-down rotation
	roll: number; // Tilt rotation
	confidence: ConfidenceScore;
}

export interface FaceQuality {
	score: ConfidenceScore;
	sharpness: ConfidenceScore;
	brightness: ConfidenceScore;
	contrast: ConfidenceScore;
	isBlurred: boolean;
	isOccluded: boolean;
}

export interface FacialLandmark {
	type: "eye_left" | "eye_right" | "nose" | "mouth" | "eyebrow_left" | "eyebrow_right" | "chin";
	coordinates: { x: number; y: number };
	confidence: ConfidenceScore;
}

export interface FacialAnalytics {
	totalFaces: number;
	uniquePersons: number;
	groupDynamics?: GroupDynamics;
	crowdAnalysis?: CrowdAnalysis;
}

export interface GroupDynamics {
	interactions: PersonInteraction[];
	groupCohesion: ConfidenceScore;
	leadershipIndicators: string[];
}

export interface PersonInteraction {
	person1Id: string;
	person2Id: string;
	interactionType: "looking_at" | "talking_to" | "near" | "touching";
	confidence: ConfidenceScore;
}

export interface CrowdAnalysis {
	density: "sparse" | "moderate" | "dense";
	mood: "positive" | "negative" | "neutral" | "mixed";
	attention: AttentionAnalysis;
}

export interface AttentionAnalysis {
	focusPoint?: { x: number; y: number };
	attentionDistribution: number[];
	distractedPersons: string[];
}

// Video Analysis Results
export interface VideoAnalysisResult extends BaseAnalysisResult {
	analysisType: AIAnalysisType.VIDEO_ANALYSIS;
	duration: number;
	frameRate: number;
	resolution: { width: number; height: number };
	keyFrames: KeyFrame[];
	motionAnalysis: MotionAnalysis;
	sceneChanges: SceneChange[];
	actionRecognition: ActionRecognition[];
	temporalSegments: TemporalSegment[];
	anomalies: VideoAnomaly[];
}

export interface KeyFrame {
	timestamp: number;
	frameNumber: number;
	importance: ConfidenceScore;
	thumbnailUrl?: string;
	analysis: {
		objects: DetectedObject[];
		faces: DetectedFace[];
		text: TextBlock[];
		scene: SceneAnalysis;
	};
}

export interface MotionAnalysis {
	overallMotion: "static" | "slow" | "moderate" | "fast" | "chaotic";
	motionVectors: MotionVector[];
	stabilityScore: ConfidenceScore;
	cameraMovement: CameraMovement;
}

export interface MotionVector {
	startPoint: { x: number; y: number };
	endPoint: { x: number; y: number };
	magnitude: number;
	timestamp: number;
	objectId?: string;
}

export interface CameraMovement {
	type: "static" | "pan" | "tilt" | "zoom" | "handheld" | "tracking";
	confidence: ConfidenceScore;
	parameters?: {
		speed?: number;
		direction?: number;
		smoothness?: number;
	};
}

export interface SceneChange {
	timestamp: number;
	changeType: "cut" | "fade" | "dissolve" | "wipe";
	confidence: ConfidenceScore;
	contextSimilarity: ConfidenceScore;
}

export interface ActionRecognition {
	action: string;
	confidence: ConfidenceScore;
	startTime: number;
	endTime: number;
	participants: string[]; // Person IDs
	objects: string[]; // Object IDs involved
	location?: BoundingBox;
}

export interface TemporalSegment {
	startTime: number;
	endTime: number;
	segmentType: "introduction" | "main_content" | "transition" | "conclusion" | "anomaly";
	description: string;
	keyEvents: string[];
	importance: ConfidenceScore;
}

export interface VideoAnomaly {
	timestamp: number;
	duration: number;
	type: "motion_anomaly" | "object_anomaly" | "lighting_anomaly" | "audio_anomaly";
	description: string;
	severity: "low" | "medium" | "high";
	confidence: ConfidenceScore;
}

// Audio Transcription Results
export interface AudioTranscriptionResult extends BaseAnalysisResult {
	analysisType: AIAnalysisType.AUDIO_TRANSCRIPTION;
	duration: number;
	transcript: AudioTranscript;
	speakers: Speaker[];
	acousticAnalysis: AcousticAnalysis;
	emotionalAnalysis: AudioEmotionalAnalysis;
	linguisticAnalysis: LinguisticAnalysis;
}

export interface AudioTranscript {
	fullText: string;
	segments: TranscriptSegment[];
	confidence: ConfidenceScore;
	language: DetectedLanguage;
}

export interface TranscriptSegment {
	id: string;
	text: string;
	startTime: number;
	endTime: number;
	speakerId?: string;
	confidence: ConfidenceScore;
	words: WordTiming[];
}

export interface WordTiming {
	word: string;
	startTime: number;
	endTime: number;
	confidence: ConfidenceScore;
}

export interface Speaker {
	id: string;
	name?: string;
	gender?: "male" | "female" | "unknown";
	ageEstimate?: number;
	accent?: string;
	confidence: ConfidenceScore;
	voiceCharacteristics: VoiceCharacteristics;
	segments: number[]; // Segment IDs where this speaker talks
}

export interface VoiceCharacteristics {
	pitch: number;
	tone: string;
	pace: "slow" | "normal" | "fast";
	volume: "quiet" | "normal" | "loud";
	clarity: ConfidenceScore;
	emotion: string;
}

export interface AcousticAnalysis {
	noiseLevel: ConfidenceScore;
	audioQuality: ConfidenceScore;
	backgroundSounds: BackgroundSound[];
	musicDetection?: MusicDetection;
	environmentalAudio: EnvironmentalAudio;
}

export interface BackgroundSound {
	type: string;
	confidence: ConfidenceScore;
	startTime: number;
	endTime: number;
	volume: number;
}

export interface MusicDetection {
	hasMusic: boolean;
	genre?: string;
	tempo?: number;
	mood?: string;
	confidence: ConfidenceScore;
}

export interface EnvironmentalAudio {
	location: "indoor" | "outdoor" | "vehicle" | "unknown";
	ambientNoise: string[];
	roomSize?: "small" | "medium" | "large";
	reverberation: ConfidenceScore;
}

export interface AudioEmotionalAnalysis {
	overallMood: string;
	emotionTimeline: EmotionTimePoint[];
	stressIndicators: StressIndicator[];
	conversationDynamics: ConversationDynamics;
}

export interface EmotionTimePoint {
	timestamp: number;
	emotion: string;
	intensity: number;
	confidence: ConfidenceScore;
	speakerId?: string;
}

export interface StressIndicator {
	type: "voice_tremor" | "rapid_speech" | "long_pauses" | "volume_changes";
	timestamps: number[];
	severity: number;
	confidence: ConfidenceScore;
}

export interface ConversationDynamics {
	turnTaking: TurnTaking[];
	interruptions: Interruption[];
	silences: SilencePeriod[];
	dominancePattern: SpeakerDominance[];
}

export interface TurnTaking {
	fromSpeaker: string;
	toSpeaker: string;
	timestamp: number;
	smoothness: ConfidenceScore;
}

export interface Interruption {
	interruptingSpeaker: string;
	interruptedSpeaker: string;
	timestamp: number;
	duration: number;
}

export interface SilencePeriod {
	startTime: number;
	duration: number;
	type: "natural_pause" | "awkward_silence" | "thinking_pause";
}

export interface SpeakerDominance {
	speakerId: string;
	talkTime: number;
	turnCount: number;
	dominanceScore: ConfidenceScore;
}

export interface LinguisticAnalysis {
	topics: Topic[];
	sentiment: SentimentAnalysis;
	keywords: Keyword[];
	entities: NamedEntity[];
	complexity: LanguageComplexity;
}

export interface Topic {
	name: string;
	relevance: ConfidenceScore;
	keywords: string[];
	timeSegments: { start: number; end: number }[];
}

export interface SentimentAnalysis {
	overall: "positive" | "negative" | "neutral";
	score: number; // -1 to 1
	confidence: ConfidenceScore;
	timeline: SentimentTimePoint[];
}

export interface SentimentTimePoint {
	timestamp: number;
	sentiment: "positive" | "negative" | "neutral";
	score: number;
	confidence: ConfidenceScore;
}

export interface Keyword {
	word: string;
	frequency: number;
	importance: ConfidenceScore;
	contexts: string[];
}

export interface NamedEntity {
	text: string;
	type: "person" | "organization" | "location" | "date" | "money" | "other";
	confidence: ConfidenceScore;
	mentions: EntityMention[];
}

export interface EntityMention {
	startTime: number;
	endTime: number;
	context: string;
	speakerId?: string;
}

export interface LanguageComplexity {
	readingLevel: number;
	vocabularyRichness: ConfidenceScore;
	sentenceComplexity: ConfidenceScore;
	technicalTerms: string[];
}

// Metadata Extraction Results
export interface MetadataExtractionResult extends BaseAnalysisResult {
	analysisType: AIAnalysisType.METADATA_EXTRACTION;
	technicalMetadata: TechnicalMetadata;
	contentMetadata: ContentMetadata;
	forensicMetadata: ForensicMetadata;
	extractedEntities: ExtractedEntity[];
}

export interface TechnicalMetadata {
	fileFormat: string;
	dimensions?: { width: number; height: number };
	duration?: number;
	bitrate?: number;
	codec?: string;
	compression?: string;
	colorSpace?: string;
	gpsCoordinates?: Coordinates;
	timestamp?: Date;
	cameraInfo?: CameraInfo;
	softwareInfo?: SoftwareInfo;
}

export interface CameraInfo {
	make?: string;
	model?: string;
	serialNumber?: string;
	lensInfo?: string;
	settings?: CameraSettings;
}

export interface CameraSettings {
	iso?: number;
	aperture?: string;
	shutterSpeed?: string;
	focalLength?: number;
	flash?: boolean;
	exposureMode?: string;
}

export interface SoftwareInfo {
	createdWith?: string;
	editedWith?: string[];
	version?: string;
	platform?: string;
}

export interface ContentMetadata {
	title?: string;
	description?: string;
	tags?: string[];
	categories?: string[];
	author?: string;
	copyright?: string;
	license?: string;
	rating?: number;
}

export interface ForensicMetadata {
	hashSums: Record<string, string>;
	digitalSignature?: string;
	auditTrail: AuditTrailEntry[];
	integrityStatus: "intact" | "modified" | "corrupted" | "unknown";
	tamperIndicators: TamperIndicator[];
}

export interface AuditTrailEntry {
	action: string;
	timestamp: Date;
	user?: string;
	software?: string;
	details?: Record<string, any>;
}

export interface TamperIndicator {
	type: "metadata_inconsistency" | "pixel_manipulation" | "timestamp_anomaly" | "compression_artifacts";
	description: string;
	confidence: ConfidenceScore;
	location?: BoundingBox;
}

export interface ExtractedEntity {
	type: "person" | "organization" | "location" | "date" | "phone" | "email" | "address" | "document_id";
	value: string;
	confidence: ConfidenceScore;
	source: "content" | "metadata" | "filename";
	context?: string;
}

// Utility types and functions
export type AnalysisResult = OCRResult | ObjectDetectionResult | FaceRecognitionResult | VideoAnalysisResult | AudioTranscriptionResult | MetadataExtractionResult;

export function createAnalysisResult<T extends AnalysisResult>(data: Omit<T, "extractedAt"> & { extractedAt?: Date }): T {
	const validatedData = {
		...data,
		extractedAt: data.extractedAt || new Date(),
	} as T;

	// Validate confidence score
	const validation = validateConfidenceScore(validatedData.confidence);
	if (!validation.isValid) {
		throw new ValidationError("confidence", validation.errors.join(", "));
	}

	return validatedData;
}

export function isAnalysisResultOfType<T extends AnalysisResult>(result: AnalysisResult, type: AIAnalysisType): result is T {
	return result.analysisType === type;
}

export function getAnalysisResultsByType<T extends AnalysisResult>(results: AnalysisResult[], type: AIAnalysisType): T[] {
	return results.filter((result): result is T => result.analysisType === type);
}

export function calculateOverallConfidence(results: AnalysisResult[]): number {
	if (results.length === 0) return 0;

	const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
	return totalConfidence / results.length;
}

export function mergeAnalysisResults(results: AnalysisResult[]): Record<AIAnalysisType, AnalysisResult[]> {
	const merged: Record<string, AnalysisResult[]> = {};

	for (const result of results) {
		const type = result.analysisType;
		if (!merged[type]) {
			merged[type] = [];
		}
		merged[type].push(result);
	}

	return merged as Record<AIAnalysisType, AnalysisResult[]>;
}

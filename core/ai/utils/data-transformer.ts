// Data transformation utilities to make AI-extracted data more understandable and actionable

import { AnalysisResult, OCRResult, ObjectDetectionResult, FaceRecognitionResult, VideoAnalysisResult, AudioTranscriptionResult, MetadataExtractionResult, DetectedObject, DetectedFace, TranscriptSegment, KeyFrame, ExtractedEntity } from "../models/ai-analysis-result";
import { AIAnalysisType, ConfidenceScore } from "../../shared/types/common";
import { generateId } from "../../shared/utils/generators";

// Enhanced data structures for better understanding
export interface IntelligentSummary {
	id: string;
	fileId: string;
	fileName: string;
	fileType: string;
	overallConfidence: number;
	processingTime: number;
	keyFindings: KeyFinding[];
	entities: EnhancedEntity[];
	timeline: TimelineEntry[];
	locations: LocationEntry[];
	relationships: EntityRelationship[];
	insights: Insight[];
	actionableItems: ActionableItem[];
	riskFactors: RiskFactor[];
	metadata: SummaryMetadata;
}

export interface KeyFinding {
	id: string;
	type: FindingType;
	title: string;
	description: string;
	confidence: ConfidenceScore;
	importance: ImportanceLevel;
	source: AIAnalysisType[];
	evidence: EvidencePointer[];
	tags: string[];
}

export enum FindingType {
	PERSON_IDENTIFIED = "person_identified",
	OBJECT_DETECTED = "object_detected",
	TEXT_EXTRACTED = "text_extracted",
	LOCATION_FOUND = "location_found",
	TIMESTAMP_DETECTED = "timestamp_detected",
	RELATIONSHIP_DISCOVERED = "relationship_discovered",
	ANOMALY_DETECTED = "anomaly_detected",
	PATTERN_IDENTIFIED = "pattern_identified",
}

export enum ImportanceLevel {
	CRITICAL = "critical",
	HIGH = "high",
	MEDIUM = "medium",
	LOW = "low",
	INFO = "info",
}

export interface EvidencePointer {
	analysisType: AIAnalysisType;
	location?: {
		page?: number;
		timestamp?: number;
		boundingBox?: { x: number; y: number; width: number; height: number };
	};
	excerpt?: string;
	confidence: ConfidenceScore;
}

export interface EnhancedEntity {
	id: string;
	name: string;
	type: EntityType;
	confidence: ConfidenceScore;
	occurrences: EntityOccurrence[];
	attributes: EntityAttribute[];
	relationships: string[]; // IDs of related entities
	riskLevel: RiskLevel;
	significance: SignificanceLevel;
	notes: string[];
}

export enum EntityType {
	PERSON = "person",
	ORGANIZATION = "organization",
	LOCATION = "location",
	VEHICLE = "vehicle",
	WEAPON = "weapon",
	DOCUMENT = "document",
	PHONE_NUMBER = "phone_number",
	EMAIL = "email",
	DATE = "date",
	ADDRESS = "address",
	LICENSE_PLATE = "license_plate",
	FINANCIAL = "financial",
	OTHER = "other",
}

export enum RiskLevel {
	VERY_LOW = "very_low",
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	CRITICAL = "critical",
}

export enum SignificanceLevel {
	BACKGROUND = "background",
	RELEVANT = "relevant",
	IMPORTANT = "important",
	CRITICAL = "critical",
}

export interface EntityOccurrence {
	analysisType: AIAnalysisType;
	location: EvidencePointer;
	context: string;
	timestamp?: Date;
}

export interface EntityAttribute {
	name: string;
	value: string;
	confidence: ConfidenceScore;
	source: AIAnalysisType;
}

export interface TimelineEntry {
	id: string;
	timestamp: Date;
	event: string;
	description: string;
	confidence: ConfidenceScore;
	source: AIAnalysisType;
	entities: string[]; // Entity IDs involved
	location?: string;
	importance: ImportanceLevel;
	category: TimelineCategory;
}

export enum TimelineCategory {
	EVIDENCE_CREATED = "evidence_created",
	PERSON_ACTION = "person_action",
	LOCATION_VISIT = "location_visit",
	COMMUNICATION = "communication",
	DOCUMENT_EVENT = "document_event",
	SYSTEM_EVENT = "system_event",
	OTHER = "other",
}

export interface LocationEntry {
	id: string;
	name: string;
	coordinates?: { latitude: number; longitude: number };
	address?: string;
	confidence: ConfidenceScore;
	source: AIAnalysisType[];
	occurrences: LocationOccurrence[];
	type: LocationType;
	significance: SignificanceLevel;
}

export enum LocationType {
	RESIDENCE = "residence",
	WORKPLACE = "workplace",
	PUBLIC_PLACE = "public_place",
	VEHICLE = "vehicle",
	CRIME_SCENE = "crime_scene",
	EVIDENCE_LOCATION = "evidence_location",
	UNKNOWN = "unknown",
}

export interface LocationOccurrence {
	timestamp?: Date;
	context: string;
	evidence: EvidencePointer;
}

export interface EntityRelationship {
	id: string;
	entity1Id: string;
	entity2Id: string;
	relationshipType: RelationshipType;
	description: string;
	confidence: ConfidenceScore;
	evidence: EvidencePointer[];
	strength: RelationshipStrength;
}

export enum RelationshipType {
	KNOWS = "knows",
	FAMILY = "family",
	COLLEAGUE = "colleague",
	OWNS = "owns",
	LOCATED_AT = "located_at",
	ASSOCIATED_WITH = "associated_with",
	COMMUNICATED_WITH = "communicated_with",
	NEAR = "near",
	INVOLVED_IN = "involved_in",
	OTHER = "other",
}

export enum RelationshipStrength {
	WEAK = "weak",
	MODERATE = "moderate",
	STRONG = "strong",
	VERY_STRONG = "very_strong",
}

export interface Insight {
	id: string;
	type: InsightType;
	title: string;
	description: string;
	confidence: ConfidenceScore;
	supporting_evidence: EvidencePointer[];
	implications: string[];
	recommendations: string[];
}

export enum InsightType {
	PATTERN = "pattern",
	ANOMALY = "anomaly",
	CORRELATION = "correlation",
	TREND = "trend",
	INCONSISTENCY = "inconsistency",
	MISSING_DATA = "missing_data",
	BEHAVIORAL = "behavioral",
}

export interface ActionableItem {
	id: string;
	type: ActionType;
	title: string;
	description: string;
	priority: ImportanceLevel;
	urgency: UrgencyLevel;
	effort: EffortLevel;
	assignee?: string;
	dueDate?: Date;
	relatedEntities: string[];
	relatedEvidence: EvidencePointer[];
}

export enum ActionType {
	INVESTIGATE = "investigate",
	VERIFY = "verify",
	INTERVIEW = "interview",
	COLLECT_EVIDENCE = "collect_evidence",
	ANALYZE_FURTHER = "analyze_further",
	CROSS_REFERENCE = "cross_reference",
	FOLLOW_UP = "follow_up",
	ALERT = "alert",
}

export enum UrgencyLevel {
	IMMEDIATE = "immediate",
	HIGH = "high",
	MEDIUM = "medium",
	LOW = "low",
}

export enum EffortLevel {
	MINIMAL = "minimal",
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	EXTENSIVE = "extensive",
}

export interface RiskFactor {
	id: string;
	type: RiskType;
	description: string;
	severity: RiskLevel;
	probability: ConfidenceScore;
	impact: ImpactLevel;
	mitigation: string[];
	evidence: EvidencePointer[];
}

export enum RiskType {
	SECURITY = "security",
	LEGAL = "legal",
	OPERATIONAL = "operational",
	REPUTATION = "reputation",
	EVIDENCE_INTEGRITY = "evidence_integrity",
	PRIVACY = "privacy",
}

export enum ImpactLevel {
	NEGLIGIBLE = "negligible",
	MINOR = "minor",
	MODERATE = "moderate",
	MAJOR = "major",
	SEVERE = "severe",
}

export interface SummaryMetadata {
	generatedAt: Date;
	processingVersion: string;
	dataQuality: DataQualityMetrics;
	completeness: CompletenessMetrics;
	reliability: ReliabilityMetrics;
}

export interface DataQualityMetrics {
	overallScore: number;
	accuracy: number;
	consistency: number;
	completeness: number;
	timeliness: number;
}

export interface CompletenessMetrics {
	overallCompleteness: number;
	textExtraction: number;
	objectDetection: number;
	faceRecognition: number;
	metadataExtraction: number;
	missingDataPoints: string[];
}

export interface ReliabilityMetrics {
	averageConfidence: number;
	highConfidenceFindings: number;
	lowConfidenceFindings: number;
	conflictingData: number;
	verificationNeeded: number;
}

export class DataTransformer {
	/**
	 * Transform raw AI analysis results into an intelligent, actionable summary
	 */
	static transformToIntelligentSummary(fileId: string, fileName: string, fileType: string, analysisResults: AnalysisResult[]): IntelligentSummary {
		const summary: IntelligentSummary = {
			id: generateId(),
			fileId,
			fileName,
			fileType,
			overallConfidence: this.calculateOverallConfidence(analysisResults),
			processingTime: this.calculateTotalProcessingTime(analysisResults),
			keyFindings: [],
			entities: [],
			timeline: [],
			locations: [],
			relationships: [],
			insights: [],
			actionableItems: [],
			riskFactors: [],
			metadata: this.generateSummaryMetadata(analysisResults),
		};

		// Transform each analysis result type
		for (const result of analysisResults) {
			switch (result.analysisType) {
				case AIAnalysisType.OCR:
					this.processOCRResult(result as OCRResult, summary);
					break;
				case AIAnalysisType.OBJECT_DETECTION:
					this.processObjectDetectionResult(result as ObjectDetectionResult, summary);
					break;
				case AIAnalysisType.FACE_RECOGNITION:
					this.processFaceRecognitionResult(result as FaceRecognitionResult, summary);
					break;
				case AIAnalysisType.VIDEO_ANALYSIS:
					this.processVideoAnalysisResult(result as VideoAnalysisResult, summary);
					break;
				case AIAnalysisType.AUDIO_TRANSCRIPTION:
					this.processAudioTranscriptionResult(result as AudioTranscriptionResult, summary);
					break;
				case AIAnalysisType.METADATA_EXTRACTION:
					this.processMetadataExtractionResult(result as MetadataExtractionResult, summary);
					break;
			}
		}

		// Generate insights and actionable items
		this.generateInsights(summary);
		this.generateActionableItems(summary);
		this.generateRiskFactors(summary);
		this.identifyRelationships(summary);

		return summary;
	}

	/**
	 * Create a concise executive summary
	 */
	static createExecutiveSummary(summary: IntelligentSummary): string {
		const criticalFindings = summary.keyFindings.filter((f) => f.importance === ImportanceLevel.CRITICAL);
		const highImportanceFindings = summary.keyFindings.filter((f) => f.importance === ImportanceLevel.HIGH);
		const totalEntities = summary.entities.length;
		const timelineEvents = summary.timeline.length;

		let executiveSummary = `Analysis of ${summary.fileName} (${summary.fileType}) completed with ${Math.round(summary.overallConfidence * 100)}% confidence.\n\n`;

		if (criticalFindings.length > 0) {
			executiveSummary += `CRITICAL FINDINGS (${criticalFindings.length}):\n`;
			criticalFindings.forEach((finding) => {
				executiveSummary += `• ${finding.title}: ${finding.description}\n`;
			});
			executiveSummary += "\n";
		}

		if (highImportanceFindings.length > 0) {
			executiveSummary += `HIGH IMPORTANCE FINDINGS (${highImportanceFindings.length}):\n`;
			highImportanceFindings.slice(0, 3).forEach((finding) => {
				executiveSummary += `• ${finding.title}: ${finding.description}\n`;
			});
			if (highImportanceFindings.length > 3) {
				executiveSummary += `• ... and ${highImportanceFindings.length - 3} more\n`;
			}
			executiveSummary += "\n";
		}

		executiveSummary += `ENTITIES IDENTIFIED: ${totalEntities}\n`;
		if (totalEntities > 0) {
			const entityTypes = [...new Set(summary.entities.map((e) => e.type))];
			executiveSummary += `Types: ${entityTypes.join(", ")}\n`;
		}

		if (timelineEvents > 0) {
			executiveSummary += `\nTIMELINE EVENTS: ${timelineEvents}\n`;
		}

		const highRiskFactors = summary.riskFactors.filter((r) => r.severity === RiskLevel.HIGH || r.severity === RiskLevel.CRITICAL);
		if (highRiskFactors.length > 0) {
			executiveSummary += `\nRISK FACTORS: ${highRiskFactors.length} high/critical risks identified\n`;
		}

		const urgentActions = summary.actionableItems.filter((a) => a.urgency === UrgencyLevel.IMMEDIATE || a.urgency === UrgencyLevel.HIGH);
		if (urgentActions.length > 0) {
			executiveSummary += `\nRECOMMENDED ACTIONS: ${urgentActions.length} urgent actions required\n`;
		}

		return executiveSummary;
	}

	/**
	 * Extract searchable keywords and phrases
	 */
	static extractSearchableKeywords(summary: IntelligentSummary): string[] {
		const keywords = new Set<string>();

		// Entity names
		summary.entities.forEach((entity) => {
			keywords.add(entity.name.toLowerCase());
			entity.attributes.forEach((attr) => keywords.add(attr.value.toLowerCase()));
		});

		// Key finding terms
		summary.keyFindings.forEach((finding) => {
			finding.tags.forEach((tag) => keywords.add(tag.toLowerCase()));
			const words = finding.title.toLowerCase().split(/\s+/);
			words.forEach((word) => {
				if (word.length > 3) keywords.add(word);
			});
		});

		// Location names
		summary.locations.forEach((location) => {
			keywords.add(location.name.toLowerCase());
			if (location.address) keywords.add(location.address.toLowerCase());
		});

		// Timeline event keywords
		summary.timeline.forEach((event) => {
			const words = event.event.toLowerCase().split(/\s+/);
			words.forEach((word) => {
				if (word.length > 3) keywords.add(word);
			});
		});

		return Array.from(keywords).sort();
	}

	// Private helper methods for processing different analysis types
	private static processOCRResult(result: OCRResult, summary: IntelligentSummary): void {
		// Extract text-based findings
		if (result.text && result.text.trim().length > 0) {
			const finding: KeyFinding = {
				id: generateId(),
				type: FindingType.TEXT_EXTRACTED,
				title: "Text Content Extracted",
				description: `Extracted ${result.text.length} characters of text with ${Math.round(result.confidence * 100)}% confidence`,
				confidence: result.confidence,
				importance: ImportanceLevel.MEDIUM,
				source: [AIAnalysisType.OCR],
				evidence: [
					{
						analysisType: AIAnalysisType.OCR,
						excerpt: result.text.substring(0, 200) + (result.text.length > 200 ? "..." : ""),
						confidence: result.confidence,
					},
				],
				tags: ["text", "ocr", "document"],
			};
			summary.keyFindings.push(finding);
		}

		// Process detected languages
		result.detectedLanguages.forEach((lang) => {
			if (lang.confidence > 0.8) {
				const finding: KeyFinding = {
					id: generateId(),
					type: FindingType.PATTERN_IDENTIFIED,
					title: `Language Detected: ${lang.name}`,
					description: `Text is ${lang.textPercentage}% in ${lang.name}`,
					confidence: lang.confidence,
					importance: ImportanceLevel.LOW,
					source: [AIAnalysisType.OCR],
					evidence: [
						{
							analysisType: AIAnalysisType.OCR,
							confidence: lang.confidence,
						},
					],
					tags: ["language", lang.code],
				};
				summary.keyFindings.push(finding);
			}
		});

		// Extract entities from text blocks
		result.textBlocks.forEach((block) => {
			this.extractEntitiesFromText(block.text, AIAnalysisType.OCR, summary);
		});
	}

	private static processObjectDetectionResult(result: ObjectDetectionResult, summary: IntelligentSummary): void {
		// Process detected objects
		result.objects.forEach((obj) => {
			const finding: KeyFinding = {
				id: generateId(),
				type: FindingType.OBJECT_DETECTED,
				title: `${obj.label} Detected`,
				description: `Detected ${obj.label} with ${Math.round(obj.confidence * 100)}% confidence`,
				confidence: obj.confidence,
				importance: this.determineObjectImportance(obj.label),
				source: [AIAnalysisType.OBJECT_DETECTION],
				evidence: [
					{
						analysisType: AIAnalysisType.OBJECT_DETECTION,
						location: { boundingBox: obj.boundingBox },
						confidence: obj.confidence,
					},
				],
				tags: ["object", obj.category, obj.label],
			};
			summary.keyFindings.push(finding);

			// Create entity for the object
			const entity: EnhancedEntity = {
				id: generateId(),
				name: obj.label,
				type: this.mapObjectToEntityType(obj.label),
				confidence: obj.confidence,
				occurrences: [
					{
						analysisType: AIAnalysisType.OBJECT_DETECTION,
						location: {
							analysisType: AIAnalysisType.OBJECT_DETECTION,
							location: { boundingBox: obj.boundingBox },
							confidence: obj.confidence,
						},
						context: `Detected in image with ${Math.round(obj.confidence * 100)}% confidence`,
					},
				],
				attributes: obj.attributes.map((attr) => ({
					name: attr.name,
					value: attr.value,
					confidence: attr.confidence,
					source: AIAnalysisType.OBJECT_DETECTION,
				})),
				relationships: [],
				riskLevel: this.assessObjectRiskLevel(obj.label),
				significance: this.assessObjectSignificance(obj.label),
				notes: [],
			};
			summary.entities.push(entity);
		});

		// Process scene analysis
		if (result.sceneAnalysis) {
			const location: LocationEntry = {
				id: generateId(),
				name: result.sceneAnalysis.description,
				confidence: 0.7, // Scene analysis is typically less precise
				source: [AIAnalysisType.OBJECT_DETECTION],
				occurrences: [
					{
						context: result.sceneAnalysis.description,
						evidence: {
							analysisType: AIAnalysisType.OBJECT_DETECTION,
							confidence: 0.7,
						},
					},
				],
				type: this.mapSceneToLocationType(result.sceneAnalysis.sceneType),
				significance: SignificanceLevel.RELEVANT,
			};
			summary.locations.push(location);
		}
	}

	private static processFaceRecognitionResult(result: FaceRecognitionResult, summary: IntelligentSummary): void {
		result.faces.forEach((face) => {
			// Create person entity
			const personName = face.identity?.name || `Unknown Person ${face.id}`;
			const entity: EnhancedEntity = {
				id: generateId(),
				name: personName,
				type: EntityType.PERSON,
				confidence: face.confidence,
				occurrences: [
					{
						analysisType: AIAnalysisType.FACE_RECOGNITION,
						location: {
							analysisType: AIAnalysisType.FACE_RECOGNITION,
							location: { boundingBox: face.boundingBox },
							confidence: face.confidence,
						},
						context: `Face detected with ${Math.round(face.confidence * 100)}% confidence`,
					},
				],
				attributes: [
					{
						name: "estimated_age",
						value: `${face.demographics.ageRange.min}-${face.demographics.ageRange.max}`,
						confidence: face.demographics.ageRange.confidence,
						source: AIAnalysisType.FACE_RECOGNITION,
					},
					{
						name: "gender",
						value: face.demographics.gender.value,
						confidence: face.demographics.gender.confidence,
						source: AIAnalysisType.FACE_RECOGNITION,
					},
					{
						name: "primary_emotion",
						value: face.emotions.primary.type,
						confidence: face.emotions.primary.confidence,
						source: AIAnalysisType.FACE_RECOGNITION,
					},
				],
				relationships: [],
				riskLevel: face.identity ? RiskLevel.MEDIUM : RiskLevel.LOW,
				significance: face.identity ? SignificanceLevel.IMPORTANT : SignificanceLevel.RELEVANT,
				notes: [],
			};
			summary.entities.push(entity);

			// Create finding
			const finding: KeyFinding = {
				id: generateId(),
				type: FindingType.PERSON_IDENTIFIED,
				title: face.identity ? `Person Identified: ${face.identity.name}` : "Unknown Person Detected",
				description: `Face detected with ${Math.round(face.confidence * 100)}% confidence`,
				confidence: face.confidence,
				importance: face.identity ? ImportanceLevel.HIGH : ImportanceLevel.MEDIUM,
				source: [AIAnalysisType.FACE_RECOGNITION],
				evidence: [
					{
						analysisType: AIAnalysisType.FACE_RECOGNITION,
						location: { boundingBox: face.boundingBox },
						confidence: face.confidence,
					},
				],
				tags: ["person", "face", face.identity ? "identified" : "unknown"],
			};
			summary.keyFindings.push(finding);
		});
	}

	private static processVideoAnalysisResult(result: VideoAnalysisResult, summary: IntelligentSummary): void {
		// Process key frames
		result.keyFrames.forEach((frame, index) => {
			const timelineEntry: TimelineEntry = {
				id: generateId(),
				timestamp: new Date(frame.timestamp * 1000), // Convert to actual timestamp
				event: `Key Frame ${index + 1}`,
				description: `Important frame at ${frame.timestamp}s`,
				confidence: frame.importance,
				source: AIAnalysisType.VIDEO_ANALYSIS,
				entities: [],
				importance: frame.importance > 0.8 ? ImportanceLevel.HIGH : ImportanceLevel.MEDIUM,
				category: TimelineCategory.EVIDENCE_CREATED,
			};
			summary.timeline.push(timelineEntry);
		});

		// Process action recognition
		result.actionRecognition.forEach((action) => {
			const finding: KeyFinding = {
				id: generateId(),
				type: FindingType.PATTERN_IDENTIFIED,
				title: `Action Detected: ${action.action}`,
				description: `${action.action} detected from ${action.startTime}s to ${action.endTime}s`,
				confidence: action.confidence,
				importance: this.determineActionImportance(action.action),
				source: [AIAnalysisType.VIDEO_ANALYSIS],
				evidence: [
					{
						analysisType: AIAnalysisType.VIDEO_ANALYSIS,
						location: { timestamp: action.startTime },
						confidence: action.confidence,
					},
				],
				tags: ["action", action.action, "video"],
			};
			summary.keyFindings.push(finding);
		});

		// Process anomalies
		result.anomalies.forEach((anomaly) => {
			const finding: KeyFinding = {
				id: generateId(),
				type: FindingType.ANOMALY_DETECTED,
				title: `Anomaly: ${anomaly.type}`,
				description: anomaly.description,
				confidence: anomaly.confidence,
				importance: anomaly.severity === "high" ? ImportanceLevel.HIGH : ImportanceLevel.MEDIUM,
				source: [AIAnalysisType.VIDEO_ANALYSIS],
				evidence: [
					{
						analysisType: AIAnalysisType.VIDEO_ANALYSIS,
						location: { timestamp: anomaly.timestamp },
						confidence: anomaly.confidence,
					},
				],
				tags: ["anomaly", anomaly.type, anomaly.severity],
			};
			summary.keyFindings.push(finding);
		});
	}

	private static processAudioTranscriptionResult(result: AudioTranscriptionResult, summary: IntelligentSummary): void {
		// Process transcript
		if (result.transcript.fullText) {
			const finding: KeyFinding = {
				id: generateId(),
				type: FindingType.TEXT_EXTRACTED,
				title: "Audio Transcribed",
				description: `Transcribed ${result.duration}s of audio with ${Math.round(result.transcript.confidence * 100)}% confidence`,
				confidence: result.transcript.confidence,
				importance: ImportanceLevel.HIGH,
				source: [AIAnalysisType.AUDIO_TRANSCRIPTION],
				evidence: [
					{
						analysisType: AIAnalysisType.AUDIO_TRANSCRIPTION,
						excerpt: result.transcript.fullText.substring(0, 200) + (result.transcript.fullText.length > 200 ? "..." : ""),
						confidence: result.transcript.confidence,
					},
				],
				tags: ["audio", "speech", "transcription"],
			};
			summary.keyFindings.push(finding);

			// Extract entities from transcript
			this.extractEntitiesFromText(result.transcript.fullText, AIAnalysisType.AUDIO_TRANSCRIPTION, summary);
		}

		// Process speakers
		result.speakers.forEach((speaker) => {
			const entity: EnhancedEntity = {
				id: generateId(),
				name: speaker.name || `Speaker ${speaker.id}`,
				type: EntityType.PERSON,
				confidence: speaker.confidence,
				occurrences: [
					{
						analysisType: AIAnalysisType.AUDIO_TRANSCRIPTION,
						location: {
							analysisType: AIAnalysisType.AUDIO_TRANSCRIPTION,
							confidence: speaker.confidence,
						},
						context: `Voice characteristics: ${speaker.voiceCharacteristics.tone}, ${speaker.voiceCharacteristics.pace} pace`,
					},
				],
				attributes: [
					{
						name: "gender",
						value: speaker.gender || "unknown",
						confidence: 0.7,
						source: AIAnalysisType.AUDIO_TRANSCRIPTION,
					},
					{
						name: "voice_tone",
						value: speaker.voiceCharacteristics.tone,
						confidence: 0.8,
						source: AIAnalysisType.AUDIO_TRANSCRIPTION,
					},
				],
				relationships: [],
				riskLevel: RiskLevel.MEDIUM,
				significance: SignificanceLevel.IMPORTANT,
				notes: [],
			};
			summary.entities.push(entity);
		});

		// Process linguistic analysis
		if (result.linguisticAnalysis) {
			result.linguisticAnalysis.entities.forEach((entity) => {
				const enhancedEntity: EnhancedEntity = {
					id: generateId(),
					name: entity.text,
					type: this.mapNLPEntityTypeToEntityType(entity.type),
					confidence: entity.confidence,
					occurrences: entity.mentions.map((mention) => ({
						analysisType: AIAnalysisType.AUDIO_TRANSCRIPTION,
						location: {
							analysisType: AIAnalysisType.AUDIO_TRANSCRIPTION,
							location: { timestamp: mention.startTime },
							confidence: entity.confidence,
						},
						context: mention.context,
					})),
					attributes: [],
					relationships: [],
					riskLevel: RiskLevel.LOW,
					significance: SignificanceLevel.RELEVANT,
					notes: [],
				};
				summary.entities.push(enhancedEntity);
			});
		}
	}

	private static processMetadataExtractionResult(result: MetadataExtractionResult, summary: IntelligentSummary): void {
		// Process extracted entities
		result.extractedEntities.forEach((entity) => {
			const enhancedEntity: EnhancedEntity = {
				id: generateId(),
				name: entity.value,
				type: this.mapMetadataEntityTypeToEntityType(entity.type),
				confidence: entity.confidence,
				occurrences: [
					{
						analysisType: AIAnalysisType.METADATA_EXTRACTION,
						location: {
							analysisType: AIAnalysisType.METADATA_EXTRACTION,
							confidence: entity.confidence,
						},
						context: entity.context || `Found in ${entity.source}`,
					},
				],
				attributes: [],
				relationships: [],
				riskLevel: RiskLevel.LOW,
				significance: SignificanceLevel.RELEVANT,
				notes: [],
			};
			summary.entities.push(enhancedEntity);
		});

		// Process GPS coordinates as location
		if (result.technicalMetadata.gpsCoordinates) {
			const location: LocationEntry = {
				id: generateId(),
				name: "GPS Location",
				coordinates: result.technicalMetadata.gpsCoordinates,
				confidence: 0.9,
				source: [AIAnalysisType.METADATA_EXTRACTION],
				occurrences: [
					{
						context: "Extracted from file metadata",
						evidence: {
							analysisType: AIAnalysisType.METADATA_EXTRACTION,
							confidence: 0.9,
						},
					},
				],
				type: LocationType.EVIDENCE_LOCATION,
				significance: SignificanceLevel.IMPORTANT,
			};
			summary.locations.push(location);
		}

		// Process audit trail for timeline
		if (result.forensicMetadata?.auditTrail) {
			result.forensicMetadata.auditTrail.forEach((entry) => {
				const timelineEntry: TimelineEntry = {
					id: generateId(),
					timestamp: entry.timestamp,
					event: entry.action,
					description: `${entry.action} by ${entry.user || "unknown"}`,
					confidence: 0.9,
					source: AIAnalysisType.METADATA_EXTRACTION,
					entities: [],
					importance: ImportanceLevel.MEDIUM,
					category: TimelineCategory.DOCUMENT_EVENT,
				};
				summary.timeline.push(timelineEntry);
			});
		}
	}

	// Additional helper methods...
	private static extractEntitiesFromText(text: string, source: AIAnalysisType, summary: IntelligentSummary): void {
		// Simple entity extraction patterns - in reality would use NLP
		const patterns = {
			email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
			phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
			date: /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
		};

		Object.entries(patterns).forEach(([type, pattern]) => {
			const matches = text.match(pattern);
			if (matches) {
				matches.forEach((match) => {
					const entity: EnhancedEntity = {
						id: generateId(),
						name: match,
						type: type === "email" ? EntityType.EMAIL : type === "phone" ? EntityType.PHONE_NUMBER : EntityType.DATE,
						confidence: 0.8,
						occurrences: [
							{
								analysisType: source,
								location: {
									analysisType: source,
									excerpt: match,
									confidence: 0.8,
								},
								context: `Found in ${source} output`,
							},
						],
						attributes: [],
						relationships: [],
						riskLevel: RiskLevel.LOW,
						significance: SignificanceLevel.RELEVANT,
						notes: [],
					};
					summary.entities.push(entity);
				});
			}
		});
	}

	private static generateInsights(summary: IntelligentSummary): void {
		// Generate insights based on patterns in the data
		const personEntities = summary.entities.filter((e) => e.type === EntityType.PERSON);
		const locationEntities = summary.entities.filter((e) => e.type === EntityType.LOCATION);

		if (personEntities.length > 3) {
			const insight: Insight = {
				id: generateId(),
				type: InsightType.PATTERN,
				title: "Multiple Persons Identified",
				description: `${personEntities.length} different people have been identified in this evidence`,
				confidence: 0.8,
				supporting_evidence: personEntities.slice(0, 3).map((e) => e.occurrences[0].location),
				implications: ["This evidence may involve multiple participants", "Cross-referencing with other evidence may reveal relationships"],
				recommendations: ["Interview identified individuals", "Search for additional evidence linking these persons"],
			};
			summary.insights.push(insight);
		}

		if (locationEntities.length > 2) {
			const insight: Insight = {
				id: generateId(),
				type: InsightType.PATTERN,
				title: "Multiple Locations Referenced",
				description: `Evidence references ${locationEntities.length} different locations`,
				confidence: 0.7,
				supporting_evidence: locationEntities.slice(0, 2).map((e) => e.occurrences[0].evidence),
				implications: ["The case may span multiple geographical areas", "Travel patterns may be relevant"],
				recommendations: ["Map out the geographical scope", "Investigate travel between locations"],
			};
			summary.insights.push(insight);
		}
	}

	private static generateActionableItems(summary: IntelligentSummary): void {
		// Generate actionable items based on findings
		const criticalFindings = summary.keyFindings.filter((f) => f.importance === ImportanceLevel.CRITICAL);
		const unknownPersons = summary.entities.filter((e) => e.type === EntityType.PERSON && e.name.includes("Unknown"));

		criticalFindings.forEach((finding) => {
			const action: ActionableItem = {
				id: generateId(),
				type: ActionType.INVESTIGATE,
				title: `Investigate Critical Finding: ${finding.title}`,
				description: `Follow up on critical finding: ${finding.description}`,
				priority: ImportanceLevel.CRITICAL,
				urgency: UrgencyLevel.IMMEDIATE,
				effort: EffortLevel.HIGH,
				relatedEntities: [],
				relatedEvidence: finding.evidence,
			};
			summary.actionableItems.push(action);
		});

		unknownPersons.forEach((person) => {
			const action: ActionableItem = {
				id: generateId(),
				type: ActionType.INTERVIEW,
				title: `Identify Unknown Person`,
				description: `Attempt to identify ${person.name} through additional investigation`,
				priority: ImportanceLevel.HIGH,
				urgency: UrgencyLevel.HIGH,
				effort: EffortLevel.MEDIUM,
				relatedEntities: [person.id],
				relatedEvidence: person.occurrences.map((o) => o.location),
			};
			summary.actionableItems.push(action);
		});
	}

	private static generateRiskFactors(summary: IntelligentSummary): void {
		// Assess risk factors based on the analysis
		const lowQualityResults = summary.keyFindings.filter((f) => f.confidence < 0.5);

		if (lowQualityResults.length > 0) {
			const risk: RiskFactor = {
				id: generateId(),
				type: RiskType.EVIDENCE_INTEGRITY,
				description: `${lowQualityResults.length} findings have low confidence scores`,
				severity: RiskLevel.MEDIUM,
				probability: 0.8,
				impact: ImpactLevel.MODERATE,
				mitigation: ["Re-process with higher quality settings", "Seek additional evidence", "Manual verification"],
				evidence: lowQualityResults.slice(0, 3).map((f) => f.evidence[0]),
			};
			summary.riskFactors.push(risk);
		}
	}

	private static identifyRelationships(summary: IntelligentSummary): void {
		// Identify relationships between entities
		const persons = summary.entities.filter((e) => e.type === EntityType.PERSON);
		const locations = summary.entities.filter((e) => e.type === EntityType.LOCATION);

		// Simple co-occurrence based relationship detection
		for (let i = 0; i < persons.length; i++) {
			for (let j = i + 1; j < persons.length; j++) {
				const person1 = persons[i];
				const person2 = persons[j];

				// Check if they appear in the same source
				const commonSources = person1.occurrences.filter((occ1) => person2.occurrences.some((occ2) => occ2.analysisType === occ1.analysisType));

				if (commonSources.length > 0) {
					const relationship: EntityRelationship = {
						id: generateId(),
						entity1Id: person1.id,
						entity2Id: person2.id,
						relationshipType: RelationshipType.ASSOCIATED_WITH,
						description: `Both persons appear in the same evidence`,
						confidence: 0.6,
						evidence: commonSources.map((cs) => cs.location),
						strength: RelationshipStrength.MODERATE,
					};
					summary.relationships.push(relationship);
				}
			}
		}
	}

	// Helper methods for mapping and assessment
	private static calculateOverallConfidence(results: AnalysisResult[]): number {
		if (results.length === 0) return 0;
		return results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
	}

	private static calculateTotalProcessingTime(results: AnalysisResult[]): number {
		return results.reduce((sum, result) => sum + result.processingTimeMs, 0);
	}

	private static generateSummaryMetadata(results: AnalysisResult[]): SummaryMetadata {
		const overallConfidence = this.calculateOverallConfidence(results);

		return {
			generatedAt: new Date(),
			processingVersion: "1.0.0",
			dataQuality: {
				overallScore: overallConfidence,
				accuracy: overallConfidence,
				consistency: 0.8,
				completeness: 0.9,
				timeliness: 1.0,
			},
			completeness: {
				overallCompleteness: 0.85,
				textExtraction: results.some((r) => r.analysisType === AIAnalysisType.OCR) ? 0.9 : 0,
				objectDetection: results.some((r) => r.analysisType === AIAnalysisType.OBJECT_DETECTION) ? 0.8 : 0,
				faceRecognition: results.some((r) => r.analysisType === AIAnalysisType.FACE_RECOGNITION) ? 0.7 : 0,
				metadataExtraction: results.some((r) => r.analysisType === AIAnalysisType.METADATA_EXTRACTION) ? 0.95 : 0,
				missingDataPoints: [],
			},
			reliability: {
				averageConfidence: overallConfidence,
				highConfidenceFindings: results.filter((r) => r.confidence > 0.8).length,
				lowConfidenceFindings: results.filter((r) => r.confidence < 0.5).length,
				conflictingData: 0,
				verificationNeeded: results.filter((r) => r.confidence < 0.7).length,
			},
		};
	}

	private static determineObjectImportance(objectLabel: string): ImportanceLevel {
		const highImportance = ["weapon", "gun", "knife", "person", "vehicle", "license plate"];
		const mediumImportance = ["phone", "computer", "document", "bag", "camera"];

		if (highImportance.some((item) => objectLabel.toLowerCase().includes(item))) {
			return ImportanceLevel.HIGH;
		}
		if (mediumImportance.some((item) => objectLabel.toLowerCase().includes(item))) {
			return ImportanceLevel.MEDIUM;
		}
		return ImportanceLevel.LOW;
	}

	private static mapObjectToEntityType(objectLabel: string): EntityType {
		if (objectLabel.toLowerCase().includes("person")) return EntityType.PERSON;
		if (objectLabel.toLowerCase().includes("vehicle") || objectLabel.toLowerCase().includes("car")) return EntityType.VEHICLE;
		if (objectLabel.toLowerCase().includes("weapon") || objectLabel.toLowerCase().includes("gun")) return EntityType.WEAPON;
		if (objectLabel.toLowerCase().includes("document") || objectLabel.toLowerCase().includes("paper")) return EntityType.DOCUMENT;
		return EntityType.OTHER;
	}

	private static assessObjectRiskLevel(objectLabel: string): RiskLevel {
		const highRisk = ["weapon", "gun", "knife", "explosive"];
		const mediumRisk = ["vehicle", "person"];

		if (highRisk.some((item) => objectLabel.toLowerCase().includes(item))) {
			return RiskLevel.HIGH;
		}
		if (mediumRisk.some((item) => objectLabel.toLowerCase().includes(item))) {
			return RiskLevel.MEDIUM;
		}
		return RiskLevel.LOW;
	}

	private static assessObjectSignificance(objectLabel: string): SignificanceLevel {
		const critical = ["weapon", "evidence"];
		const important = ["person", "vehicle", "document"];

		if (critical.some((item) => objectLabel.toLowerCase().includes(item))) {
			return SignificanceLevel.CRITICAL;
		}
		if (important.some((item) => objectLabel.toLowerCase().includes(item))) {
			return SignificanceLevel.IMPORTANT;
		}
		return SignificanceLevel.RELEVANT;
	}

	private static mapSceneToLocationType(sceneType: string): LocationType {
		if (sceneType.includes("office") || sceneType.includes("workplace")) return LocationType.WORKPLACE;
		if (sceneType.includes("home") || sceneType.includes("residence")) return LocationType.RESIDENCE;
		if (sceneType.includes("vehicle") || sceneType.includes("car")) return LocationType.VEHICLE;
		if (sceneType.includes("crime") || sceneType.includes("scene")) return LocationType.CRIME_SCENE;
		return LocationType.PUBLIC_PLACE;
	}

	private static determineActionImportance(action: string): ImportanceLevel {
		const critical = ["violence", "crime", "assault"];
		const high = ["meeting", "exchange", "handover"];

		if (critical.some((item) => action.toLowerCase().includes(item))) {
			return ImportanceLevel.CRITICAL;
		}
		if (high.some((item) => action.toLowerCase().includes(item))) {
			return ImportanceLevel.HIGH;
		}
		return ImportanceLevel.MEDIUM;
	}

	private static mapNLPEntityTypeToEntityType(nlpType: string): EntityType {
		switch (nlpType) {
			case "person":
				return EntityType.PERSON;
			case "organization":
				return EntityType.ORGANIZATION;
			case "location":
				return EntityType.LOCATION;
			case "date":
				return EntityType.DATE;
			case "money":
				return EntityType.FINANCIAL;
			default:
				return EntityType.OTHER;
		}
	}

	private static mapMetadataEntityTypeToEntityType(metadataType: string): EntityType {
		switch (metadataType) {
			case "person":
				return EntityType.PERSON;
			case "organization":
				return EntityType.ORGANIZATION;
			case "location":
				return EntityType.LOCATION;
			case "date":
				return EntityType.DATE;
			case "phone":
				return EntityType.PHONE_NUMBER;
			case "email":
				return EntityType.EMAIL;
			case "address":
				return EntityType.ADDRESS;
			case "document_id":
				return EntityType.DOCUMENT;
			default:
				return EntityType.OTHER;
		}
	}
}

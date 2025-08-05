// Advanced Document Processor for text extraction, NLP, and content analysis

import { BaseAIProcessor, ProcessingContext, ProcessingOptions, ProcessingStage } from "./base-processor";
import { AIAnalysisType } from "../../shared/types/common";
import { AIProcessingError } from "../../shared/errors/domain-errors";
import { MetadataExtractionResult, TechnicalMetadata, ContentMetadata, ForensicMetadata, ExtractedEntity, AuditTrailEntry, TamperIndicator, SoftwareInfo, createAnalysisResult } from "../models/ai-analysis-result";
import { generateId } from "../../shared/utils/generators";

export interface DocumentData {
	filePath: string;
	fileType: DocumentType;
	pageCount?: number;
	textContent: string;
	structuredContent: DocumentStructure;
	rawMetadata: Record<string, any>;
	extractedImages?: ExtractedImage[];
	tables?: ExtractedTable[];
	forms?: ExtractedForm[];
}

export enum DocumentType {
	PDF = "pdf",
	WORD = "word",
	EXCEL = "excel",
	POWERPOINT = "powerpoint",
	TEXT = "text",
	HTML = "html",
	XML = "xml",
	JSON = "json",
	CSV = "csv",
	RTF = "rtf",
	OTHER = "other",
}

export interface DocumentStructure {
	sections: DocumentSection[];
	headings: DocumentHeading[];
	paragraphs: DocumentParagraph[];
	lists: DocumentList[];
	metadata: StructuralMetadata;
}

export interface DocumentSection {
	id: string;
	title: string;
	level: number;
	startPage?: number;
	endPage?: number;
	content: string;
	subsections: string[]; // IDs of subsections
}

export interface DocumentHeading {
	id: string;
	text: string;
	level: number; // H1, H2, etc.
	page?: number;
	position?: { x: number; y: number };
	formatting?: TextFormatting;
}

export interface DocumentParagraph {
	id: string;
	text: string;
	page?: number;
	position?: { x: number; y: number; width: number; height: number };
	formatting?: TextFormatting;
	language?: string;
}

export interface DocumentList {
	id: string;
	type: "ordered" | "unordered";
	items: DocumentListItem[];
	page?: number;
}

export interface DocumentListItem {
	id: string;
	text: string;
	level: number;
	subitems?: DocumentListItem[];
}

export interface TextFormatting {
	fontFamily?: string;
	fontSize?: number;
	bold?: boolean;
	italic?: boolean;
	underlined?: boolean;
	color?: string;
	backgroundColor?: string;
}

export interface StructuralMetadata {
	hasTableOfContents: boolean;
	hasIndex: boolean;
	hasFootnotes: boolean;
	hasHeaders: boolean;
	hasFooters: boolean;
	pageOrientation: "portrait" | "landscape" | "mixed";
	estimatedReadingTime: number; // minutes
}

export interface ExtractedImage {
	id: string;
	page?: number;
	position?: { x: number; y: number; width: number; height: number };
	format: string;
	size: number;
	description?: string;
	ocrText?: string;
	base64Data?: string;
}

export interface ExtractedTable {
	id: string;
	page?: number;
	position?: { x: number; y: number; width: number; height: number };
	rows: TableRow[];
	headers?: string[];
	caption?: string;
}

export interface TableRow {
	cells: TableCell[];
}

export interface TableCell {
	text: string;
	colspan?: number;
	rowspan?: number;
	formatting?: TextFormatting;
}

export interface ExtractedForm {
	id: string;
	page?: number;
	fields: FormField[];
	formType?: string;
}

export interface FormField {
	id: string;
	name: string;
	type: "text" | "checkbox" | "radio" | "select" | "textarea" | "signature";
	value?: string;
	label?: string;
	required?: boolean;
	position?: { x: number; y: number; width: number; height: number };
}

export interface DocumentProcessingOptions extends ProcessingOptions {
	extractImages?: boolean;
	extractTables?: boolean;
	extractForms?: boolean;
	performOCR?: boolean;
	analyzeStructure?: boolean;
	extractMetadata?: boolean;
	detectLanguages?: boolean;
	analyzeForensics?: boolean;
	extractEntities?: boolean;
	generateSummary?: boolean;
	confidenceThreshold?: number;
}

export class DocumentProcessor extends BaseAIProcessor<MetadataExtractionResult> {
	private static readonly SUPPORTED_MIME_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/html", "text/xml", "application/xml", "application/json", "text/csv", "application/rtf"];

	constructor() {
		super(
			AIAnalysisType.METADATA_EXTRACTION,
			"advanced-document-model",
			"v2.5",
			DocumentProcessor.SUPPORTED_MIME_TYPES,
			100 * 1024 * 1024, // 100MB max
			300000 // 5 minutes timeout
		);
	}

	protected async preprocess(context: ProcessingContext, options: ProcessingOptions): Promise<DocumentData> {
		const docOptions = options as DocumentProcessingOptions;

		this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 10, "Detecting document type");

		try {
			// Detect document type
			const documentType = this.detectDocumentType(context.mimeType, context.fileName);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 30, "Extracting raw content");

			// Extract raw content based on document type
			const rawContent = await this.extractRawContent(context.filePath, documentType);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 50, "Extracting text content");

			// Extract text content
			const textContent = await this.extractTextContent(rawContent, documentType);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 70, "Analyzing document structure");

			// Analyze document structure
			const structuredContent = docOptions.analyzeStructure !== false ? await this.analyzeDocumentStructure(rawContent, textContent, documentType) : this.getDefaultStructure();

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 85, "Extracting embedded content");

			// Extract embedded content (images, tables, forms)
			const embeddedContent = await this.extractEmbeddedContent(rawContent, documentType, docOptions);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 100, "Preprocessing complete");

			return {
				filePath: context.filePath,
				fileType: documentType,
				pageCount: rawContent.pageCount,
				textContent,
				structuredContent,
				rawMetadata: rawContent.metadata || {},
				...embeddedContent,
			};
		} catch (error) {
			throw new AIProcessingError(this.analysisType, `Document preprocessing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	protected async performAnalysis(documentData: DocumentData, context: ProcessingContext, options: ProcessingOptions): Promise<MetadataExtractionResult> {
		const docOptions = options as DocumentProcessingOptions;

		try {
			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 10, "Extracting technical metadata");

			// 1. Extract technical metadata
			const technicalMetadata = await this.extractTechnicalMetadata(documentData);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 30, "Extracting content metadata");

			// 2. Extract content metadata
			const contentMetadata = await this.extractContentMetadata(documentData, docOptions);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 50, "Performing forensic analysis");

			// 3. Forensic analysis
			const forensicMetadata = docOptions.analyzeForensics ? await this.performForensicAnalysis(documentData, context) : this.getDefaultForensicMetadata();

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 70, "Extracting entities");

			// 4. Extract entities
			const extractedEntities = docOptions.extractEntities !== false ? await this.extractEntities(documentData, docOptions) : [];

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 100, "Analysis complete");

			// Calculate overall confidence
			const overallConfidence = this.calculateDocumentConfidence(documentData, extractedEntities, technicalMetadata);

			const result = createAnalysisResult<MetadataExtractionResult>({
				analysisType: AIAnalysisType.METADATA_EXTRACTION,
				confidence: overallConfidence,
				processingTimeMs: 0, // Will be set by base class
				modelVersion: this.modelVersion,
				technicalMetadata,
				contentMetadata,
				forensicMetadata,
				extractedEntities,
			});

			return result;
		} catch (error) {
			throw new AIProcessingError(this.analysisType, `Document analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	// Private implementation methods
	private detectDocumentType(mimeType: string, fileName: string): DocumentType {
		if (mimeType.includes("pdf")) return DocumentType.PDF;
		if (mimeType.includes("word") || fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
			return DocumentType.WORD;
		}
		if (mimeType.includes("excel") || fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
			return DocumentType.EXCEL;
		}
		if (mimeType.includes("powerpoint") || fileName.endsWith(".pptx") || fileName.endsWith(".ppt")) {
			return DocumentType.POWERPOINT;
		}
		if (mimeType.includes("text/plain")) return DocumentType.TEXT;
		if (mimeType.includes("text/html")) return DocumentType.HTML;
		if (mimeType.includes("xml")) return DocumentType.XML;
		if (mimeType.includes("json")) return DocumentType.JSON;
		if (mimeType.includes("csv")) return DocumentType.CSV;
		if (mimeType.includes("rtf")) return DocumentType.RTF;

		return DocumentType.OTHER;
	}

	private async extractRawContent(filePath: string, documentType: DocumentType): Promise<{ content: any; pageCount?: number; metadata?: Record<string, any> }> {
		// Mock content extraction - in reality would use libraries like:
		// - PDF: pdf-parse, pdf2pic, poppler
		// - Word: mammoth, docx-parser
		// - Excel: xlsx, exceljs
		// - PowerPoint: node-pptx

		return {
			content: "Mock document content",
			pageCount: documentType === DocumentType.PDF ? 5 : undefined,
			metadata: {
				creator: "Microsoft Word",
				creationDate: new Date().toISOString(),
				modificationDate: new Date().toISOString(),
			},
		};
	}

	private async extractTextContent(rawContent: any, documentType: DocumentType): Promise<string> {
		// Mock text extraction
		switch (documentType) {
			case DocumentType.PDF:
				return "This is extracted text from a PDF document. It contains important information about the investigation case including dates, names, and evidence references.";
			case DocumentType.WORD:
				return "This document contains formal investigation notes and witness statements. The content includes structured information about the case.";
			case DocumentType.TEXT:
				return "Plain text file content with investigation notes and observations.";
			case DocumentType.JSON:
				return JSON.stringify({ investigation: "case_001", evidence: ["item1", "item2"] }, null, 2);
			case DocumentType.CSV:
				return "Date,Time,Event,Location\n2024-01-15,14:30,Evidence collected,Crime scene\n2024-01-16,09:00,Witness interview,Police station";
			default:
				return "Extracted text content from document.";
		}
	}

	private async analyzeDocumentStructure(rawContent: any, textContent: string, documentType: DocumentType): Promise<DocumentStructure> {
		// Mock structure analysis
		const sections: DocumentSection[] = [
			{
				id: generateId(),
				title: "Investigation Summary",
				level: 1,
				startPage: 1,
				endPage: 2,
				content: "Summary of the investigation case...",
				subsections: [],
			},
			{
				id: generateId(),
				title: "Evidence Details",
				level: 1,
				startPage: 3,
				endPage: 4,
				content: "Detailed description of evidence...",
				subsections: [],
			},
		];

		const headings: DocumentHeading[] = [
			{
				id: generateId(),
				text: "Investigation Summary",
				level: 1,
				page: 1,
				formatting: { fontSize: 16, bold: true },
			},
			{
				id: generateId(),
				text: "Evidence Details",
				level: 1,
				page: 3,
				formatting: { fontSize: 16, bold: true },
			},
		];

		const paragraphs: DocumentParagraph[] = [
			{
				id: generateId(),
				text: "This investigation began on January 15, 2024, following reports of suspicious activity.",
				page: 1,
				formatting: { fontSize: 12 },
				language: "en",
			},
		];

		const lists: DocumentList[] = [
			{
				id: generateId(),
				type: "unordered",
				page: 2,
				items: [
					{
						id: generateId(),
						text: "Evidence item 1: Digital camera",
						level: 1,
					},
					{
						id: generateId(),
						text: "Evidence item 2: Mobile phone",
						level: 1,
					},
				],
			},
		];

		const metadata: StructuralMetadata = {
			hasTableOfContents: false,
			hasIndex: false,
			hasFootnotes: true,
			hasHeaders: true,
			hasFooters: false,
			pageOrientation: "portrait",
			estimatedReadingTime: Math.ceil(textContent.split(" ").length / 200), // 200 WPM
		};

		return {
			sections,
			headings,
			paragraphs,
			lists,
			metadata,
		};
	}

	private getDefaultStructure(): DocumentStructure {
		return {
			sections: [],
			headings: [],
			paragraphs: [],
			lists: [],
			metadata: {
				hasTableOfContents: false,
				hasIndex: false,
				hasFootnotes: false,
				hasHeaders: false,
				hasFooters: false,
				pageOrientation: "portrait",
				estimatedReadingTime: 5,
			},
		};
	}

	private async extractEmbeddedContent(
		rawContent: any,
		documentType: DocumentType,
		options: DocumentProcessingOptions
	): Promise<{
		extractedImages?: ExtractedImage[];
		tables?: ExtractedTable[];
		forms?: ExtractedForm[];
	}> {
		const result: any = {};

		if (options.extractImages) {
			result.extractedImages = [
				{
					id: generateId(),
					page: 1,
					position: { x: 100, y: 200, width: 300, height: 200 },
					format: "jpeg",
					size: 50000,
					description: "Evidence photograph",
					ocrText: "EVIDENCE ITEM #001",
				},
			];
		}

		if (options.extractTables) {
			result.tables = [
				{
					id: generateId(),
					page: 2,
					position: { x: 50, y: 100, width: 500, height: 150 },
					headers: ["Date", "Time", "Event", "Location"],
					rows: [
						{
							cells: [{ text: "2024-01-15" }, { text: "14:30" }, { text: "Evidence collected" }, { text: "Crime scene" }],
						},
						{
							cells: [{ text: "2024-01-16" }, { text: "09:00" }, { text: "Witness interview" }, { text: "Police station" }],
						},
					],
					caption: "Investigation Timeline",
				},
			];
		}

		if (options.extractForms) {
			result.forms = [
				{
					id: generateId(),
					page: 3,
					formType: "evidence_log",
					fields: [
						{
							id: generateId(),
							name: "case_number",
							type: "text",
							value: "CASE-2024-001",
							label: "Case Number",
							required: true,
						},
						{
							id: generateId(),
							name: "evidence_type",
							type: "select",
							value: "digital",
							label: "Evidence Type",
							required: true,
						},
					],
				},
			];
		}

		return result;
	}

	private async extractTechnicalMetadata(documentData: DocumentData): Promise<TechnicalMetadata> {
		return {
			fileFormat: documentData.fileType,
			gpsCoordinates: undefined, // Documents typically don't have GPS
			timestamp: new Date(),
			softwareInfo: {
				createdWith: "Microsoft Word",
				version: "16.0",
				platform: "Windows",
			},
		};
	}

	private async extractContentMetadata(documentData: DocumentData, options: DocumentProcessingOptions): Promise<ContentMetadata> {
		// Extract content metadata from document structure and text
		const title = documentData.structuredContent.headings.length > 0 ? documentData.structuredContent.headings[0].text : undefined;

		const description = documentData.structuredContent.sections.length > 0 ? documentData.structuredContent.sections[0].content.substring(0, 200) + "..." : undefined;

		return {
			title,
			description,
			tags: this.extractTags(documentData.textContent),
			categories: this.categorizeDocument(documentData),
			author: documentData.rawMetadata.creator || documentData.rawMetadata.author,
			copyright: documentData.rawMetadata.copyright,
			license: documentData.rawMetadata.license,
		};
	}

	private extractTags(textContent: string): string[] {
		// Simple keyword extraction - in reality would use NLP
		const keywords = ["investigation", "evidence", "case", "witness", "suspect", "crime", "scene"];
		const lowerText = textContent.toLowerCase();

		return keywords.filter((keyword) => lowerText.includes(keyword));
	}

	private categorizeDocument(documentData: DocumentData): string[] {
		const categories: string[] = [];

		if (documentData.textContent.toLowerCase().includes("investigation")) {
			categories.push("investigation");
		}
		if (documentData.textContent.toLowerCase().includes("evidence")) {
			categories.push("evidence");
		}
		if (documentData.textContent.toLowerCase().includes("report")) {
			categories.push("report");
		}

		return categories;
	}

	private async performForensicAnalysis(documentData: DocumentData, context: ProcessingContext): Promise<ForensicMetadata> {
		// Mock forensic analysis
		const hashSums = {
			md5: "d41d8cd98f00b204e9800998ecf8427e",
			sha1: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
			sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
		};

		const auditTrail: AuditTrailEntry[] = [
			{
				action: "created",
				timestamp: new Date("2024-01-15T10:00:00Z"),
				user: "John Doe",
				software: "Microsoft Word",
				details: { version: "16.0" },
			},
			{
				action: "modified",
				timestamp: new Date("2024-01-15T15:30:00Z"),
				user: "Jane Smith",
				software: "Microsoft Word",
				details: { changes: "content_update" },
			},
		];

		const tamperIndicators: TamperIndicator[] = [];

		return {
			hashSums,
			auditTrail,
			integrityStatus: "intact",
			tamperIndicators,
		};
	}

	private getDefaultForensicMetadata(): ForensicMetadata {
		return {
			hashSums: {},
			auditTrail: [],
			integrityStatus: "unknown",
			tamperIndicators: [],
		};
	}

	private async extractEntities(documentData: DocumentData, options: DocumentProcessingOptions): Promise<ExtractedEntity[]> {
		// Mock entity extraction using NLP
		const entities: ExtractedEntity[] = [
			{
				type: "person",
				value: "John Doe",
				confidence: 0.92,
				source: "content",
				context: "Investigation led by John Doe",
			},
			{
				type: "date",
				value: "2024-01-15",
				confidence: 0.95,
				source: "content",
				context: "Investigation began on January 15, 2024",
			},
			{
				type: "location",
				value: "Crime scene",
				confidence: 0.85,
				source: "content",
				context: "Evidence collected at the crime scene",
			},
			{
				type: "document_id",
				value: "CASE-2024-001",
				confidence: 0.98,
				source: "content",
				context: "Case number CASE-2024-001",
			},
		];

		return entities;
	}

	private calculateDocumentConfidence(documentData: DocumentData, entities: ExtractedEntity[], technicalMetadata: TechnicalMetadata): number {
		const textQuality = documentData.textContent.length > 100 ? 0.9 : 0.5;
		const structureQuality = documentData.structuredContent.sections.length > 0 ? 0.8 : 0.6;
		const entityConfidence = entities.length > 0 ? entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length : 0.5;

		return (textQuality + structureQuality + entityConfidence) / 3;
	}

	estimateProcessingTime(context: ProcessingContext): number {
		// Document processing time depends on file size and complexity
		const baseTime = 10000; // 10 seconds base
		const sizeMultiplier = context.fileSize / (1024 * 1024); // MB

		// PDFs and complex documents take longer
		const complexityMultiplier = context.mimeType.includes("pdf") ? 2 : 1;

		return Math.round(baseTime + sizeMultiplier * 1000 * complexityMultiplier);
	}
}

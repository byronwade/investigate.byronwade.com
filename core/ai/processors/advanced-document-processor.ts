import pdf from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { extractRawText } from "pptx-parser";
import { createWorker } from "tesseract.js";
import { marked } from "marked";
import { parse } from "node-html-parser";
import fs from "fs/promises";
import path from "path";

// Core types and utilities
import { BaseAIProcessor } from "./base-processor";
import { AIAnalysisType, ProcessingStage, ProcessingContext, ProcessingOptions } from "../types/processing-types";
import { AIProcessingError } from "../errors/processing-errors";
import { createAnalysisResult } from "../utils/result-helpers";

export interface DocumentExtractionResult {
	analysisType: AIAnalysisType.DOCUMENT_EXTRACTION;
	confidence: number;
	processingTimeMs: number;
	modelVersion: string;

	// Core content
	fullText: string;
	extractedPages: DocumentPage[];
	semanticSections: SemanticSection[];

	// Metadata
	documentMetadata: DocumentMetadata;
	technicalMetadata: TechnicalMetadata;

	// Advanced features
	crossReferenceMap: CrossReferenceMap;
	readingOrderMap: ReadingOrderEntry[];
	extractedEntities: ExtractedEntity[];
	structuralElements: StructuralElement[];
}

export interface DocumentPage {
	pageNumber: number;
	rawText: string;
	processedText: string;
	readingOrder: TextBlock[];
	images: ImageReference[];
	tables: TableStructure[];
	headers: string[];
	footers: string[];
	annotations: Annotation[];
}

export interface SemanticSection {
	id: string;
	title: string;
	content: string;
	startPage: number;
	endPage: number;
	level: number;
	parentSectionId?: string;
	childSectionIds: string[];
	crossReferences: string[];
}

export interface TextBlock {
	id: string;
	text: string;
	bounds: BoundingBox;
	fontInfo: FontInfo;
	readingOrder: number;
	continuesToNext: boolean;
	continuesFromPrevious: boolean;
	semanticType: "header" | "paragraph" | "list" | "table" | "caption" | "footer";
}

export interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
	page: number;
}

export interface FontInfo {
	family: string;
	size: number;
	weight: string;
	style: string;
	color: string;
}

export interface CrossReferenceMap {
	[referenceId: string]: {
		source: string;
		target: string;
		type: "section" | "figure" | "table" | "appendix" | "page";
		resolved: boolean;
	};
}

export interface ReadingOrderEntry {
	blockId: string;
	pageNumber: number;
	position: number;
	nextBlockId?: string;
	semanticContinuity: boolean;
}

export interface DocumentMetadata {
	title?: string;
	author?: string;
	subject?: string;
	creator?: string;
	producer?: string;
	creationDate?: Date;
	modificationDate?: Date;
	keywords?: string[];
	pageCount: number;
	language?: string;
	documentType: string;
}

export interface TechnicalMetadata {
	fileSize: number;
	processingTime: number;
	extractionMethod: "direct" | "ocr" | "hybrid";
	ocrConfidence?: number;
	hasEncryption: boolean;
	hasImages: boolean;
	hasTables: boolean;
	hasFormFields: boolean;
	compressionRatio?: number;
	colorSpace?: string;
}

export interface ExtractedEntity {
	type: "person" | "organization" | "location" | "date" | "money" | "email" | "phone" | "url" | "document_reference";
	value: string;
	confidence: number;
	occurrences: EntityOccurrence[];
}

export interface EntityOccurrence {
	page: number;
	position: BoundingBox;
	context: string;
}

export interface StructuralElement {
	type: "header" | "footer" | "sidebar" | "table_of_contents" | "index" | "bibliography" | "appendix";
	content: string;
	pages: number[];
	metadata: Record<string, any>;
}

export interface TableStructure {
	id: string;
	pageNumber: number;
	bounds: BoundingBox;
	headers: string[];
	rows: string[][];
	caption?: string;
	crossReferences: string[];
}

export interface ImageReference {
	id: string;
	pageNumber: number;
	bounds: BoundingBox;
	caption?: string;
	description?: string;
	extractedText?: string;
	ocrConfidence?: number;
}

export interface Annotation {
	type: "highlight" | "note" | "stamp" | "underline" | "strikeout";
	content: string;
	author?: string;
	creationDate?: Date;
	bounds: BoundingBox;
}

export interface DocumentProcessingOptions extends ProcessingOptions {
	enableOCR?: boolean;
	ocrLanguage?: string;
	preserveFormatting?: boolean;
	extractImages?: boolean;
	extractTables?: boolean;
	enableSemanticAnalysis?: boolean;
	enableCrossReferenceResolution?: boolean;
	performEntityExtraction?: boolean;
	chunkSize?: number;
	overlapSize?: number;
}

/**
 * Advanced Document Processor with semantic understanding and cross-page continuity
 * Addresses the document continuity problem by maintaining context across boundaries
 */
export class AdvancedDocumentProcessor extends BaseAIProcessor<DocumentExtractionResult> {
	private static readonly SUPPORTED_MIME_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "text/plain", "text/html", "text/markdown", "application/json", "text/csv", "application/rtf"];

	private ocrWorker?: any;

	constructor() {
		super(
			AIAnalysisType.DOCUMENT_EXTRACTION,
			"advanced-document-v3.0",
			"v3.0",
			AdvancedDocumentProcessor.SUPPORTED_MIME_TYPES,
			500 * 1024 * 1024, // 500MB max
			600000 // 10 minutes timeout
		);
	}

	protected async preprocess(context: ProcessingContext, options: ProcessingOptions): Promise<any> {
		const docOptions = options as DocumentProcessingOptions;

		this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 10, "Analyzing document structure");

		try {
			// Read file
			const filePath = context.filePath;
			const fileBuffer = await fs.readFile(filePath);

			// Extract raw content based on file type
			const extractionResult = await this.extractDocumentContent(fileBuffer, context.mimeType, docOptions);

			this.logProcessingProgress(context, ProcessingStage.PREPROCESSING, 100, "Document preprocessing complete");

			return extractionResult;
		} catch (error) {
			throw new AIProcessingError(this.analysisType, `Document preprocessing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	protected async performAnalysis(extractionData: any, context: ProcessingContext, options: ProcessingOptions): Promise<DocumentExtractionResult> {
		const docOptions = options as DocumentProcessingOptions;

		try {
			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 10, "Processing semantic structure");

			// Perform semantic analysis across pages
			const semanticSections = docOptions.enableSemanticAnalysis ? await this.performSemanticAnalysis(extractionData) : [];

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 30, "Resolving cross-references");

			// Resolve cross-references
			const crossReferenceMap = docOptions.enableCrossReferenceResolution ? await this.resolveCrossReferences(extractionData, semanticSections) : {};

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 50, "Establishing reading order");

			// Establish proper reading order
			const readingOrderMap = await this.establishReadingOrder(extractionData);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 70, "Extracting entities");

			// Extract entities if enabled
			const extractedEntities = docOptions.performEntityExtraction ? await this.extractEntities(extractionData) : [];

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 90, "Assembling final document");

			// Assemble full text with proper continuity
			const fullText = await this.assembleFullText(extractionData, readingOrderMap);

			this.logProcessingProgress(context, ProcessingStage.ANALYZING, 100, "Analysis complete");

			// Calculate confidence
			const confidence = this.calculateOverallConfidence(extractionData, extractedEntities);

			return createAnalysisResult<DocumentExtractionResult>({
				analysisType: AIAnalysisType.DOCUMENT_EXTRACTION,
				confidence,
				processingTimeMs: 0, // Set by base class
				modelVersion: this.modelVersion,
				fullText,
				extractedPages: extractionData.pages || [],
				semanticSections,
				documentMetadata: extractionData.metadata || {},
				technicalMetadata: extractionData.technicalMetadata || {},
				crossReferenceMap,
				readingOrderMap,
				extractedEntities,
				structuralElements: extractionData.structuralElements || [],
			});
		} catch (error) {
			throw new AIProcessingError(this.analysisType, `Document analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Extract content from different document types
	 */
	private async extractDocumentContent(fileBuffer: Buffer, mimeType: string, options: DocumentProcessingOptions): Promise<any> {
		if (mimeType.includes("pdf")) {
			return await this.extractPDFContent(fileBuffer, options);
		} else if (mimeType.includes("word") || mimeType.includes("docx")) {
			return await this.extractWordContent(fileBuffer, options);
		} else if (mimeType.includes("excel") || mimeType.includes("xlsx")) {
			return await this.extractExcelContent(fileBuffer, options);
		} else if (mimeType.includes("powerpoint") || mimeType.includes("pptx")) {
			return await this.extractPowerPointContent(fileBuffer, options);
		} else if (mimeType.includes("text/plain")) {
			return await this.extractTextContent(fileBuffer, options);
		} else if (mimeType.includes("text/html")) {
			return await this.extractHTMLContent(fileBuffer, options);
		} else if (mimeType.includes("markdown")) {
			return await this.extractMarkdownContent(fileBuffer, options);
		} else if (mimeType.includes("json")) {
			return await this.extractJSONContent(fileBuffer, options);
		} else if (mimeType.includes("csv")) {
			return await this.extractCSVContent(fileBuffer, options);
		}

		throw new Error(`Unsupported document type: ${mimeType}`);
	}

	/**
	 * Extract PDF content with advanced text extraction and OCR fallback
	 */
	private async extractPDFContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		try {
			// First attempt: Direct text extraction
			const pdfData = await pdf(fileBuffer, {
				normalizeWhitespace: false,
				disableCombineTextItems: false,
			});

			const pages: DocumentPage[] = [];
			const technicalMetadata: TechnicalMetadata = {
				fileSize: fileBuffer.length,
				processingTime: 0,
				extractionMethod: "direct",
				hasEncryption: false,
				hasImages: false,
				hasTables: false,
				hasFormFields: false,
			};

			// Check if text extraction was successful
			const hasGoodText = pdfData.text && pdfData.text.trim().length > 50;

			if (!hasGoodText && options.enableOCR) {
				// Fallback to OCR if direct extraction fails
				technicalMetadata.extractionMethod = "ocr";
				// TODO: Implement OCR processing
				console.log("OCR processing would be implemented here");
			}

			// Process each page (mock for now, would use pdf2pic + detailed analysis)
			const mockPageCount = Math.max(1, Math.floor(pdfData.text.length / 2000));
			const textPerPage = Math.ceil(pdfData.text.length / mockPageCount);

			for (let i = 0; i < mockPageCount; i++) {
				const startIdx = i * textPerPage;
				const endIdx = Math.min((i + 1) * textPerPage, pdfData.text.length);
				const pageText = pdfData.text.slice(startIdx, endIdx);

				const page: DocumentPage = {
					pageNumber: i + 1,
					rawText: pageText,
					processedText: pageText.trim(),
					readingOrder: await this.analyzePageReadingOrder(pageText, i + 1),
					images: [],
					tables: [],
					headers: [],
					footers: [],
					annotations: [],
				};

				pages.push(page);
			}

			return {
				pages,
				metadata: {
					title: pdfData.info?.Title,
					author: pdfData.info?.Author,
					subject: pdfData.info?.Subject,
					creator: pdfData.info?.Creator,
					producer: pdfData.info?.Producer,
					creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
					modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined,
					pageCount: mockPageCount,
					documentType: "PDF",
				},
				technicalMetadata,
				structuralElements: [],
			};
		} catch (error) {
			throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Extract Word document content
	 */
	private async extractWordContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		try {
			const result = await mammoth.extractRawText({ buffer: fileBuffer });

			const pages: DocumentPage[] = [
				{
					pageNumber: 1,
					rawText: result.value,
					processedText: result.value.trim(),
					readingOrder: await this.analyzePageReadingOrder(result.value, 1),
					images: [],
					tables: [],
					headers: [],
					footers: [],
					annotations: [],
				},
			];

			const technicalMetadata: TechnicalMetadata = {
				fileSize: fileBuffer.length,
				processingTime: 0,
				extractionMethod: "direct",
				hasEncryption: false,
				hasImages: false,
				hasTables: false,
				hasFormFields: false,
			};

			return {
				pages,
				metadata: {
					pageCount: 1,
					documentType: "Word Document",
				},
				technicalMetadata,
				structuralElements: [],
			};
		} catch (error) {
			throw new Error(`Word document extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Extract Excel content
	 */
	private async extractExcelContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		try {
			const workbook = XLSX.read(fileBuffer, { type: "buffer" });

			let fullText = "";
			const pages: DocumentPage[] = [];

			workbook.SheetNames.forEach((sheetName, index) => {
				const worksheet = workbook.Sheets[sheetName];
				const csvText = XLSX.utils.sheet_to_csv(worksheet);

				fullText += `\n=== Sheet: ${sheetName} ===\n${csvText}\n`;

				const page: DocumentPage = {
					pageNumber: index + 1,
					rawText: csvText,
					processedText: csvText,
					readingOrder: [],
					images: [],
					tables: [
						{
							id: `table_${index + 1}`,
							pageNumber: index + 1,
							bounds: { x: 0, y: 0, width: 100, height: 100, page: index + 1 },
							headers: [],
							rows: csvText.split("\n").map((row) => row.split(",")),
							caption: sheetName,
							crossReferences: [],
						},
					],
					headers: [],
					footers: [],
					annotations: [],
				};

				pages.push(page);
			});

			const technicalMetadata: TechnicalMetadata = {
				fileSize: fileBuffer.length,
				processingTime: 0,
				extractionMethod: "direct",
				hasEncryption: false,
				hasImages: false,
				hasTables: true,
				hasFormFields: false,
			};

			return {
				pages,
				metadata: {
					pageCount: pages.length,
					documentType: "Excel Spreadsheet",
				},
				technicalMetadata,
				structuralElements: [],
			};
		} catch (error) {
			throw new Error(`Excel extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Extract PowerPoint content
	 */
	private async extractPowerPointContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		try {
			// Note: pptx-parser may need adjustments for newer versions
			const text = await extractRawText(fileBuffer);

			const pages: DocumentPage[] = [
				{
					pageNumber: 1,
					rawText: text,
					processedText: text.trim(),
					readingOrder: await this.analyzePageReadingOrder(text, 1),
					images: [],
					tables: [],
					headers: [],
					footers: [],
					annotations: [],
				},
			];

			const technicalMetadata: TechnicalMetadata = {
				fileSize: fileBuffer.length,
				processingTime: 0,
				extractionMethod: "direct",
				hasEncryption: false,
				hasImages: true,
				hasTables: false,
				hasFormFields: false,
			};

			return {
				pages,
				metadata: {
					pageCount: 1,
					documentType: "PowerPoint Presentation",
				},
				technicalMetadata,
				structuralElements: [],
			};
		} catch (error) {
			throw new Error(`PowerPoint extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}

	/**
	 * Extract plain text content
	 */
	private async extractTextContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		const text = fileBuffer.toString("utf-8");

		const pages: DocumentPage[] = [
			{
				pageNumber: 1,
				rawText: text,
				processedText: text.trim(),
				readingOrder: await this.analyzePageReadingOrder(text, 1),
				images: [],
				tables: [],
				headers: [],
				footers: [],
				annotations: [],
			},
		];

		const technicalMetadata: TechnicalMetadata = {
			fileSize: fileBuffer.length,
			processingTime: 0,
			extractionMethod: "direct",
			hasEncryption: false,
			hasImages: false,
			hasTables: false,
			hasFormFields: false,
		};

		return {
			pages,
			metadata: {
				pageCount: 1,
				documentType: "Plain Text",
			},
			technicalMetadata,
			structuralElements: [],
		};
	}

	/**
	 * Extract HTML content
	 */
	private async extractHTMLContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		const htmlText = fileBuffer.toString("utf-8");
		const root = parse(htmlText);
		const text = root.text;

		const pages: DocumentPage[] = [
			{
				pageNumber: 1,
				rawText: text,
				processedText: text.trim(),
				readingOrder: await this.analyzePageReadingOrder(text, 1),
				images: [],
				tables: [],
				headers: [],
				footers: [],
				annotations: [],
			},
		];

		const technicalMetadata: TechnicalMetadata = {
			fileSize: fileBuffer.length,
			processingTime: 0,
			extractionMethod: "direct",
			hasEncryption: false,
			hasImages: true,
			hasTables: true,
			hasFormFields: true,
		};

		return {
			pages,
			metadata: {
				title: root.querySelector("title")?.text,
				pageCount: 1,
				documentType: "HTML Document",
			},
			technicalMetadata,
			structuralElements: [],
		};
	}

	/**
	 * Extract Markdown content
	 */
	private async extractMarkdownContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		const markdownText = fileBuffer.toString("utf-8");
		const htmlText = marked(markdownText);
		const root = parse(htmlText);
		const text = root.text;

		const pages: DocumentPage[] = [
			{
				pageNumber: 1,
				rawText: text,
				processedText: text.trim(),
				readingOrder: await this.analyzePageReadingOrder(text, 1),
				images: [],
				tables: [],
				headers: [],
				footers: [],
				annotations: [],
			},
		];

		const technicalMetadata: TechnicalMetadata = {
			fileSize: fileBuffer.length,
			processingTime: 0,
			extractionMethod: "direct",
			hasEncryption: false,
			hasImages: false,
			hasTables: true,
			hasFormFields: false,
		};

		return {
			pages,
			metadata: {
				pageCount: 1,
				documentType: "Markdown Document",
			},
			technicalMetadata,
			structuralElements: [],
		};
	}

	/**
	 * Extract JSON content
	 */
	private async extractJSONContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		const jsonText = fileBuffer.toString("utf-8");
		const jsonData = JSON.parse(jsonText);
		const text = JSON.stringify(jsonData, null, 2);

		const pages: DocumentPage[] = [
			{
				pageNumber: 1,
				rawText: text,
				processedText: text,
				readingOrder: await this.analyzePageReadingOrder(text, 1),
				images: [],
				tables: [],
				headers: [],
				footers: [],
				annotations: [],
			},
		];

		const technicalMetadata: TechnicalMetadata = {
			fileSize: fileBuffer.length,
			processingTime: 0,
			extractionMethod: "direct",
			hasEncryption: false,
			hasImages: false,
			hasTables: false,
			hasFormFields: false,
		};

		return {
			pages,
			metadata: {
				pageCount: 1,
				documentType: "JSON Document",
			},
			technicalMetadata,
			structuralElements: [],
		};
	}

	/**
	 * Extract CSV content
	 */
	private async extractCSVContent(fileBuffer: Buffer, options: DocumentProcessingOptions): Promise<any> {
		const csvText = fileBuffer.toString("utf-8");
		const workbook = XLSX.read(csvText, { type: "string" });
		const worksheet = workbook.Sheets[workbook.SheetNames[0]];
		const jsonData = XLSX.utils.sheet_to_json(worksheet);
		const text = JSON.stringify(jsonData, null, 2);

		const pages: DocumentPage[] = [
			{
				pageNumber: 1,
				rawText: csvText,
				processedText: text,
				readingOrder: [],
				images: [],
				tables: [
					{
						id: "table_1",
						pageNumber: 1,
						bounds: { x: 0, y: 0, width: 100, height: 100, page: 1 },
						headers: [],
						rows: csvText.split("\n").map((row) => row.split(",")),
						crossReferences: [],
					},
				],
				headers: [],
				footers: [],
				annotations: [],
			},
		];

		const technicalMetadata: TechnicalMetadata = {
			fileSize: fileBuffer.length,
			processingTime: 0,
			extractionMethod: "direct",
			hasEncryption: false,
			hasImages: false,
			hasTables: true,
			hasFormFields: false,
		};

		return {
			pages,
			metadata: {
				pageCount: 1,
				documentType: "CSV Document",
			},
			technicalMetadata,
			structuralElements: [],
		};
	}

	/**
	 * Analyze reading order for a page
	 */
	private async analyzePageReadingOrder(text: string, pageNumber: number): Promise<TextBlock[]> {
		const lines = text.split("\n");
		const blocks: TextBlock[] = [];

		lines.forEach((line, index) => {
			if (line.trim()) {
				blocks.push({
					id: `block_${pageNumber}_${index}`,
					text: line,
					bounds: {
						x: 0,
						y: index * 20,
						width: line.length * 8,
						height: 20,
						page: pageNumber,
					},
					fontInfo: {
						family: "Arial",
						size: 12,
						weight: "normal",
						style: "normal",
						color: "#000000",
					},
					readingOrder: index,
					continuesToNext: index < lines.length - 1 && !line.endsWith("."),
					continuesFromPrevious: index > 0 && !lines[index - 1].endsWith("."),
					semanticType: this.detectSemanticType(line),
				});
			}
		});

		return blocks;
	}

	/**
	 * Detect semantic type of text line
	 */
	private detectSemanticType(line: string): TextBlock["semanticType"] {
		const trimmed = line.trim();

		if (trimmed.match(/^#+\s/)) return "header";
		if (trimmed.match(/^\d+\./)) return "list";
		if (trimmed.match(/^\|.*\|/)) return "table";
		if (trimmed.length < 50 && !trimmed.endsWith(".")) return "caption";
		if (trimmed.match(/^(Figure|Table|Chart)\s+\d+/i)) return "caption";

		return "paragraph";
	}

	/**
	 * Perform semantic analysis across pages
	 */
	private async performSemanticAnalysis(extractionData: any): Promise<SemanticSection[]> {
		const sections: SemanticSection[] = [];

		// This would implement advanced semantic analysis
		// For now, return basic structure

		if (extractionData.pages && extractionData.pages.length > 0) {
			sections.push({
				id: "main_content",
				title: "Document Content",
				content: extractionData.pages.map((p: DocumentPage) => p.processedText).join("\n"),
				startPage: 1,
				endPage: extractionData.pages.length,
				level: 1,
				childSectionIds: [],
				crossReferences: [],
			});
		}

		return sections;
	}

	/**
	 * Resolve cross-references within the document
	 */
	private async resolveCrossReferences(extractionData: any, sections: SemanticSection[]): Promise<CrossReferenceMap> {
		const crossRefMap: CrossReferenceMap = {};

		// This would implement cross-reference resolution
		// Looking for patterns like "See Section 2.1", "Figure 3", etc.

		return crossRefMap;
	}

	/**
	 * Establish proper reading order across pages
	 */
	private async establishReadingOrder(extractionData: any): Promise<ReadingOrderEntry[]> {
		const readingOrder: ReadingOrderEntry[] = [];

		if (extractionData.pages) {
			extractionData.pages.forEach((page: DocumentPage, pageIndex: number) => {
				page.readingOrder.forEach((block, blockIndex) => {
					readingOrder.push({
						blockId: block.id,
						pageNumber: page.pageNumber,
						position: blockIndex,
						nextBlockId: this.findNextBlock(extractionData.pages, pageIndex, blockIndex),
						semanticContinuity: block.continuesToNext,
					});
				});
			});
		}

		return readingOrder;
	}

	/**
	 * Find the next logical text block
	 */
	private findNextBlock(pages: DocumentPage[], currentPageIndex: number, currentBlockIndex: number): string | undefined {
		const currentPage = pages[currentPageIndex];

		// Next block on same page
		if (currentBlockIndex + 1 < currentPage.readingOrder.length) {
			return currentPage.readingOrder[currentBlockIndex + 1].id;
		}

		// First block on next page
		if (currentPageIndex + 1 < pages.length) {
			const nextPage = pages[currentPageIndex + 1];
			if (nextPage.readingOrder.length > 0) {
				return nextPage.readingOrder[0].id;
			}
		}

		return undefined;
	}

	/**
	 * Extract entities from the document
	 */
	private async extractEntities(extractionData: any): Promise<ExtractedEntity[]> {
		const entities: ExtractedEntity[] = [];

		// This would implement proper NER (Named Entity Recognition)
		// For now, return basic patterns

		const fullText = extractionData.pages?.map((p: DocumentPage) => p.processedText).join(" ") || "";

		// Email pattern
		const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
		const emails = fullText.match(emailRegex) || [];

		emails.forEach((email) => {
			entities.push({
				type: "email",
				value: email,
				confidence: 0.95,
				occurrences: [
					{
						page: 1,
						position: { x: 0, y: 0, width: 100, height: 20, page: 1 },
						context: `...${email}...`,
					},
				],
			});
		});

		return entities;
	}

	/**
	 * Assemble full text with proper semantic continuity
	 */
	private async assembleFullText(extractionData: any, readingOrder: ReadingOrderEntry[]): Promise<string> {
		if (!extractionData.pages || extractionData.pages.length === 0) {
			return "";
		}

		// Use reading order to assemble text with proper continuity
		let fullText = "";

		readingOrder.forEach((entry, index) => {
			const page = extractionData.pages.find((p: DocumentPage) => p.pageNumber === entry.pageNumber);
			if (page) {
				const block = page.readingOrder.find((b: TextBlock) => b.id === entry.blockId);
				if (block) {
					fullText += block.text;

					// Add appropriate spacing based on semantic continuity
					if (entry.semanticContinuity && index < readingOrder.length - 1) {
						fullText += " "; // Continue on same line
					} else {
						fullText += "\n"; // New paragraph/section
					}
				}
			}
		});

		return fullText.trim();
	}

	/**
	 * Calculate overall confidence score
	 */
	private calculateOverallConfidence(extractionData: any, entities: ExtractedEntity[]): number {
		let confidence = 0.8; // Base confidence

		// Boost confidence if we have good metadata
		if (extractionData.metadata?.title) confidence += 0.05;
		if (extractionData.metadata?.author) confidence += 0.05;

		// Boost confidence if we found entities
		if (entities.length > 0) confidence += 0.1;

		// Consider technical metadata
		if (extractionData.technicalMetadata?.extractionMethod === "direct") {
			confidence += 0.1;
		} else if (extractionData.technicalMetadata?.extractionMethod === "ocr") {
			confidence -= 0.2;
		}

		return Math.min(confidence, 1.0);
	}

	/**
	 * Initialize OCR worker if needed
	 */
	private async initializeOCR(): Promise<void> {
		if (!this.ocrWorker) {
			this.ocrWorker = await createWorker("eng");
		}
	}

	/**
	 * Cleanup resources
	 */
	async cleanup(): Promise<void> {
		if (this.ocrWorker) {
			await this.ocrWorker.terminate();
			this.ocrWorker = undefined;
		}
	}
}

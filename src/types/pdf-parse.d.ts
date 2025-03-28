declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string;
    numpages: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: {
      [key: string]: any;
    };
    version: string;
  }

  function parse(dataBuffer: Buffer, options?: {
    pagerender?: (pageData: any) => string;
    max?: number;
  }): Promise<PDFParseResult>;

  export = parse;
} 
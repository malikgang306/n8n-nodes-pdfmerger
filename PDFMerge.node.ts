
import type { IDataObject, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription } from "n8n-workflow";
import type { IExecuteFunctions } from "n8n-core";

import { PDFDocument } from "pdf-lib";
import fetch from "node-fetch";

export class PdfMergeUrl implements INodeType {
  description: INodeTypeDescription = {
    displayName: "PDF Merge (URL)",
    name: "pdfMergeUrl",
    icon: "file:pdfMergeUrl.svg",
    group: ["transform"],
    version: 1,
    description: "Merge multiple PDF files from direct URLs into a single PDF",
    defaults: {
      name: "PDF Merge (URL)",
    },
    inputs: ["main"],
    outputs: ["main"],
    properties: [
      {
        displayName: "PDF URLs",
        name: "urls",
        type: "string",
        required: true,
        default: "",
        placeholder: "[\"https://example.com/file1.pdf\", \"https://example.com/file2.pdf\"]",
        description: "An array of direct-download PDF URLs (JSON-formatted string).",
      },
      {
        displayName: "Output File Name",
        name: "fileName",
        type: "string",
        default: "merged.pdf",
        description: "File name of the merged PDF in the output binary field.",
      },
      {
        displayName: "Binary Property Name",
        name: "binaryPropertyName",
        type: "string",
        default: "data",
        description: "Name of the binary property to store the merged PDF in.",
      },
    ] as INodeProperties[],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const urlsRaw = this.getNodeParameter("urls", itemIndex) as string;
      const fileName = this.getNodeParameter("fileName", itemIndex) as string;
      const binaryPropertyName = this.getNodeParameter("binaryPropertyName", itemIndex) as string;

      let urls: string[];
      try {
        urls = JSON.parse(urlsRaw);
        if (!Array.isArray(urls)) throw new Error();
      } catch (error) {
        throw new Error("Parameter \"PDF URLs\" must be a JSON array of strings.");
      }

      if (urls.length === 0) {
        throw new Error("Provide at least one URL to merge.");
      }

      const mergedPdf = await PDFDocument.create();

      for (const url of urls) {
        if (typeof url !== "string" || url.trim() === "") {
          throw new Error(`Invalid URL provided: ${url}`);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download PDF from ${url} (status ${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();

        const donorPdf = await PDFDocument.load(arrayBuffer);
        const donorPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        donorPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();

      const binaryData = await this.helpers.prepareBinaryData(Buffer.from(mergedBytes), fileName, "application/pdf");

      returnData.push({
        binary: {
          [binaryPropertyName]: binaryData,
        },
        json: {
          fileName,
          pageCount: mergedPdf.getPageCount(),
          sourceCount: urls.length,
        } as IDataObject,
      });
    }

    return [returnData];
  }
}

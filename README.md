
# n8n-nodes-pdf-merge-url

Merge multiple PDF files from publicly accessible URLs into a single PDF directly in n8n.

## Features
* 🔗 Accepts an **array of direct PDF URLs**
* 📄 Merges all pages into one output PDF (keeps original order)
* 🏷️ Outputs both **binary** (for downstream use) and **JSON metadata** (page & source counts)

## Usage
1. Install:
```bash
cd ~/.n8n
npm install git+https://github.com/<your-user>/n8n-nodes-pdf-merge-url.git
```
2. Restart n8n.
3. Add the “PDF Merge (URL)” node in your workflow.
4. Provide a JSON array of direct-download URLs, e.g.:
```json
[
  "https://example.com/a.pdf",
  "https://example.com/b.pdf"
]
```
5. The node returns a binary `merged.pdf` plus metadata.

## Caveats
* All URLs must be **directly downloadable** without auth/captcha.
* Large PDFs will use more memory; n8n executes the merge **in-memory**.

## License
MIT

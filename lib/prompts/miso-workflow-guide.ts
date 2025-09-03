export const MISO_WORKFLOW_GUIDE = `# Module API

## Run a module

### Request Body

\`\`\`bash
curl -X POST '{endpoint_address}/workflows/run' \\
--header 'Authorization: Bearer {api_key}' \\
--header 'Content-Type: application/json' \\
--data-raw '{
"inputs": {},
"mode": "streaming",
"user": "abc-123"
}'
\`\`\`

API URLs may vary depending on your environment.

- **inputs (object) required**: Key/value pairs for variables defined in your app.
  - At least one key/value pair is required.
  - For file variables, use the object format described in the \`files\` section below.
- **mode (string) required**: Response mode, supports:
  - \`streaming\` (recommended)
    - Returns results progressively via Server-Sent Events (SSE).
  - \`blocking\`
    - Returns the full result after completion.
- **user (string) required**: End-user identifier (use any consistent identifier).
- **files (array[object]) optional**: Use when the model supports file parsing and understanding.
  - **type**: Supported file types
    - Document: TXT, MD, MARKDOWN, PDF, HTML, XLSX, XLS, DOCX, CSV, EML, MSG, PPTX, PPT, XML, EPUB
    - Image: JPG, JPEG, PNG, GIF, WEBP, SVG
    - Audio: MP3, M4A, WAV, WEBM, AMR
    - Video: MP4, MOV, MPEG, MPGA
    - Custom: Other extensions
  - **transfer_method (string)**:
    - \`remote_url\`: Provide the file via URL
    - \`local_file\`: Use the uploaded file ID from file upload API
  - **url (string)**: Required when \`transfer_method\` is \`remote_url\`
  - **upload_file_id (string)**: Required when \`transfer_method\` is \`local_file\`

### Response

- **Response mode**
  - \`blocking\`: Returns a CompletionResponse object
  - \`streaming\`: Returns a ChunkCompletionResponse stream

### Errors

- **400, invalid_param**: Invalid parameter
- **400, app_unavailable**: App configuration unavailable
- **400, provider_not_initialize**: Provider credentials not configured
- **400, provider_quota_exceeded**: Provider quota exceeded
- **400, model_currently_not_support**: Model currently not supported
- **400, workflow_request_error**: Workflow execution failed
- **500, internal_server_error**: Internal server error

## Get module run details

\`\`\`bash
curl -X GET 'https://<your-endpoint>/ext/v1/workflows/run/:workflow_id' \\
-H 'Authorization: Bearer {api_key}' \\
-H 'Content-Type: application/json'
\`\`\`

Retrieve the current execution result using the module run ID.

API URLs may vary by environment.

- **path**
  - **workflow_id (string)**: Module ID
    - Obtainable from streaming chunk response

### Response

- **id (string)**: Module run ID
- **workflow_id (string)**: Related module ID
- **status (string)**: Status (running, succeeded, failed, stopped)
- **inputs (json)**: Inputs
- **outputs (json)**: Outputs
- **error (string)**: Error reason
- **total_steps (int)**: Total steps
- **total_tokens (int)**: Total tokens used
- **created_at (timestamp)**: Started at
- **finished_at (timestamp)**: Finished at
- **elapsed_time (float)**: Elapsed time (seconds)

## Stop generation

\`\`\`bash
curl -X POST 'https://<your-endpoint>/ext/v1/workflows/tasks/:task_id/stop' \\
-H 'Authorization: Bearer {api_key}' \\
-H 'Content-Type: application/json' \\
--data-raw '{"user": "abc-123"}'
\`\`\`

This API stops generation and is supported only in streaming mode.

### Path Parameter

- **task_id (string)**: Task ID (obtainable from streaming chunk response)

### Request Body

- **user (string) required**: End-user identifier (must match initial request)

### Response

- **result (string)**: Always returns "success"

## Get execution logs

\`\`\`bash
curl -X GET 'https://<your-endpoint>/ext/v1/workflows/logs'\\
--header 'Authorization: Bearer {api_key}'
\`\`\`

Retrieve module execution logs.

Returned in reverse chronological order; the first page returns the latest {limit} messages.

### Query Parameters

- **keyword (string)**: Search keyword
- **status (string)**: Status filter (\`succeeded\`, \`failed\`, \`stopped\`)
- **page (int)**: Page number (default: 1)
- **limit (int)**: Items per page (default: 20)
  - If it exceeds system limits, limited to the maximum allowed

### Response

### Response

- **page (int)**: Current page number
- **limit (int)**: Returned item count (capped by system limits)
- **total (int)**: Total items
- **has_more (bool)**: Whether more pages are available
- **data (array[object])**: Logs
  - **id (string)**: Log ID
  - **workflow_run (object)**: Run info
    - **id (string)**: Run ID
    - **version (string)**: Module version
    - **status (string)**: Status (running, succeeded, failed, stopped)
    - **error (string)**: Optional error message
    - **elapsed_time (float)**: Elapsed time (seconds)
    - **total_tokens (int)**: Total tokens used
    - **total_steps (int)**: Total steps (default 0)
    - **created_at (timestamp)**: Started at
    - **finished_at (timestamp)**: Finished at
  - **created_from (string)**: Source
  - **created_by_role (string)**: Creator role
  - **created_by_account (string)**: Optional account info
  - **created_by_end_user (object)**: End-user info
    - **id (string)**: User ID
    - **type (string)**: User type
    - **is_anonymous (bool)**: Anonymous flag
    - **session_id (string)**: Session ID
    - **created_at (timestamp)**: Created at`;
export const MISO_CHATFLOW_AGENT_GUIDE = `# Agent / Chatflow API
---
## Send a chat message
### POST \`/chat\`

\`\`\`bash
curl -X POST '{endpoint_address}/chat' \\
--header 'Authorization: Bearer {api_key}' \\
--header 'Content-Type: application/json' \\
--data-raw '{
    "inputs": {},
    "query": "What are the specs of the iPhone 13 Pro Max?",
    "mode": "streaming",
    "conversation_id": "",
    "user": "abc-123",
    "files": [
      {
        "type": "image",
        "transfer_method": "remote_url",
        "url": "https://miso.ai/logo/logo-site.png"
      }
    ]
}'
\`\`\`

#### Request Body

| Field | Type | Description | Default |
| --- | --- | --- | --- |
| **query** | string | User input or question | – |
| **inputs** | object | Key/value pairs for variables defined in your app | \`{}\` |
| **mode** | string | Response mode<br/>• \`streaming\` (recommended, SSE)<br/>• \`blocking\` (return after completion) | – |
| **user** | string | End-user identifier (must be unique within app) | – |
| **conversation_id** | string | Provide previous \`conversation_id\` to continue a thread | – |
| **files** | array<object> | Attachments (Vision-capable models only) | – |
| &nbsp;&nbsp;• type | string | Supported type: \`image\` | – |
| &nbsp;&nbsp;• transfer_method | string | \`remote_url\` or \`local_file\` | – |
| &nbsp;&nbsp;• url | string | Image URL (for \`remote_url\`) | – |
| &nbsp;&nbsp;• upload_file_id | string | Uploaded file ID (for \`local_file\`) | – |
| **auto_gen_name** | bool | Auto-generate conversation title | \`true\` |

#### Response

* \`response_mode\` = \`blocking\` → **CompletionResponse**  
* \`response_mode\` = \`streaming\` → **ChunkCompletionResponse** stream

#### Errors

| HTTP Code | Error ID | Description |
| :--: | --- | --- |
| 404 | Conversation does not exists | Conversation not found |
| 400 | invalid_param | Invalid parameter |
| 400 | app_unavailable | App configuration unavailable |
| 400 | provider_not_initialize | Provider credentials not configured |
| 400 | provider_quota_exceeded | Provider quota exceeded |
| 400 | model_currently_not_support | Model currently not supported |
| 400 | completion_request_error | Completion request failed |
| 500 | internal_server_error | Internal server error |

---

## File upload

### POST \`/files/upload\`

\`\`\`bash
curl -X POST 'https://<your-endpoint>/ext/v1/files/upload' \\
--header 'Authorization: Bearer {api_key}' \\
--form 'file=@localfile;type=image/[png|jpeg|jpg|webp|gif]' \\
--form 'user=abc-123'
\`\`\`

> Upload image files for multimodal features.  
> Supported types: **png, jpg, jpeg, webp, gif**

#### Request Body (multipart/form-data)

| Field | Type | Required | Description |
| --- | --- | :--: | --- |
| **file** | File | ✓ | File to upload |
| **user** | string | ✓ | End-user identifier (unique per app) |

#### Response

| Field | Type | Description |
| --- | --- | --- |
| **id** | uuid | File ID |
| **name** | string | File name |
| **size** | int | File size (bytes) |
| **extension** | string | File extension |
| **mime_type** | string | MIME type |
| **created_by** | uuid | Uploader user ID |
| **created_at** | timestamp | Created at |

#### Errors

| HTTP Code | Error ID | Description |
| :--: | --- | --- |
| 400 | no_file_uploaded | No file provided |
| 400 | too_many_files | Only one file per request |
| 400 | unsupported_preview | Preview not supported |
| 400 | unsupported_estimate | Size estimation not supported |
| 413 | file_too_large | File too large |
| 415 | unsupported_file_type | Unsupported file type |
| 503 | s3_connection_failed | S3 connection failed |
| 503 | s3_permission_denied | S3 permission denied |
| 503 | s3_file_too_large | Exceeds S3 size limit |
| 500 | internal_server_error | Internal server error |

---

## Stop generating answer

### POST \`/chat/:task_id/stop\`

\`\`\`bash
curl -X POST 'https://<your-endpoint>/ext/v1/chat/:task_id/stop' \\
-H 'Authorization: Bearer {api_key}' \\
-H 'Content-Type: application/json' \\
--data-raw '{"user": "abc-123"}'
\`\`\`

*Available only in streaming mode*

#### Path Parameter
| Name | Type | Description |
| --- | --- | --- |
| **task_id** | string | Task ID from streaming chunk response |

#### Request Body
| Field | Type | Required | Description |
| --- | --- | :--: | --- |
| **user** | string | ✓ | End-user identifier (same as initial) |

#### Response

| Field | Type | Value |
| --- | --- | --- |
| **result** | string | \`"success"\` |

---

## Streaming response guide

### Overview

In \`streaming\` mode (\`mode: "streaming"\`), responses are delivered via SSE (Server-Sent Events). Example format:

\`\`\`plaintext
data: {"event": "agent_message", "answer": "partial text", "conversation_id": "conversation id", "message_id": "message id"}
\`\`\`

### Server-side (Next.js)

\`\`\`typescript
// app/api/chat/route.ts
export async function POST(request: NextRequest) {
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  }
  
  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  
  ;(async () => {
    try {
      const misoResponse = await fetch("https://api.holdings.miso.gs/ext/v1/chat", {
        method: "POST",
        headers: {
          Authorization: \`Bearer \${process.env.MISO_API_KEY}\`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ /* MISO API request */ }),
      })
      
      const reader = misoResponse.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        await writer.write(encoder.encode(chunk))
      }
    } catch (error) {
      console.error("Streaming error:", error)
    } finally {
      await writer.close()
    }
  })()
  
  return new NextResponse(stream.readable, { headers })
}
\`\`\`

### Client-side

Key steps to process streaming responses on the client:

1. Establish SSE connection
2. Parse incoming event data
3. Update UI per event type

\`\`\`typescript
const processStreamingResponse = async (message: string, messageId: string) => {
  const response = await fetch("/api/chat", { /* request options */ })
  
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let currentContent = ""
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value, { stream: true })
    
    const lines = chunk.split("\\n")
    for (const line of lines) {
      if (line.startsWith("data:")) {
        try {
          const jsonStr = line.slice(5).trim()
          if (jsonStr === "[DONE]") continue
          
          const data = JSON.parse(jsonStr)
          // event types
          // - agent_message: append partial
          // - agent_thought: agent reasoning
          // - message_replace: replace entire message
        } catch (e) {
          console.error("JSON parse error:", e)
        }
      }
    }
  }
}
\`\`\`

### Event types

- \`agent_message\`: append message content
- \`agent_thought\`: agent’s intermediate thoughts
- \`message_replace\`: replace entire message

### Optimization tips

1. Minimize unnecessary DOM updates
2. Manage memory (prune old messages)
3. Efficient state updates (functional setState)
4. Apply debouncing/throttling`;
import { McpTool } from '../types';

export const SYSTEM_MCP_TOOLS: McpTool[] = [
  {
    id: 'google_calendar_list_events',
    name: 'Google Calendar: List Events',
    version: '1.2.0',
    description: 'Fetch upcoming schedule, events, and calendar meetings for a given time range.',
    category: 'workspace',
    parameters: [
      { name: 'calendarId', type: 'string', description: 'Calendar ID (e.g., primary)', required: true },
      { name: 'timeMin', type: 'string', description: 'Start ISO timestamp (e.g. today)', required: false },
      { name: 'maxResults', type: 'number', description: 'Max events to return', required: false }
    ],
    exampleInput: { calendarId: 'primary', timeMin: new Date().toISOString(), maxResults: 10 }
  },
  {
    id: 'google_calendar_create_event',
    name: 'Google Calendar: Create Event',
    version: '1.2.0',
    description: 'Create a new calendar invite or event with summary, start time, duration, and attendees.',
    category: 'workspace',
    parameters: [
      { name: 'summary', type: 'string', description: 'Event title', required: true },
      { name: 'startTime', type: 'string', description: 'Start ISO time or quick date', required: true },
      { name: 'durationMinutes', type: 'number', description: 'Duration in minutes', required: false },
      { name: 'description', type: 'string', description: 'Event description / agenda', required: false },
      { name: 'attendees', type: 'string', description: 'Comma-separated attendee emails', required: false }
    ],
    exampleInput: {
      summary: 'AI Strategy Review',
      startTime: 'Tomorrow 10:00 AM',
      durationMinutes: 45,
      description: 'Discuss Q3 multi-agent deployment roadmap',
      attendees: 'priyanshurathod518@gmail.com, team@company.com'
    }
  },
  {
    id: 'google_search_grounding',
    name: 'Google Search Grounding',
    version: '2.0.0',
    description: 'Perform real-time web search with factual source citations using Gemini search tools.',
    category: 'search',
    parameters: [
      { name: 'query', type: 'string', description: 'Search prompt or query string', required: true }
    ],
    exampleInput: { query: 'Latest AI workflow automation releases 2026' }
  },
  {
    id: 'python_js_code_executor',
    name: 'Code Sandbox Executor',
    version: '1.0.0',
    description: 'Safely execute JavaScript / Python transformations on intermediate workflow payloads.',
    category: 'code',
    parameters: [
      { name: 'code', type: 'string', description: 'JS code block accepting `input` parameter and returning output', required: true }
    ],
    exampleInput: { code: 'return input.events.map(e => ({ title: e.summary, time: e.startTime }));' }
  },
  {
    id: 'http_rest_client',
    name: 'HTTP / REST Dispatcher',
    version: '1.4.0',
    description: 'Send custom HTTP GET/POST/PUT requests to external webhooks, APIs, or microservices.',
    category: 'http',
    parameters: [
      { name: 'url', type: 'string', description: 'Target endpoint URL', required: true },
      { name: 'method', type: 'string', description: 'GET, POST, PUT, DELETE', required: true },
      { name: 'headers', type: 'object', description: 'Headers object', required: false },
      { name: 'body', type: 'object', description: 'JSON payload body', required: false }
    ],
    exampleInput: { url: 'https://hooks.slack.com/services/sample', method: 'POST', body: { text: 'Workflow alert' } }
  }
];

import { WorkflowTemplate } from '../types';

export const INITIAL_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-daily-calendar-briefing',
    title: 'Google Calendar Daily AI Briefing',
    description: 'Fetches today’s Google Calendar events, uses Gemini to synthesize priority schedule highlights, and generates an executive briefing.',
    category: 'Productivity & Workspace',
    author: 'Nexus Flow Team',
    tags: ['Google Calendar', 'Gemini AI', 'Workspace', 'Daily Digest'],
    nodes: [
      {
        id: 'node-trigger-1',
        type: 'customNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'Schedule Trigger',
          category: 'trigger',
          typeId: 'cron_trigger',
          iconName: 'Clock',
          description: 'Triggers every morning at 8:00 AM',
          config: { cron: '0 8 * * *', timezone: 'UTC' }
        }
      },
      {
        id: 'node-gcal-1',
        type: 'customNode',
        position: { x: 340, y: 150 },
        data: {
          label: 'Google Calendar: Fetch Events',
          category: 'tool',
          typeId: 'gcal_list_events',
          iconName: 'Calendar',
          description: 'Retrieves today’s schedule & meetings',
          config: { calendarId: 'primary', maxResults: 10, daysAhead: 1 }
        }
      },
      {
        id: 'node-ai-1',
        type: 'customNode',
        position: { x: 640, y: 150 },
        data: {
          label: 'ADK Agent: Schedule Summarizer',
          category: 'agent',
          typeId: 'adk_reasoning_agent',
          iconName: 'Bot',
          description: 'Synthesizes schedule priorities & action items',
          config: {
            model: 'gemini-3.6-flash',
            systemPrompt: 'You are an elite executive assistant. Summarize calendar events into an urgent morning briefing with meeting prep notes.'
          }
        }
      },
      {
        id: 'node-slack-1',
        type: 'customNode',
        position: { x: 940, y: 150 },
        data: {
          label: 'Dispatch Briefing Alert',
          category: 'action',
          typeId: 'http_webhook',
          iconName: 'Send',
          description: 'Posts output to Slack / Discord webhook',
          config: { method: 'POST', targetChannel: 'executive-briefings' }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: 'node-trigger-1', target: 'node-gcal-1', animated: true },
      { id: 'e2-3', source: 'node-gcal-1', target: 'node-ai-1', animated: true },
      { id: 'e3-4', source: 'node-ai-1', target: 'node-slack-1', animated: true }
    ]
  },
  {
    id: 'tpl-conditional-calendar-routing',
    title: 'Conditional Event Routing & Meeting Scheduler (n8n Branching)',
    description: 'Fetches calendar events, evaluates if meetings exist via IF/Else node, and routes execution to urgent dispatch or auto-scheduling.',
    category: 'Logic & Flow Control',
    author: 'Nexus Flow Team',
    tags: ['Conditional Branching', 'IF/Else', 'Google Calendar', 'n8n Flow'],
    nodes: [
      {
        id: 'node-cb-1',
        type: 'customNode',
        position: { x: 50, y: 180 },
        data: {
          label: 'Schedule Trigger',
          category: 'trigger',
          typeId: 'cron_trigger',
          iconName: 'Clock',
          description: 'Checks schedule hourly',
          config: { cron: '0 * * * *' }
        }
      },
      {
        id: 'node-cb-2',
        type: 'customNode',
        position: { x: 330, y: 180 },
        data: {
          label: 'Fetch Calendar Schedule',
          category: 'tool',
          typeId: 'gcal_list_events',
          iconName: 'Calendar',
          description: 'Retrieves calendar events list',
          config: { calendarId: 'primary', maxResults: 10 }
        }
      },
      {
        id: 'node-cb-3',
        type: 'customNode',
        position: { x: 620, y: 180 },
        data: {
          label: 'IF: Has Scheduled Meetings?',
          category: 'logic',
          typeId: 'if_condition',
          iconName: 'Sliders',
          description: 'Evaluates if input.eventCount > 0',
          config: { expression: 'input.eventCount > 0' }
        }
      },
      {
        id: 'node-cb-4-true',
        type: 'customNode',
        position: { x: 930, y: 80 },
        data: {
          label: 'Branch TRUE: Dispatch Briefing',
          category: 'action',
          typeId: 'http_webhook',
          iconName: 'Send',
          description: 'Notifies team of upcoming meetings',
          config: { targetChannel: 'calendar-alerts' }
        }
      },
      {
        id: 'node-cb-4-false',
        type: 'customNode',
        position: { x: 930, y: 280 },
        data: {
          label: 'Branch FALSE: Auto-Book Focus Time',
          category: 'tool',
          typeId: 'gcal_create_event',
          iconName: 'CalendarPlus',
          description: 'Schedules 45m deep focus block on empty calendar',
          config: { summary: 'Autonomous Deep Focus Block', durationMinutes: 45 }
        }
      }
    ],
    edges: [
      { id: 'ecb-1', source: 'node-cb-1', target: 'node-cb-2', animated: true },
      { id: 'ecb-2', source: 'node-cb-2', target: 'node-cb-3', animated: true },
      { id: 'ecb-3-true', source: 'node-cb-3', sourceHandle: 'true', target: 'node-cb-4-true', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'ecb-3-false', source: 'node-cb-3', sourceHandle: 'false', target: 'node-cb-4-false', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } }
    ]
  },
  {
    id: 'tpl-multi-agent-researcher',
    title: 'Multi-Agent Autonomous Fact-Checker & Summarizer',
    description: 'Orchestrates a Researcher Agent with Search Grounding and an Auditor Agent to compile verified market analysis reports.',
    category: 'Multi-Agent ADK',
    author: 'AI Operations Lab',
    tags: ['Google ADK', 'Search Grounding', 'Multi-Agent', 'Research'],
    nodes: [
      {
        id: 'node-trig-m',
        type: 'customNode',
        position: { x: 50, y: 200 },
        data: {
          label: 'Webhook Trigger',
          category: 'trigger',
          typeId: 'webhook_trigger',
          iconName: 'Zap',
          description: 'Receives research query via API POST',
          config: { endpoint: '/api/webhooks/research-topic' }
        }
      },
      {
        id: 'node-agent-search',
        type: 'customNode',
        position: { x: 340, y: 100 },
        data: {
          label: 'Agent 1: Researcher (Grounding)',
          category: 'agent',
          typeId: 'adk_reasoning_agent',
          iconName: 'Search',
          description: 'Uses Google Search Grounding to collect facts',
          config: {
            model: 'gemini-3.6-flash',
            useSearchGrounding: true,
            systemPrompt: 'Research the user topic with Google Search and list key factual quotes and URLs.'
          }
        }
      },
      {
        id: 'node-agent-auditor',
        type: 'customNode',
        position: { x: 640, y: 100 },
        data: {
          label: 'Agent 2: Fact Auditor',
          category: 'agent',
          typeId: 'adk_reasoning_agent',
          iconName: 'ShieldCheck',
          description: 'Verifies findings and filters out biases',
          config: {
            model: 'gemini-3.6-flash',
            systemPrompt: 'Audit Agent 1 research output for inconsistencies and organize findings into bullet points.'
          }
        }
      },
      {
        id: 'node-gcal-schedule',
        type: 'customNode',
        position: { x: 940, y: 200 },
        data: {
          label: 'Google Calendar: Schedule Review Meeting',
          category: 'tool',
          typeId: 'gcal_create_event',
          iconName: 'CalendarPlus',
          description: 'Creates a calendar event to discuss report findings',
          config: {
            summary: 'Research Briefing Discussion',
            durationMinutes: 30,
            attendees: 'priyanshurathod518@gmail.com'
          }
        }
      }
    ],
    edges: [
      { id: 'em1', source: 'node-trig-m', target: 'node-agent-search', animated: true },
      { id: 'em2', source: 'node-agent-search', target: 'node-agent-auditor', animated: true },
      { id: 'em3', source: 'node-agent-auditor', target: 'node-gcal-schedule', animated: true }
    ]
  },
  {
    id: 'tpl-meeting-scheduler-bot',
    title: 'Smart Google Calendar Event Creator',
    description: 'Parses natural language meeting requests from email or Slack, checks calendar availability, and creates Google Calendar invitations.',
    category: 'Workspace Automation',
    author: 'Nexus Flow Team',
    tags: ['Google Calendar', 'NLP', 'Scheduling', 'Automation'],
    nodes: [
      {
        id: 'node-ms-1',
        type: 'customNode',
        position: { x: 50, y: 180 },
        data: {
          label: 'Inbound Request Webhook',
          category: 'trigger',
          typeId: 'webhook_trigger',
          iconName: 'Inbox',
          description: 'Captures incoming booking request text',
          config: { endpoint: '/api/webhooks/meeting-booking' }
        }
      },
      {
        id: 'node-ms-2',
        type: 'customNode',
        position: { x: 350, y: 180 },
        data: {
          label: 'AI Meeting Parser',
          category: 'agent',
          typeId: 'adk_reasoning_agent',
          iconName: 'Sparkles',
          description: 'Extracts title, date, time, duration, attendees',
          config: {
            model: 'gemini-3.6-flash',
            systemPrompt: 'Extract meeting parameters into JSON: summary, startTime, durationMinutes, attendees.'
          }
        }
      },
      {
        id: 'node-ms-3',
        type: 'customNode',
        position: { x: 650, y: 180 },
        data: {
          label: 'Google Calendar: Create Event',
          category: 'tool',
          typeId: 'gcal_create_event',
          iconName: 'Calendar',
          description: 'Publishes invite directly to primary Google Calendar',
          config: {
            calendarId: 'primary'
          }
        }
      }
    ],
    edges: [
      { id: 'ems-1', source: 'node-ms-1', target: 'node-ms-2', animated: true },
      { id: 'ems-2', source: 'node-ms-2', target: 'node-ms-3', animated: true }
    ]
  },
  {
    id: 'tpl-rag-vector-qa',
    title: 'Enterprise Knowledge Base RAG & Slack Alert',
    description: 'Queries vector database for semantic similarity matches against customer issues, synthesizes answers using Claude/DeepSeek, and delivers answers to Slack.',
    category: 'RAG & Vector AI',
    author: 'Nexus Flow Team',
    tags: ['Vector DB', 'RAG', 'Semantic Search', 'Slack', 'DeepSeek'],
    nodes: [
      {
        id: 'node-rag-1',
        type: 'customNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'Customer Inquiry Webhook',
          category: 'trigger',
          typeId: 'webhook_trigger',
          iconName: 'Zap',
          description: 'Triggers on incoming customer question',
          config: { endpoint: '/api/webhooks/support-rag' }
        }
      },
      {
        id: 'node-rag-2',
        type: 'customNode',
        position: { x: 350, y: 150 },
        data: {
          label: 'Vector DB: Semantic Search',
          category: 'tool',
          typeId: 'vector_db_query',
          iconName: 'Database',
          description: 'Performs cosine similarity query on knowledge base',
          config: { collection: 'enterprise_knowledge_base', topK: 3, minScore: 0.75 }
        }
      },
      {
        id: 'node-rag-3',
        type: 'customNode',
        position: { x: 650, y: 150 },
        data: {
          label: 'Ollama / DeepSeek R1 Synthesizer',
          category: 'agent',
          typeId: 'ollama_local_model',
          iconName: 'Server',
          description: 'Synthesizes accurate answers grounded strictly on retrieved context',
          config: {
            model: 'qwen2.5:0.5b',
            ollamaUrl: 'http://localhost:11434',
            prompt: 'Answer question using retrieved context: {{ $json.contextText }}'
          }
        }
      },
      {
        id: 'node-rag-4',
        type: 'customNode',
        position: { x: 950, y: 150 },
        data: {
          label: 'Slack: Send Answer',
          category: 'action',
          typeId: 'slack_message',
          iconName: 'MessageSquare',
          description: 'Posts answer to Slack channel',
          config: { message: '💡 *Support Resolution*\n{{ $json.response }}' }
        }
      }
    ],
    edges: [
      { id: 'er-1', source: 'node-rag-1', target: 'node-rag-2', animated: true },
      { id: 'er-2', source: 'node-rag-2', target: 'node-rag-3', animated: true },
      { id: 'er-3', source: 'node-rag-3', target: 'node-rag-4', animated: true }
    ]
  },
  {
    id: 'tpl-autonomous-agentic-loop',
    title: 'Autonomous Multi-Turn Agent with Notion Sync',
    description: 'Autonomous agent that loops through Google Calendar, Web Search, and JavaScript sandboxes to complete high-level goals and logs results into Notion.',
    category: 'Autonomous Multi-Agent',
    author: 'Nexus Flow Team',
    tags: ['Agentic Loop', 'Tool Calling', 'Notion', 'Autonomous AI'],
    nodes: [
      {
        id: 'node-loop-1',
        type: 'customNode',
        position: { x: 50, y: 150 },
        data: {
          label: 'Manual Trigger',
          category: 'trigger',
          typeId: 'manual_trigger',
          iconName: 'Play',
          description: 'Triggers autonomous execution plan',
          config: {}
        }
      },
      {
        id: 'node-loop-2',
        type: 'customNode',
        position: { x: 380, y: 150 },
        data: {
          label: 'Autonomous Multi-Turn Agent',
          category: 'agent',
          typeId: 'agentic_tool_caller',
          iconName: 'BrainCircuit',
          description: 'Autonomous goal execution loop with tool dispatching',
          config: {
            goal: 'Audit calendar slots, verify meeting agendas, and summarize action items.',
            model: 'gemini-3.1-pro-preview',
            maxTurns: 4
          }
        }
      },
      {
        id: 'node-loop-3',
        type: 'customNode',
        position: { x: 740, y: 150 },
        data: {
          label: 'Notion: Create Audit Record',
          category: 'action',
          typeId: 'notion_database',
          iconName: 'FileText',
          description: 'Stores final decision & execution trace in Notion database',
          config: { databaseId: 'notion-audit-db', pageTitle: 'Autonomous Audit Report' }
        }
      }
    ],
    edges: [
      { id: 'el-1', source: 'node-loop-1', target: 'node-loop-2', animated: true },
      { id: 'el-2', source: 'node-loop-2', target: 'node-loop-3', animated: true }
    ]
  },

  // ==================== CUSTOM AUTOMATION PACK (11 workflows) ====================

  {
    id: 'tpl-email-summarizer',
    title: '📧 Email Summarizer (Local Ollama)',
    description: 'Reads latest inbox emails, summarizes each with a local Llama 3 model via Docker Ollama, and sends a digest — fully private, zero cloud.',
    category: 'Email Automation',
    author: 'Nexus Flow Team',
    tags: ['Email', 'Ollama', 'Llama 3', 'Privacy-First', 'Digest'],
    nodes: [
      {
        id: 'es-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Morning Trigger', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'Runs daily at 7 AM', config: { cron: '0 7 * * *' } }
      },
      {
        id: 'es-fetch', type: 'customNode', position: { x: 330, y: 150 },
        data: { label: 'Fetch Latest Emails', category: 'tool', typeId: 'email_receiver', iconName: 'Inbox', description: 'Pulls 5 most recent inbox emails', config: { folder: 'inbox', maxEmails: 5 } }
      },
      {
        id: 'es-ai', type: 'customNode', position: { x: 620, y: 150 },
        data: { label: 'Ollama: Summarize Emails', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local Llama 3 summarizes all emails into one briefing', config: { model: 'llama3.1:8b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are an email assistant. Summarize each email in one line, flag urgent items, and end with a priority action list.', prompt: 'Summarize these emails:\n{{ $json.summaryText }}', temperature: 0.4 } }
      },
      {
        id: 'es-send', type: 'customNode', position: { x: 910, y: 150 },
        data: { label: 'Email Me The Digest', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Sends digest to your inbox', config: { to: 'you@example.com', subject: '☀️ Morning Email Digest', body: '{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'ee1', source: 'es-trig', target: 'es-fetch', animated: true },
      { id: 'ee2', source: 'es-fetch', target: 'es-ai', animated: true },
      { id: 'ee3', source: 'es-ai', target: 'es-send', animated: true }
    ]
  },

  {
    id: 'tpl-email-auto-responder',
    title: '🤖 Smart Email Auto-Responder (Priority Triage)',
    description: 'Triage unread emails with a local model: urgent ones get an auto-reply drafted and sent, rest are logged. Uses IF branching for priority routing.',
    category: 'Email Automation',
    author: 'Nexus Flow Team',
    tags: ['Email', 'Auto-Reply', 'Ollama', 'Triage', 'Branching'],
    nodes: [
      {
        id: 'ar-trig', type: 'customNode', position: { x: 50, y: 180 },
        data: { label: 'Manual / Webhook Trigger', category: 'trigger', typeId: 'webhook_trigger', iconName: 'Zap', description: 'Fires on new email notification', config: { endpoint: '/api/webhooks/new-email' } }
      },
      {
        id: 'ar-fetch', type: 'customNode', position: { x: 320, y: 180 },
        data: { label: 'Fetch Unread Emails', category: 'tool', typeId: 'email_receiver', iconName: 'Inbox', description: 'Only unread inbox items', config: { folder: 'unread', maxEmails: 3, unreadOnly: true } }
      },
      {
        id: 'ar-ai', type: 'customNode', position: { x: 590, y: 180 },
        data: { label: 'Ollama: Classify Urgency', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local DeepSeek-R1 classifies each email URGENT or NORMAL', config: { model: 'deepseek-r1:7b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'Classify the email below. Reply with exactly URGENT or NORMAL followed by a one-sentence reason.', prompt: 'Emails to classify:\n{{ $json.summaryText }}', temperature: 0.2 } }
      },
      {
        id: 'ar-if', type: 'customNode', position: { x: 860, y: 180 },
        data: { label: 'IF: Contains URGENT?', category: 'logic', typeId: 'if_condition', iconName: 'Sliders', description: 'Route urgent emails to auto-reply', config: { expression: "String(input.response).toUpperCase().includes('URGENT')" } }
      },
      {
        id: 'ar-reply', type: 'customNode', position: { x: 1130, y: 90 },
        data: { label: 'TRUE: Send Acknowledgement', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Auto-reply to urgent sender', config: { to: 'sender@company.com', subject: 'Re: {{ $json.subject }} — Received, acting on it', body: 'Thanks for your email. This has been flagged URGENT by our AI triage ({{ $json.response }}) and the team is on it.' } }
      },
      {
        id: 'ar-log', type: 'customNode', position: { x: 1130, y: 270 },
        data: { label: 'FALSE: Log to Notion', category: 'action', typeId: 'notion_database', iconName: 'FileText', description: 'Store non-urgent email for later', config: { databaseId: 'email-triage-db', pageTitle: 'Normal Priority Email' } }
      }
    ],
    edges: [
      { id: 'ae1', source: 'ar-trig', target: 'ar-fetch', animated: true },
      { id: 'ae2', source: 'ar-fetch', target: 'ar-ai', animated: true },
      { id: 'ae3', source: 'ar-ai', target: 'ar-if', animated: true },
      { id: 'ae4t', source: 'ar-if', sourceHandle: 'true', target: 'ar-reply', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'ae4f', source: 'ar-if', sourceHandle: 'false', target: 'ar-log', animated: true, style: { stroke: '#f43f5e', strokeWidth: 2 } }
    ]
  },

  {
    id: 'tpl-news-digest',
    title: '📰 Latest News Digest → Email (Local AI)',
    description: 'Fetches live RSS news feeds (TechCrunch, BBC), summarizes top stories with local Qwen model, and emails you a clean morning briefing.',
    category: 'News & Content',
    author: 'Nexus Flow Team',
    tags: ['News', 'RSS', 'Ollama', 'Qwen', 'Daily Digest'],
    nodes: [
      {
        id: 'nd-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Daily 6AM Trigger', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'Fires every morning at 6', config: { cron: '0 6 * * *' } }
      },
      {
        id: 'nd-rss', type: 'customNode', position: { x: 320, y: 150 },
        data: { label: 'Fetch RSS News Feeds', category: 'tool', typeId: 'news_fetcher', iconName: 'Newspaper', description: 'Live articles from TechCrunch + BBC', config: { feeds: 'https://techcrunch.com/feed/,https://feeds.bbci.co.uk/news/technology/rss.xml', maxItems: 5 } }
      },
      {
        id: 'nd-ai', type: 'customNode', position: { x: 600, y: 150 },
        data: { label: 'Ollama: Summarize News', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local Qwen distills top stories into 5 bullets', config: { model: 'qwen2.5:0.5b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a news editor. Condense the articles into exactly 5 crisp bullet points ranked by importance.', prompt: 'Articles:\n{{ $json.articlesText }}', temperature: 0.5 } }
      },
      {
        id: 'nd-send', type: 'customNode', position: { x: 880, y: 150 },
        data: { label: 'Email The Briefing', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Delivers news digest to inbox', config: { to: 'you@example.com', subject: '📰 Your AI Tech Briefing', body: '{{ $json.response }}\n\nFetched {{ $json.articleCount }} articles.' } }
      }
    ],
    edges: [
      { id: 'ne1', source: 'nd-trig', target: 'nd-rss', animated: true },
      { id: 'ne2', source: 'nd-rss', target: 'nd-ai', animated: true },
      { id: 'ne3', source: 'nd-ai', target: 'nd-send', animated: true }
    ]
  },

  {
    id: 'tpl-maps-place-finder',
    title: '🗺️ Maps Place Finder → Local AI Report',
    description: 'Real OpenStreetMap search: finds any place/landmark/city, then a local Llama model generates a travel or research report. No Google API key needed.',
    category: 'Maps & Location',
    author: 'Nexus Flow Team',
    tags: ['Maps', 'OpenStreetMap', 'Ollama', 'Scraper', 'Travel'],
    nodes: [
      {
        id: 'mp-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Webhook: Place Query', category: 'trigger', typeId: 'webhook_trigger', iconName: 'Zap', description: 'POST { "body": { "location": "Goa beaches" } }', config: { endpoint: '/api/webhooks/place-search' } }
      },
      {
        id: 'mp-maps', type: 'customNode', position: { x: 330, y: 150 },
        data: { label: 'OpenStreetMap Search', category: 'tool', typeId: 'maps_scraper', iconName: 'MapPin', description: 'Real geocoding + place details (free, no API key)', config: { query: '{{ $json.body.location }}', limit: 5 } }
      },
      {
        id: 'mp-ai', type: 'customNode', position: { x: 620, y: 150 },
        data: { label: 'Ollama: Location Report', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local model writes insights about found places', config: { model: 'llama3.1:8b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a geography and travel analyst. Given real place data, produce a concise useful report with practical highlights.', prompt: 'Places found:\n{{ $json.mapsText }}\n\nWrite a short report.', temperature: 0.6 } }
      },
      {
        id: 'mp-send', type: 'customNode', position: { x: 900, y: 150 },
        data: { label: 'Email Place Report', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Sends the report wherever you want', config: { to: 'you@example.com', subject: '🗺️ Place Report: {{ $json.query }}', body: '{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'me1', source: 'mp-trig', target: 'mp-maps', animated: true },
      { id: 'me2', source: 'mp-maps', target: 'mp-ai', animated: true },
      { id: 'me3', source: 'mp-ai', target: 'mp-send', animated: true }
    ]
  },

  {
    id: 'tpl-maps-competitor-watch',
    title: '📍 Competitor Location Watch (Maps Scraper)',
    description: 'Periodically scrapes OpenStreetMap for competitor locations in a target city, uses local AI to summarize expansion signals, and alerts via webhook.',
    category: 'Maps & Location',
    author: 'Nexus Flow Team',
    tags: ['Maps', 'OSM', 'Competitor Intel', 'Ollama', 'Business'],
    nodes: [
      {
        id: 'cw-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Weekly Monday Trigger', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'Runs Mondays 9 AM', config: { cron: '0 9 * * 1' } }
      },
      {
        id: 'cw-maps', type: 'customNode', position: { x: 320, y: 150 },
        data: { label: 'Scrape City Places', category: 'tool', typeId: 'maps_scraper', iconName: 'MapPin', description: 'Searches OSM for target query', config: { query: 'coffee shops in Bangalore', limit: 8 } }
      },
      {
        id: 'cw-ai', type: 'customNode', position: { x: 600, y: 150 },
        data: { label: 'Ollama: Market Signals', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local Mistral spots density & expansion signals', config: { model: 'mistral:7b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a market analyst. Given place data, summarize market density, notable clusters, and 3 actionable business signals.', prompt: 'Place data:\n{{ $json.mapsText }}', temperature: 0.5 } }
      },
      {
        id: 'cw-alert', type: 'customNode', position: { x: 880, y: 150 },
        data: { label: 'Dispatch to Slack', category: 'action', typeId: 'slack_message', iconName: 'MessageSquare', description: 'Alerts #market-intel channel', config: { message: '📍 *Weekly Market Watch*\n{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'ce1', source: 'cw-trig', target: 'cw-maps', animated: true },
      { id: 'ce2', source: 'cw-maps', target: 'cw-ai', animated: true },
      { id: 'ce3', source: 'cw-ai', target: 'cw-alert', animated: true }
    ]
  },

  {
    id: 'tpl-invoice-triage',
    title: '💰 Invoice & Receipt Auto-Triage',
    description: 'Scans inbox for invoices, extracts amounts/due dates with a local model, routes payment reminders to email and logs the rest to Notion.',
    category: 'Finance Automation',
    author: 'Nexus Flow Team',
    tags: ['Finance', 'Invoices', 'Email', 'Ollama', 'DeepSeek'],
    nodes: [
      {
        id: 'iv-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Daily Finance Scan', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'Runs every day at 9 AM', config: { cron: '0 9 * * *' } }
      },
      {
        id: 'iv-fetch', type: 'customNode', position: { x: 320, y: 150 },
        data: { label: 'Fetch Inbox', category: 'tool', typeId: 'email_receiver', iconName: 'Inbox', description: 'Latest 5 emails scanned for invoices', config: { folder: 'inbox', maxEmails: 5 } }
      },
      {
        id: 'iv-ai', type: 'customNode', position: { x: 600, y: 150 },
        data: { label: 'Ollama: Extract Invoice Data', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'DeepSeek-R1 extracts vendor, amount, due date', config: { model: 'deepseek-r1:7b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'From each email, extract vendor, amount, due date, and whether it is an invoice. Output a compact list.', prompt: 'Emails:\n{{ $json.summaryText }}\n\nBodies: {{ $json.emails }}', temperature: 0.2 } }
      },
      {
        id: 'iv-send', type: 'customNode', position: { x: 880, y: 150 },
        data: { label: 'Email Finance Team', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Sends structured invoice summary', config: { to: 'finance@company.com', subject: '💰 Daily Invoice Digest', body: '{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'ie1', source: 'iv-trig', target: 'iv-fetch', animated: true },
      { id: 'ie2', source: 'iv-fetch', target: 'iv-ai', animated: true },
      { id: 'ie3', source: 'iv-ai', target: 'iv-send', animated: true }
    ]
  },

  {
    id: 'tpl-web-research-report',
    title: '🔍 AI Research Agent → Formatted Report',
    description: 'Takes any research topic, grounds facts with live web search, then a local Llama model writes a full structured report and emails it.',
    category: 'News & Content',
    author: 'Nexus Flow Team',
    tags: ['Research', 'Search Grounding', 'Ollama', 'Report'],
    nodes: [
      {
        id: 'rr-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Webhook: Research Topic', category: 'trigger', typeId: 'webhook_trigger', iconName: 'Zap', description: 'POST { "body": { "topic": "EV market 2026" } }', config: { endpoint: '/api/webhooks/research-report' } }
      },
      {
        id: 'rr-ground', type: 'customNode', position: { x: 320, y: 150 },
        data: { label: 'Search Grounding Agent', category: 'agent', typeId: 'search_grounding', iconName: 'Search', description: 'Collects live web facts & citations', config: { useSearchGrounding: true, userPrompt: 'Research: {{ $json.body.topic }}. Collect key facts, numbers, and source URLs.' } }
      },
      {
        id: 'rr-ai', type: 'customNode', position: { x: 600, y: 150 },
        data: { label: 'Ollama: Write Report', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local model turns facts into a full report', config: { model: 'llama3.1:8b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a senior research analyst. Write a structured report: Executive Summary, Key Findings (bulleted), Risks, and Conclusion. Ground every claim in the provided facts.', prompt: 'Research facts:\n{{ $json.response }}', temperature: 0.6 } }
      },
      {
        id: 'rr-send', type: 'customNode', position: { x: 880, y: 150 },
        data: { label: 'Email The Report', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Delivers final report', config: { to: 'you@example.com', subject: '🔍 Research Report Ready', body: '{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 're1', source: 'rr-trig', target: 'rr-ground', animated: true },
      { id: 're2', source: 'rr-ground', target: 'rr-ai', animated: true },
      { id: 're3', source: 'rr-ai', target: 'rr-send', animated: true }
    ]
  },

  {
    id: 'tpl-news-sentiment-tracker',
    title: '📊 News Sentiment Tracker (Local AI)',
    description: 'Pulls live news, runs local sentiment analysis with DeepSeek-R1, and pushes a scored market-mood alert to Discord.',
    category: 'News & Content',
    author: 'Nexus Flow Team',
    tags: ['Sentiment', 'News', 'RSS', 'Discord', 'Ollama'],
    nodes: [
      {
        id: 'st-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Every 6 Hours Trigger', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'Runs 4x daily', config: { cron: '0 */6 * * *' } }
      },
      {
        id: 'st-rss', type: 'customNode', position: { x: 310, y: 150 },
        data: { label: 'Fetch Business News', category: 'tool', typeId: 'news_fetcher', iconName: 'Newspaper', description: 'BBC Business + TechCrunch feeds', config: { feeds: 'https://feeds.bbci.co.uk/news/business/rss.xml,https://techcrunch.com/feed/', maxItems: 6 } }
      },
      {
        id: 'st-ai', type: 'customNode', position: { x: 580, y: 150 },
        data: { label: 'Ollama: Sentiment Score', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local model scores sentiment -100 to +100', config: { model: 'deepseek-r1:7b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a sentiment engine. Score the overall news mood from -100 (very negative) to +100 (very positive). Output the score then a 2-sentence explanation.', prompt: 'Headlines:\n{{ $json.articlesText }}', temperature: 0.3 } }
      },
      {
        id: 'st-alert', type: 'customNode', position: { x: 860, y: 150 },
        data: { label: 'Post to Discord', category: 'action', typeId: 'discord_webhook', iconName: 'Send', description: 'Alerts trading/community channel', config: { content: '📊 *Market Mood Update*\n{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'se1', source: 'st-trig', target: 'st-rss', animated: true },
      { id: 'se2', source: 'st-rss', target: 'st-ai', animated: true },
      { id: 'se3', source: 'st-ai', target: 'st-alert', animated: true }
    ]
  },

  {
    id: 'tpl-customer-support-drafts',
    title: '🎧 Customer Support Reply Drafter',
    description: 'Reads support emails, drafts personalized replies with a local Qwen model using the knowledge base (RAG), for human review before sending.',
    category: 'Email Automation',
    author: 'Nexus Flow Team',
    tags: ['Support', 'RAG', 'Ollama', 'Qwen', 'Drafts'],
    nodes: [
      {
        id: 'cs-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Support Inbox Trigger', category: 'trigger', typeId: 'webhook_trigger', iconName: 'Zap', description: 'Fires when new support mail arrives', config: { endpoint: '/api/webhooks/support-inbox' } }
      },
      {
        id: 'cs-fetch', type: 'customNode', position: { x: 310, y: 150 },
        data: { label: 'Fetch Support Emails', category: 'tool', typeId: 'email_receiver', iconName: 'Inbox', description: 'Unread customer messages', config: { folder: 'unread', maxEmails: 3, unreadOnly: true } }
      },
      {
        id: 'cs-rag', type: 'customNode', position: { x: 570, y: 150 },
        data: { label: 'RAG: Knowledge Lookup', category: 'tool', typeId: 'vector_db_query', iconName: 'Database', description: 'Finds relevant KB articles', config: { collection: 'enterprise_knowledge_base', topK: 3 } }
      },
      {
        id: 'cs-ai', type: 'customNode', position: { x: 840, y: 150 },
        data: { label: 'Ollama: Draft Reply', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local Qwen writes the reply draft', config: { model: 'qwen2.5:0.5b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a friendly support agent. Draft a helpful reply using the knowledge base context. Keep it under 150 words.', prompt: 'Customer emails:\n{{ $json.summaryText }}\n\nKnowledge base:\n{{ $json.contextText }}', temperature: 0.5 } }
      },
      {
        id: 'cs-send', type: 'customNode', position: { x: 1110, y: 150 },
        data: { label: 'Email Draft to Agent', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Human reviews & sends', config: { to: 'support-team@company.com', subject: '✍️ AI Draft Replies Ready (Review Before Send)', body: '{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'cse1', source: 'cs-trig', target: 'cs-fetch', animated: true },
      { id: 'cse2', source: 'cs-fetch', target: 'cs-rag', animated: true },
      { id: 'cse3', source: 'cs-rag', target: 'cs-ai', animated: true },
      { id: 'cse4', source: 'cs-ai', target: 'cs-send', animated: true }
    ]
  },

  {
    id: 'tpl-social-content-engine',
    title: '✍️ Social Media Content Engine (Local AI)',
    description: 'Turns today\'s top tech news into ready-to-post tweets and LinkedIn posts via local Mistral, then logs them to Notion for approval.',
    category: 'News & Content',
    author: 'Nexus Flow Team',
    tags: ['Content', 'Social Media', 'Ollama', 'Mistral', 'Notion'],
    nodes: [
      {
        id: 'sc-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Weekday 10AM Trigger', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'Mon-Fri at 10 AM', config: { cron: '0 10 * * 1-5' } }
      },
      {
        id: 'sc-rss', type: 'customNode', position: { x: 320, y: 150 },
        data: { label: 'Fetch Tech News', category: 'tool', typeId: 'news_fetcher', iconName: 'Newspaper', description: 'Latest TechCrunch headlines', config: { feeds: 'https://techcrunch.com/feed/', maxItems: 5 } }
      },
      {
        id: 'sc-ai', type: 'customNode', position: { x: 600, y: 150 },
        data: { label: 'Ollama: Write Posts', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local Mistral drafts 3 tweets + 1 LinkedIn post', config: { model: 'mistral:7b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a social media copywriter. From the news, write 3 tweets (under 280 chars each) and 1 LinkedIn post. Include relevant hashtags.', prompt: 'News:\n{{ $json.articlesText }}', temperature: 0.8 } }
      },
      {
        id: 'sc-notion', type: 'customNode', position: { x: 880, y: 150 },
        data: { label: 'Save to Content Calendar', category: 'action', typeId: 'notion_database', iconName: 'FileText', description: 'Logs posts for team approval', config: { databaseId: 'social-content-db', pageTitle: 'AI Generated Social Posts' } }
      }
    ],
    edges: [
      { id: 'sce1', source: 'sc-trig', target: 'sc-rss', animated: true },
      { id: 'sce2', source: 'sc-rss', target: 'sc-ai', animated: true },
      { id: 'sce3', source: 'sc-ai', target: 'sc-notion', animated: true }
    ]
  },

  {
    id: 'tpl-meeting-notes-email',
    title: '📅 Meeting Notes AI → Email Follow-ups',
    description: 'After calendar events end, a local model generates meeting summaries and action items, then emails every attendee automatically.',
    category: 'Workspace Automation',
    author: 'Nexus Flow Team',
    tags: ['Meetings', 'Calendar', 'Ollama', 'Follow-up', 'Llama'],
    nodes: [
      {
        id: 'mn-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Evening Wrap-Up Trigger', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'Runs 6 PM on weekdays', config: { cron: '0 18 * * 1-5' } }
      },
      {
        id: 'mn-gcal', type: 'customNode', position: { x: 320, y: 150 },
        data: { label: 'Fetch Today\'s Meetings', category: 'tool', typeId: 'gcal_list_events', iconName: 'Calendar', description: 'Today\'s completed events', config: { calendarId: 'primary', maxResults: 10 } }
      },
      {
        id: 'mn-ai', type: 'customNode', position: { x: 600, y: 150 },
        data: { label: 'Ollama: Meeting Notes', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local Llama writes notes + action items per meeting', config: { model: 'llama3.1:8b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are a chief of staff. For each meeting, produce a 2-line summary and 2 action items with owners.', prompt: 'Today\'s meetings:\n{{ $json.summaryText }}', temperature: 0.5 } }
      },
      {
        id: 'mn-send', type: 'customNode', position: { x: 880, y: 150 },
        data: { label: 'Email Follow-ups', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Sends notes to all attendees', config: { to: 'meeting-attendees@company.com', subject: '📅 Meeting Notes & Action Items', body: '{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'mne1', source: 'mn-trig', target: 'mn-gcal', animated: true },
      { id: 'mne2', source: 'mn-gcal', target: 'mn-ai', animated: true },
      { id: 'mne3', source: 'mn-ai', target: 'mn-send', animated: true }
    ]
  },

  {
    id: 'tpl-real-http-monitor',
    title: '🌐 Website & API Health Monitor (Real HTTP)',
    description: 'Pings any website/API with real HTTP requests on a schedule, uses a local model to analyze failures, and alerts via email when something is down.',
    category: 'DevOps & Monitoring',
    author: 'Nexus Flow Team',
    tags: ['Monitoring', 'HTTP', 'Uptime', 'Ollama', 'DevOps'],
    nodes: [
      {
        id: 'hm-trig', type: 'customNode', position: { x: 50, y: 150 },
        data: { label: 'Every 5 Minutes Trigger', category: 'trigger', typeId: 'cron_trigger', iconName: 'Clock', description: 'High-frequency health checks', config: { cron: '*/5 * * * *' } }
      },
      {
        id: 'hm-http', type: 'customNode', position: { x: 320, y: 150 },
        data: { label: 'Real HTTP Ping', category: 'action', typeId: 'http_webhook', iconName: 'Send', description: 'Genuine GET request to your target', config: { url: 'https://httpbin.org/status/200', method: 'GET' } }
      },
      {
        id: 'hm-if', type: 'customNode', position: { x: 600, y: 150 },
        data: { label: 'IF: Check Failed?', category: 'logic', typeId: 'if_condition', iconName: 'Sliders', description: 'Fires alert branch on failure', config: { expression: "input.dispatchStatus !== 'delivered' || input.httpCode >= 400" } }
      },
      {
        id: 'hm-ai', type: 'customNode', position: { x: 870, y: 90 },
        data: { label: 'Ollama: Diagnose Failure', category: 'agent', typeId: 'ollama_local_model', iconName: 'Server', description: 'Local model suggests likely cause & fix', config: { model: 'qwen2.5:0.5b', ollamaUrl: 'http://localhost:11434', systemPrompt: 'You are an SRE. Given the failure data, state the likely cause and 2 quick checks.', prompt: 'Failure data:\n{{ $json }}', temperature: 0.3 } }
      },
      {
        id: 'hm-alert', type: 'customNode', position: { x: 1140, y: 90 },
        data: { label: 'Email On-Call Engineer', category: 'action', typeId: 'email_sender', iconName: 'Mail', description: 'Instant downtime alert', config: { to: 'oncall@company.com', subject: '🚨 Downtime Detected', body: '{{ $json.response }}' } }
      }
    ],
    edges: [
      { id: 'he1', source: 'hm-trig', target: 'hm-http', animated: true },
      { id: 'he2', source: 'hm-http', target: 'hm-if', animated: true },
      { id: 'he3t', source: 'hm-if', sourceHandle: 'true', target: 'hm-ai', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'he4', source: 'hm-ai', target: 'hm-alert', animated: true }
    ]
  }
];


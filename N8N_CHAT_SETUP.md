# n8n Chat Integration Setup

This guide will help you set up the n8n chat widget in your task management app.

## Prerequisites

1. **n8n Instance**: You need a running n8n instance
2. **Webhook Workflow**: A chat workflow with a webhook trigger in n8n
3. **Webhook URL**: The webhook endpoint URL from your n8n workflow

## Environment Configuration

Create a `.env.local` file in your project root with the following variable:

```bash
# n8n Chat Configuration
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_webhook_url_here
```

### Configuration Details

- **`NEXT_PUBLIC_N8N_WEBHOOK_URL`**: The webhook URL from your n8n workflow
  - This is the URL that n8n provides when you create a webhook trigger
  - Format: `https://your-n8n-domain.com/webhook/your-webhook-id`
  - Local development: `http://localhost:5678/webhook/your-webhook-id`

## n8n Workflow Setup

1. **Create a Chat Workflow** in n8n
2. **Add Webhook Trigger Node** to handle incoming messages
3. **Configure AI Integration** (OpenAI, Anthropic, etc.)
4. **Add Response Logic** for task-related queries
5. **Test the Workflow** to ensure it responds correctly
6. **Copy the Webhook URL** from the webhook trigger node

### Getting Your Webhook URL

1. In your n8n workflow, click on the **Webhook Trigger** node
2. Look for the **Webhook URL** field
3. Copy the complete URL (it will look like: `https://your-domain.com/webhook/abc123`)
4. Use this URL in your `.env.local` file

## How It Works

The chatbot widget uses the official n8n chat package which:

- **Loads CSS**: Automatically loads the required styles from CDN
- **Executes Script**: Runs the chat initialization script
- **Connects to Webhook**: Sends messages to your n8n workflow
- **Renders UI**: Displays the chat interface in your container

## Features

The chatbot widget includes:

- ✅ **User Authentication**: Only visible to logged-in users
- ✅ **Floating Widget**: Fixed position in bottom-right corner
- ✅ **Minimize/Maximize**: Collapsible interface
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Automatic Loading**: Loads n8n chat when opened
- ✅ **Webhook Integration**: Direct connection to your n8n workflow

## Usage

1. **Login** to your task management app
2. **Click** the chat icon in the bottom-right corner
3. **Start chatting** with your AI assistant
4. **Minimize** the chat to keep it accessible
5. **Close** the chat when done

## Customization

You can customize the chat widget by modifying:

- **Styling**: Update CSS classes in `ChatbotWidget.tsx`
- **Position**: Change the fixed positioning
- **Size**: Adjust width and height
- **Theme**: Match your app's color scheme

## Troubleshooting

### Chat Won't Load

- Check your webhook URL in `.env.local`
- Verify n8n instance is running
- Check browser console for errors
- Ensure webhook workflow is active

### Webhook Issues

- Verify webhook URL is correct
- Check n8n workflow execution logs
- Ensure webhook trigger is enabled
- Test webhook with a tool like Postman

### Performance Issues

- Check n8n instance resources
- Verify network connectivity
- Monitor webhook response times

## Support

For n8n-specific issues, refer to:

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Chat Package](https://www.npmjs.com/package/@n8n/chat)
- [n8n Community](https://community.n8n.io/)
- [Webhook Documentation](https://docs.n8n.io/integrations/builtin/trigger-nodes/n8n-nodes-base.webhook/)

import OpenAI from 'openai';
import type { CustomerFullData } from './services';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function formatAccountContext(data: CustomerFullData, email: string): string {
  const parts: string[] = [];
  
  parts.push(`Customer Email: ${email}`);
  
  if (data.chargebee.customers.length > 0) {
    parts.push(`\n## Chargebee Account Summary`);
    parts.push(`Total Subscriptions: ${data.chargebee.totalSubscriptions}`);
    parts.push(`Total Invoices: ${data.chargebee.totalInvoices}`);
    parts.push(`Total Amount Due: $${(data.chargebee.totalDue / 100).toFixed(2)}`);
    
    data.chargebee.customers.forEach((customer, idx) => {
      parts.push(`\n### Customer Account ${idx + 1}: ${customer.firstName} ${customer.lastName}`);
      parts.push(`Customer ID: ${customer.id}`);
      if (customer.createdAt) {
        const createdTs = typeof customer.createdAt === 'string' ? parseInt(customer.createdAt) : customer.createdAt;
        parts.push(`Created: ${new Date(createdTs * 1000).toLocaleDateString()}`);
      }
      
      if (customer.subscriptions.length > 0) {
        parts.push(`\nSubscriptions:`);
        customer.subscriptions.forEach(sub => {
          parts.push(`- Plan: ${sub.planId}`);
          parts.push(`  Status: ${sub.status}`);
          parts.push(`  Amount: $${(sub.planAmount / 100).toFixed(2)}/${sub.billingPeriodUnit}`);
          if (sub.nextBillingAt) {
            const nextTs = typeof sub.nextBillingAt === 'string' ? parseInt(sub.nextBillingAt) : sub.nextBillingAt;
            parts.push(`  Next Billing: ${new Date(nextTs * 1000).toLocaleDateString()}`);
          }
          if (sub.currentTermEnd) {
            const endTs = typeof sub.currentTermEnd === 'string' ? parseInt(sub.currentTermEnd) : sub.currentTermEnd;
            parts.push(`  Current Period Ends: ${new Date(endTs * 1000).toLocaleDateString()}`);
          }
          if (sub.iccid) parts.push(`  ICCID: ${sub.iccid}`);
          if (sub.imei) parts.push(`  IMEI: ${sub.imei}`);
          if (sub.mdn) parts.push(`  MDN: ${sub.mdn}`);
        });
      }
      
      if (customer.invoices.length > 0) {
        parts.push(`\nRecent Invoices (last 5):`);
        customer.invoices.slice(0, 5).forEach(inv => {
          const invTs = typeof inv.date === 'string' ? parseInt(inv.date) : inv.date;
          parts.push(`- Invoice ${inv.id}: $${(inv.total / 100).toFixed(2)} (${inv.status}) - ${new Date(invTs * 1000).toLocaleDateString()}`);
          if (inv.amountDue > 0) parts.push(`  Amount Due: $${(inv.amountDue / 100).toFixed(2)}`);
        });
      }
    });
  }
  
  if (data.orders.length > 0) {
    parts.push(`\n## Orders (${data.orders.length} total)`);
    data.orders.slice(0, 5).forEach(order => {
      parts.push(`- Order #${order.orderNumber}`);
      parts.push(`  Total: $${(order.total / 100).toFixed(2)}`);
      parts.push(`  Status: ${order.fulfillmentStatus || order.status || 'Processing'}`);
      if (order.orderDate) {
        parts.push(`  Date: ${new Date(order.orderDate).toLocaleDateString()}`);
      }
      if (order.tracking && order.tracking.length > 0) {
        const track = order.tracking[0];
        parts.push(`  Tracking: ${track.trackingNumber} (${track.carrier || 'N/A'})`);
      }
      if (order.imei) parts.push(`  IMEI: ${order.imei}`);
      if (order.iccid) parts.push(`  ICCID: ${order.iccid}`);
    });
  }
  
  if (data.devices.length > 0) {
    parts.push(`\n## Devices (${data.devices.length} total)`);
    data.devices.forEach(device => {
      const id = device.identifiers.mdn || device.identifiers.iccid || 'Unknown';
      parts.push(`- Device: ${id}`);
      parts.push(`  Status: ${device.state}`);
      parts.push(`  Connected: ${device.connected ? 'Yes' : 'No'}`);
      if (device.carrier) {
        parts.push(`  Carrier: ${device.carrier.name} (${device.carrier.state})`);
      }
    });
  }
  
  return parts.join('\n');
}

const SYSTEM_PROMPT = `You are a helpful customer support assistant for Nomad Internet, a company that provides wireless internet services to customers across the United States.

Your role is to help customers understand their account information, answer questions about their subscriptions, orders, invoices, and devices.

Guidelines:
1. Be friendly, professional, and concise
2. When discussing money, always format as dollars (e.g., $99.99)
3. When discussing dates, use a friendly format (e.g., "January 15, 2026")
4. If a customer asks about something not in their account data, politely explain you can only help with their account information
5. For billing issues, cancellations, or complex technical problems, suggest they contact Nomad Internet support directly
6. Never make up information - only use the data provided
7. If asked about data not available, say you don't have that specific information

The customer's account information will be provided in the context. Use this to answer their questions accurately.`;

export async function handleChatMessage(
  customerData: CustomerFullData,
  customerEmail: string,
  userMessage: string,
  conversationHistory: ChatMessage[]
): Promise<{ response: string; updatedHistory: ChatMessage[] }> {
  const accountContext = formatAccountContext(customerData, customerEmail);
  
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\n--- CUSTOMER ACCOUNT DATA ---\n${accountContext}` },
    ...conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.7
    });
    
    const assistantMessage = response.choices[0].message.content || 'I apologize, but I was unable to generate a response. Please try again.';
    
    const updatedHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage }
    ];
    
    return { response: assistantMessage, updatedHistory };
  } catch (error: any) {
    console.error('OpenAI API error:', error.message);
    throw new Error('Failed to get response from AI assistant');
  }
}

export type { ChatMessage };

const EMAILS = [
  "kaylathomas737@gmail.com",
  "celtievans90@gmail.com",
  "yatestania44@gmail.com"
];

const CHARGEBEE_API_KEY = process.env.CHARGEBEE_API_KEY;
const CHARGEBEE_SITE = process.env.CHARGEBEE_SITE;

const BASE_URL = `https://${CHARGEBEE_SITE}.chargebee.com/api/v2`;

async function checkCustomer(email: string): Promise<{ email: string; status: string; details: string }> {
  const credentials = Buffer.from(`${CHARGEBEE_API_KEY}:`).toString('base64');
  
  try {
    const customerUrl = `${BASE_URL}/customers?email[is]=${encodeURIComponent(email)}`;
    const customerResponse = await fetch(customerUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    });

    if (!customerResponse.ok) {
      return { email, status: "ERROR", details: `API Error: ${customerResponse.status}` };
    }

    const customerData = await customerResponse.json() as any;
    const customers = customerData.list || [];
    
    if (customers.length === 0) {
      return { email, status: "NOT FOUND", details: "No customer found with this email" };
    }

    const customer = customers[0].customer;
    
    const subUrl = `${BASE_URL}/subscriptions?customer_id[is]=${encodeURIComponent(customer.id)}`;
    const subResponse = await fetch(subUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    });

    if (!subResponse.ok) {
      return { email, status: "ERROR", details: `Subscription API Error: ${subResponse.status}` };
    }

    const subData = await subResponse.json() as any;
    const subscriptions = subData.list || [];
    
    if (subscriptions.length === 0) {
      return { email, status: "NO SUBSCRIPTION", details: `Customer: ${customer.first_name || ''} ${customer.last_name || ''} - No active subscription` };
    }

    const results: string[] = [];
    let overallStatus = "PAID";
    
    for (const item of subscriptions) {
      const sub = item.subscription;
      const planId = sub.subscription_items?.[0]?.item_price_id || sub.plan_id || 'Unknown Plan';
      const amount = sub.subscription_items?.[0]?.amount || sub.plan_amount || 0;
      
      let subStatus = sub.status;
      if (subStatus === 'active') {
        subStatus = 'PAID (Active)';
      } else if (subStatus === 'paused') {
        subStatus = 'PAUSED';
        overallStatus = 'PAUSED';
      } else if (subStatus === 'cancelled') {
        subStatus = 'CANCELLED';
        if (overallStatus === 'PAID') overallStatus = 'CANCELLED';
      } else if (subStatus === 'non_renewing') {
        subStatus = 'NON-RENEWING';
      } else if (subStatus === 'in_trial') {
        subStatus = 'IN TRIAL';
      } else if (sub.due_invoices_count > 0) {
        subStatus = 'UNPAID';
        overallStatus = 'UNPAID';
      }
      
      results.push(`${planId} - $${(amount / 100).toFixed(2)} - ${subStatus}`);
    }
    
    return { 
      email, 
      status: overallStatus, 
      details: `${customer.first_name || ''} ${customer.last_name || ''}\n    ${results.join('\n    ')}` 
    };
    
  } catch (error) {
    return { email, status: "ERROR", details: `${error}` };
  }
}

async function main() {
  console.log("=========================================");
  console.log("Chargebee Batch Status Check");
  console.log("=========================================\n");
  
  if (!CHARGEBEE_API_KEY || !CHARGEBEE_SITE) {
    console.log("Error: Missing CHARGEBEE_API_KEY or CHARGEBEE_SITE");
    return;
  }
  
  const results = await Promise.all(EMAILS.map(checkCustomer));
  
  console.log("RESULTS:\n");
  console.log("=".repeat(60));
  
  for (const result of results) {
    const statusEmoji = 
      result.status === 'PAID (Active)' || result.status === 'PAID' ? '✅' :
      result.status === 'UNPAID' ? '❌' :
      result.status === 'PAUSED' ? '⏸️' :
      result.status === 'CANCELLED' ? '🚫' :
      result.status === 'NOT FOUND' ? '❓' : '⚠️';
    
    console.log(`\n${statusEmoji} ${result.email}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   ${result.details}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("\nSUMMARY:");
  const paid = results.filter(r => r.status === 'PAID' || r.status === 'PAID (Active)').length;
  const unpaid = results.filter(r => r.status === 'UNPAID').length;
  const paused = results.filter(r => r.status === 'PAUSED').length;
  const cancelled = results.filter(r => r.status === 'CANCELLED').length;
  const notFound = results.filter(r => r.status === 'NOT FOUND').length;
  
  console.log(`  Paid: ${paid}`);
  console.log(`  Unpaid: ${unpaid}`);
  console.log(`  Paused: ${paused}`);
  console.log(`  Cancelled: ${cancelled}`);
  console.log(`  Not Found: ${notFound}`);
}

main();

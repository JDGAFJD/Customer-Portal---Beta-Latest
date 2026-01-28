const CUSTOMER_EMAIL = "BackStrap243@gmail.com";

const CHARGEBEE_API_KEY = process.env.CHARGEBEE_API_KEY;
const CHARGEBEE_SITE = process.env.CHARGEBEE_SITE;

const BASE_URL = `https://${CHARGEBEE_SITE}.chargebee.com/api/v2`;

async function getCustomers(): Promise<any[]> {
  console.log("\n=== Finding Customers ===");
  console.log(`Email: ${CUSTOMER_EMAIL}`);
  
  const credentials = Buffer.from(`${CHARGEBEE_API_KEY}:`).toString('base64');
  
  try {
    const url = `${BASE_URL}/customers?email[is]=${encodeURIComponent(CUSTOMER_EMAIL)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.log(`Error (${response.status}): ${text}`);
      return [];
    }

    const data = JSON.parse(text);
    return data.list || [];
  } catch (error) {
    console.log(`Request failed: ${error}`);
    return [];
  }
}

async function getSubscriptions(customerId: string): Promise<any[]> {
  console.log(`\n=== Getting Subscriptions for Customer: ${customerId} ===`);
  
  const credentials = Buffer.from(`${CHARGEBEE_API_KEY}:`).toString('base64');
  
  try {
    const url = `${BASE_URL}/subscriptions?customer_id[is]=${encodeURIComponent(customerId)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.log(`Error (${response.status}): ${text}`);
      return [];
    }

    const data = JSON.parse(text);
    return data.list || [];
  } catch (error) {
    console.log(`Request failed: ${error}`);
    return [];
  }
}

async function getInvoices(customerId: string): Promise<any[]> {
  console.log(`\n=== Getting Invoices for Customer: ${customerId} ===`);
  
  const credentials = Buffer.from(`${CHARGEBEE_API_KEY}:`).toString('base64');
  
  try {
    const url = `${BASE_URL}/invoices?customer_id[is]=${encodeURIComponent(customerId)}&limit=10&sort_by[desc]=date`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      }
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.log(`Error (${response.status}): ${text}`);
      return [];
    }

    const data = JSON.parse(text);
    return data.list || [];
  } catch (error) {
    console.log(`Request failed: ${error}`);
    return [];
  }
}

function displayCustomer(customer: any) {
  console.log("\n-----------------------------------------");
  console.log("CUSTOMER DETAILS");
  console.log("-----------------------------------------");
  console.log(`ID: ${customer.id}`);
  console.log(`Email: ${customer.email}`);
  console.log(`First Name: ${customer.first_name || 'N/A'}`);
  console.log(`Last Name: ${customer.last_name || 'N/A'}`);
  console.log(`Company: ${customer.company || 'N/A'}`);
  console.log(`Phone: ${customer.phone || 'N/A'}`);
  console.log(`Created: ${new Date(customer.created_at * 1000).toISOString()}`);
  console.log(`Updated: ${new Date(customer.updated_at * 1000).toISOString()}`);
  console.log(`Auto Collection: ${customer.auto_collection}`);
  console.log(`Net Terms: ${customer.net_term_days} days`);
  console.log(`Taxability: ${customer.taxability}`);
  console.log(`Deleted: ${customer.deleted ? 'Yes' : 'No'}`);
  console.log(`Channel: ${customer.channel || 'N/A'}`);
  console.log(`Resource Version: ${customer.resource_version}`);
  
  if (customer.billing_address) {
    const addr = customer.billing_address;
    console.log(`\n--- Billing Address ---`);
    console.log(`  ${addr.first_name || ''} ${addr.last_name || ''}`);
    console.log(`  ${addr.line1 || ''}`);
    if (addr.line2) console.log(`  ${addr.line2}`);
    console.log(`  ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`);
    console.log(`  ${addr.country || ''}`);
    console.log(`  Phone: ${addr.phone || 'N/A'}`);
    console.log(`  Email: ${addr.email || 'N/A'}`);
  }
  
  if (customer.cf_equipment_returns_id) {
    console.log(`\n--- Custom Fields ---`);
    console.log(`  Equipment Returns ID: ${customer.cf_equipment_returns_id}`);
  }
}

function displaySubscription(sub: any) {
  console.log("\n-----------------------------------------");
  console.log(`SUBSCRIPTION: ${sub.id}`);
  console.log("-----------------------------------------");
  console.log(`Plan: ${sub.plan_id}`);
  console.log(`Status: ${sub.status}`);
  console.log(`Plan Amount: $${(sub.plan_amount / 100).toFixed(2)}`);
  console.log(`Plan Quantity: ${sub.plan_quantity}`);
  console.log(`Billing Period: ${sub.billing_period} ${sub.billing_period_unit}`);
  console.log(`Created: ${new Date(sub.created_at * 1000).toISOString()}`);
  console.log(`Started: ${sub.started_at ? new Date(sub.started_at * 1000).toISOString() : 'N/A'}`);
  console.log(`Activated: ${sub.activated_at ? new Date(sub.activated_at * 1000).toISOString() : 'N/A'}`);
  console.log(`Current Term Start: ${sub.current_term_start ? new Date(sub.current_term_start * 1000).toISOString() : 'N/A'}`);
  console.log(`Current Term End: ${sub.current_term_end ? new Date(sub.current_term_end * 1000).toISOString() : 'N/A'}`);
  console.log(`Next Billing: ${sub.next_billing_at ? new Date(sub.next_billing_at * 1000).toISOString() : 'N/A'}`);
  console.log(`Cancelled At: ${sub.cancelled_at ? new Date(sub.cancelled_at * 1000).toISOString() : 'N/A'}`);
  console.log(`Cancel Reason: ${sub.cancel_reason || 'N/A'}`);
  console.log(`Auto Collection: ${sub.auto_collection}`);
  console.log(`Has Scheduled Changes: ${sub.has_scheduled_changes ? 'Yes' : 'No'}`);
  console.log(`Channel: ${sub.channel || 'N/A'}`);
  console.log(`Resource Version: ${sub.resource_version}`);
  console.log(`Deleted: ${sub.deleted ? 'Yes' : 'No'}`);
  console.log(`Due Invoices Count: ${sub.due_invoices_count || 0}`);
  console.log(`MRR: $${((sub.mrr || 0) / 100).toFixed(2)}`);
  
  if (sub.subscription_items?.length > 0) {
    console.log(`\n--- Subscription Items ---`);
    sub.subscription_items.forEach((item: any, index: number) => {
      console.log(`  Item ${index + 1}:`);
      console.log(`    Item Price ID: ${item.item_price_id}`);
      console.log(`    Item Type: ${item.item_type}`);
      console.log(`    Quantity: ${item.quantity || 1}`);
      console.log(`    Amount: $${((item.amount || 0) / 100).toFixed(2)}`);
      console.log(`    Unit Price: $${((item.unit_price || 0) / 100).toFixed(2)}`);
      console.log(`    Free Quantity: ${item.free_quantity || 0}`);
    });
  }
  
  if (sub.addons?.length > 0) {
    console.log(`\n--- Addons ---`);
    sub.addons.forEach((addon: any) => {
      console.log(`  - ${addon.id}: ${addon.quantity || 1} x $${((addon.unit_price || addon.amount || 0) / 100).toFixed(2)}`);
    });
  }
  
  if (sub.coupons?.length > 0) {
    console.log(`\n--- Coupons ---`);
    sub.coupons.forEach((coupon: any) => {
      console.log(`  - ${coupon.coupon_id} (Applied: ${coupon.applied_count} times)`);
    });
  }

  if (sub.cf_iccid) console.log(`\nICCID: ${sub.cf_iccid}`);
  if (sub.cf_imei) console.log(`IMEI: ${sub.cf_imei}`);
  if (sub.cf_mdn) console.log(`MDN: ${sub.cf_mdn}`);
}

function displayInvoice(invoice: any) {
  console.log(`\n  Invoice: ${invoice.id}`);
  console.log(`    Status: ${invoice.status}`);
  console.log(`    Date: ${new Date(invoice.date * 1000).toISOString()}`);
  console.log(`    Total: $${(invoice.total / 100).toFixed(2)}`);
  console.log(`    Amount Paid: $${(invoice.amount_paid / 100).toFixed(2)}`);
  console.log(`    Amount Due: $${(invoice.amount_due / 100).toFixed(2)}`);
  console.log(`    Due Date: ${invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : 'N/A'}`);
}

async function main() {
  console.log("=========================================");
  console.log("Chargebee Customer Lookup");
  console.log("=========================================");
  console.log(`Site: ${CHARGEBEE_SITE}`);
  console.log(`Email: ${CUSTOMER_EMAIL}`);
  
  if (!CHARGEBEE_API_KEY || !CHARGEBEE_SITE) {
    console.log("\nError: Missing CHARGEBEE_API_KEY or CHARGEBEE_SITE");
    return;
  }
  
  const customers = await getCustomers();
  
  if (customers.length === 0) {
    console.log("\nNo customers found with that email.");
    return;
  }
  
  console.log(`\n--- Found ${customers.length} Customer(s) ---`);
  
  for (const item of customers) {
    const customer = item.customer;
    displayCustomer(customer);
    
    const subscriptions = await getSubscriptions(customer.id);
    
    if (subscriptions.length > 0) {
      console.log(`\n=== ${subscriptions.length} Subscription(s) Found ===`);
      for (const subItem of subscriptions) {
        displaySubscription(subItem.subscription);
      }
    } else {
      console.log("\nNo subscriptions found for this customer.");
    }
    
    const invoices = await getInvoices(customer.id);
    
    if (invoices.length > 0) {
      console.log(`\n=== Recent Invoices (Last 10) ===`);
      for (const invItem of invoices) {
        displayInvoice(invItem.invoice);
      }
    }
  }
  
  console.log("\n=========================================");
  console.log("END OF REPORT");
  console.log("=========================================");
}

main();

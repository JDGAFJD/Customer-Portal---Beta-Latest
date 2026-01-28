const EMAIL = "celtievans90@gmail.com";

const CHARGEBEE_API_KEY = process.env.CHARGEBEE_API_KEY;
const CHARGEBEE_SITE = process.env.CHARGEBEE_SITE;

const BASE_URL = `https://${CHARGEBEE_SITE}.chargebee.com/api/v2`;

async function apiGet(endpoint: string): Promise<any> {
  const credentials = Buffer.from(`${CHARGEBEE_API_KEY}:`).toString('base64');
  
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    }
  });
  
  const text = await response.text();
  
  if (!response.ok) {
    console.log(`API Error (${response.status}): ${text}`);
    return null;
  }
  
  return JSON.parse(text);
}

async function main() {
  console.log("=========================================");
  console.log(`Full Chargebee Lookup: ${EMAIL}`);
  console.log("=========================================\n");
  
  if (!CHARGEBEE_API_KEY || !CHARGEBEE_SITE) {
    console.log("Error: Missing CHARGEBEE_API_KEY or CHARGEBEE_SITE");
    return;
  }

  const customerData = await apiGet(`/customers?email[is]=${encodeURIComponent(EMAIL)}`);
  
  if (!customerData?.list?.length) {
    console.log("Customer not found");
    return;
  }
  
  const customer = customerData.list[0].customer;
  console.log("=== CUSTOMER ===");
  console.log(`ID: ${customer.id}`);
  console.log(`Name: ${customer.first_name} ${customer.last_name}`);
  console.log(`Email: ${customer.email}`);
  console.log(`Phone: ${customer.phone}`);
  console.log(`Created: ${new Date(customer.created_at * 1000).toISOString()}`);
  console.log(`Auto Collection: ${customer.auto_collection}`);
  console.log(`Promotional Credits: $${(customer.promotional_credits / 100).toFixed(2)}`);
  console.log(`Refundable Credits: $${(customer.refundable_credits / 100).toFixed(2)}`);
  console.log(`Excess Payments: $${(customer.excess_payments / 100).toFixed(2)}`);
  console.log(`Unbilled Charges: $${(customer.unbilled_charges / 100).toFixed(2)}`);
  
  console.log("\n" + "=".repeat(60));
  console.log("=== INVOICES ===");
  console.log("=".repeat(60));
  
  const invoicesData = await apiGet(`/invoices?customer_id[is]=${customer.id}&limit=20&sort_by[desc]=date`);
  
  if (invoicesData?.list?.length) {
    for (const item of invoicesData.list) {
      const inv = item.invoice;
      console.log(`\nInvoice: ${inv.id}`);
      console.log(`  Status: ${inv.status}`);
      console.log(`  Date: ${new Date(inv.date * 1000).toISOString()}`);
      console.log(`  Due Date: ${inv.due_date ? new Date(inv.due_date * 1000).toISOString() : 'N/A'}`);
      console.log(`  Paid At: ${inv.paid_at ? new Date(inv.paid_at * 1000).toISOString() : 'N/A'}`);
      console.log(`  Subtotal: $${(inv.sub_total / 100).toFixed(2)}`);
      console.log(`  Tax: $${((inv.tax || 0) / 100).toFixed(2)}`);
      console.log(`  Total: $${(inv.total / 100).toFixed(2)}`);
      console.log(`  Amount Paid: $${(inv.amount_paid / 100).toFixed(2)}`);
      console.log(`  Amount Adjusted: $${((inv.amount_adjusted || 0) / 100).toFixed(2)}`);
      console.log(`  Credits Applied: $${((inv.credits_applied || 0) / 100).toFixed(2)}`);
      console.log(`  Amount Due: $${(inv.amount_due / 100).toFixed(2)}`);
      console.log(`  Write Off Amount: $${((inv.write_off_amount || 0) / 100).toFixed(2)}`);
      console.log(`  Dunning Status: ${inv.dunning_status || 'N/A'}`);
      console.log(`  First Invoice: ${inv.first_invoice ? 'Yes' : 'No'}`);
      console.log(`  Recurring: ${inv.recurring ? 'Yes' : 'No'}`);
      console.log(`  Has Advance Charges: ${inv.has_advance_charges ? 'Yes' : 'No'}`);
      console.log(`  Currency: ${inv.currency_code}`);
      console.log(`  Price Type: ${inv.price_type}`);
      
      if (inv.line_items?.length) {
        console.log(`  Line Items:`);
        for (const li of inv.line_items) {
          console.log(`    - ${li.description}`);
          console.log(`      Amount: $${(li.amount / 100).toFixed(2)}`);
          console.log(`      Quantity: ${li.quantity || 1}`);
          console.log(`      Entity Type: ${li.entity_type}`);
          console.log(`      Entity ID: ${li.entity_id || 'N/A'}`);
        }
      }
      
      if (inv.discounts?.length) {
        console.log(`  Discounts:`);
        for (const disc of inv.discounts) {
          console.log(`    - ${disc.description}: $${(disc.amount / 100).toFixed(2)}`);
        }
      }
      
      if (inv.linked_payments?.length) {
        console.log(`  Linked Payments:`);
        for (const pmt of inv.linked_payments) {
          console.log(`    - Transaction: ${pmt.txn_id}`);
          console.log(`      Amount: $${(pmt.txn_amount / 100).toFixed(2)}`);
          console.log(`      Date: ${new Date(pmt.txn_date * 1000).toISOString()}`);
          console.log(`      Status: ${pmt.txn_status}`);
        }
      }
      
      if (inv.dunning_attempts?.length) {
        console.log(`  Dunning Attempts: ${inv.dunning_attempts.length}`);
        for (const attempt of inv.dunning_attempts) {
          console.log(`    - Attempt ${attempt.attempt}: ${new Date(attempt.created_at * 1000).toISOString()}`);
          console.log(`      Transaction: ${attempt.transaction_id || 'N/A'}`);
        }
      }
    }
  } else {
    console.log("No invoices found");
  }

  console.log("\n" + "=".repeat(60));
  console.log("=== TRANSACTIONS ===");
  console.log("=".repeat(60));
  
  const txnData = await apiGet(`/transactions?customer_id[is]=${customer.id}&limit=20&sort_by[desc]=date`);
  
  if (txnData?.list?.length) {
    for (const item of txnData.list) {
      const txn = item.transaction;
      console.log(`\nTransaction: ${txn.id}`);
      console.log(`  Type: ${txn.type}`);
      console.log(`  Status: ${txn.status}`);
      console.log(`  Date: ${new Date(txn.date * 1000).toISOString()}`);
      console.log(`  Amount: $${(txn.amount / 100).toFixed(2)}`);
      console.log(`  Currency: ${txn.currency_code}`);
      console.log(`  Gateway: ${txn.gateway}`);
      console.log(`  Gateway Account ID: ${txn.gateway_account_id || 'N/A'}`);
      console.log(`  Payment Source ID: ${txn.payment_source_id || 'N/A'}`);
      console.log(`  Payment Method: ${txn.payment_method}`);
      console.log(`  Reference Number: ${txn.reference_number || 'N/A'}`);
      console.log(`  ID at Gateway: ${txn.id_at_gateway || 'N/A'}`);
      console.log(`  Error Code: ${txn.error_code || 'N/A'}`);
      console.log(`  Error Text: ${txn.error_text || 'N/A'}`);
      console.log(`  Voided At: ${txn.voided_at ? new Date(txn.voided_at * 1000).toISOString() : 'N/A'}`);
      console.log(`  Fraud Flag: ${txn.fraud_flag || 'N/A'}`);
      console.log(`  Amount Unused: $${((txn.amount_unused || 0) / 100).toFixed(2)}`);
      console.log(`  Masked Card Number: ${txn.masked_card_number || 'N/A'}`);
      console.log(`  Amount Capturable: $${((txn.amount_capturable || 0) / 100).toFixed(2)}`);
      console.log(`  Refunded Txn ID: ${txn.refunded_txn_id || 'N/A'}`);
      console.log(`  Reversal Txn ID: ${txn.reversal_transaction_id || 'N/A'}`);
      
      if (txn.linked_invoices?.length) {
        console.log(`  Linked Invoices:`);
        for (const inv of txn.linked_invoices) {
          console.log(`    - Invoice: ${inv.invoice_id}`);
          console.log(`      Amount Applied: $${(inv.applied_amount / 100).toFixed(2)}`);
          console.log(`      Applied At: ${new Date(inv.applied_at * 1000).toISOString()}`);
        }
      }
      
      if (txn.linked_refunds?.length) {
        console.log(`  Linked Refunds:`);
        for (const ref of txn.linked_refunds) {
          console.log(`    - Refund Txn: ${ref.txn_id}`);
          console.log(`      Amount: $${(ref.txn_amount / 100).toFixed(2)}`);
          console.log(`      Date: ${new Date(ref.txn_date * 1000).toISOString()}`);
        }
      }
    }
  } else {
    console.log("No transactions found");
  }

  console.log("\n" + "=".repeat(60));
  console.log("=== PROMOTIONAL CREDITS ===");
  console.log("=".repeat(60));
  
  const promoCreditsData = await apiGet(`/promotional_credits?customer_id[is]=${customer.id}&limit=20`);
  
  if (promoCreditsData?.list?.length) {
    for (const item of promoCreditsData.list) {
      const credit = item.promotional_credit;
      console.log(`\nCredit: ${credit.id}`);
      console.log(`  Type: ${credit.type}`);
      console.log(`  Amount: $${(credit.amount / 100).toFixed(2)}`);
      console.log(`  Credit Type: ${credit.credit_type}`);
      console.log(`  Description: ${credit.description || 'N/A'}`);
      console.log(`  Reference: ${credit.reference || 'N/A'}`);
      console.log(`  Closing Balance: $${(credit.closing_balance / 100).toFixed(2)}`);
      console.log(`  Created At: ${new Date(credit.created_at * 1000).toISOString()}`);
    }
  } else {
    console.log("No promotional credits found");
  }

  console.log("\n" + "=".repeat(60));
  console.log("=== CREDIT NOTES ===");
  console.log("=".repeat(60));
  
  const creditNotesData = await apiGet(`/credit_notes?customer_id[is]=${customer.id}&limit=20`);
  
  if (creditNotesData?.list?.length) {
    for (const item of creditNotesData.list) {
      const cn = item.credit_note;
      console.log(`\nCredit Note: ${cn.id}`);
      console.log(`  Status: ${cn.status}`);
      console.log(`  Type: ${cn.type}`);
      console.log(`  Reason Code: ${cn.reason_code}`);
      console.log(`  Date: ${new Date(cn.date * 1000).toISOString()}`);
      console.log(`  Total: $${(cn.total / 100).toFixed(2)}`);
      console.log(`  Amount Allocated: $${((cn.amount_allocated || 0) / 100).toFixed(2)}`);
      console.log(`  Amount Refunded: $${((cn.amount_refunded || 0) / 100).toFixed(2)}`);
      console.log(`  Amount Available: $${((cn.amount_available || 0) / 100).toFixed(2)}`);
      console.log(`  Reference Invoice: ${cn.reference_invoice_id || 'N/A'}`);
      
      if (cn.line_items?.length) {
        console.log(`  Line Items:`);
        for (const li of cn.line_items) {
          console.log(`    - ${li.description}: $${(li.amount / 100).toFixed(2)}`);
        }
      }
    }
  } else {
    console.log("No credit notes found");
  }

  console.log("\n" + "=".repeat(60));
  console.log("=== UNBILLED CHARGES ===");
  console.log("=".repeat(60));
  
  const unbilledData = await apiGet(`/unbilled_charges?customer_id[is]=${customer.id}`);
  
  if (unbilledData?.list?.length) {
    for (const item of unbilledData.list) {
      const charge = item.unbilled_charge;
      console.log(`\nUnbilled Charge: ${charge.id}`);
      console.log(`  Description: ${charge.description}`);
      console.log(`  Amount: $${(charge.amount / 100).toFixed(2)}`);
      console.log(`  Quantity: ${charge.quantity || 1}`);
      console.log(`  Unit Amount: $${((charge.unit_amount || charge.amount) / 100).toFixed(2)}`);
      console.log(`  Entity Type: ${charge.entity_type}`);
      console.log(`  Date From: ${charge.date_from ? new Date(charge.date_from * 1000).toISOString() : 'N/A'}`);
      console.log(`  Date To: ${charge.date_to ? new Date(charge.date_to * 1000).toISOString() : 'N/A'}`);
    }
  } else {
    console.log("No unbilled charges found");
  }

  console.log("\n" + "=".repeat(60));
  console.log("=== PAYMENT SOURCES ===");
  console.log("=".repeat(60));
  
  const paymentSourcesData = await apiGet(`/payment_sources?customer_id[is]=${customer.id}`);
  
  if (paymentSourcesData?.list?.length) {
    for (const item of paymentSourcesData.list) {
      const ps = item.payment_source;
      console.log(`\nPayment Source: ${ps.id}`);
      console.log(`  Type: ${ps.type}`);
      console.log(`  Status: ${ps.status}`);
      console.log(`  Gateway: ${ps.gateway}`);
      console.log(`  Gateway Account ID: ${ps.gateway_account_id}`);
      console.log(`  Reference ID: ${ps.reference_id}`);
      console.log(`  Created At: ${new Date(ps.created_at * 1000).toISOString()}`);
      
      if (ps.card) {
        console.log(`  Card:`);
        console.log(`    Brand: ${ps.card.brand}`);
        console.log(`    Last 4: ${ps.card.last4}`);
        console.log(`    Expiry: ${ps.card.expiry_month}/${ps.card.expiry_year}`);
        console.log(`    Funding Type: ${ps.card.funding_type}`);
      }
      
      if (ps.bank_account) {
        console.log(`  Bank Account:`);
        console.log(`    Last 4: ${ps.bank_account.last4}`);
        console.log(`    Bank Name: ${ps.bank_account.bank_name || 'N/A'}`);
        console.log(`    Account Type: ${ps.bank_account.account_type || 'N/A'}`);
        console.log(`    Account Holder Type: ${ps.bank_account.account_holder_type || 'N/A'}`);
      }
    }
  } else {
    console.log("No payment sources found");
  }

  console.log("\n=========================================");
  console.log("END OF FULL REPORT");
  console.log("=========================================");
}

main();

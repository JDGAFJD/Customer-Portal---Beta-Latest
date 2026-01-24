const CUSTOMER_EMAIL = 'chey_bacca@icloud.com';
const SHOPIFY_STORE = 'nomadinternet';

async function fetchShopifyOrders() {
  console.log('\n=== SHOPIFY ORDERS ===\n');
  
  const accessToken = process.env.SHOPIFY_ADMIN_KEY;
  
  if (!accessToken) {
    console.log('Missing Shopify Admin API token');
    return [];
  }

  try {
    console.log(`Searching for orders with email: ${CUSTOMER_EMAIL}`);
    console.log(`Using store: ${SHOPIFY_STORE}.myshopify.com`);
    
    const ordersUrl = `https://${SHOPIFY_STORE}.myshopify.com/admin/api/2024-01/orders.json?status=any&limit=250`;
    
    const ordersResponse = await fetch(ordersUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      }
    });

    if (!ordersResponse.ok) {
      const errorText = await ordersResponse.text();
      console.log(`Shopify orders fetch failed (${ordersResponse.status}): ${errorText}`);
      return [];
    }

    const ordersData = await ordersResponse.json() as any;
    const allOrders = ordersData.orders || [];
    
    console.log(`Fetched ${allOrders.length} total orders, filtering by email...`);
    
    const orders = allOrders.filter((order: any) => 
      order.email?.toLowerCase() === CUSTOMER_EMAIL.toLowerCase() ||
      order.contact_email?.toLowerCase() === CUSTOMER_EMAIL.toLowerCase()
    );
    
    console.log(`\n--- Found ${orders.length} Order(s) for ${CUSTOMER_EMAIL} ---\n`);

    orders.forEach((order: any, index: number) => {
      console.log(`Order #${index + 1}:`);
      console.log(`  Order Number: ${order.name}`);
      console.log(`  Order ID: ${order.id}`);
      console.log(`  Created: ${order.created_at}`);
      console.log(`  Financial Status: ${order.financial_status}`);
      console.log(`  Fulfillment Status: ${order.fulfillment_status || 'unfulfilled'}`);
      console.log(`  Total: ${order.total_price} ${order.currency}`);
      
      if (order.line_items?.length > 0) {
        console.log(`  Items:`);
        order.line_items.forEach((item: any) => {
          console.log(`    - ${item.name} (x${item.quantity}) - ${item.price}`);
        });
      }
      
      if (order.shipping_address) {
        const addr = order.shipping_address;
        console.log(`  Shipping Address: ${addr.address1}, ${addr.city}, ${addr.province} ${addr.zip}`);
      }
      console.log('');
    });

    return orders;
  } catch (error) {
    console.log(`Shopify API error: ${error}`);
    return [];
  }
}

async function fetchShipstationOrders() {
  console.log('\n=== SHIPSTATION ORDERS ===\n');
  
  const apiKey = process.env.SHIPSTATION_API_KEY;
  const apiSecret = process.env.SHIPSTATION_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.log('Missing Shipstation credentials');
    return [];
  }

  try {
    const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    
    console.log(`Searching for orders with email: ${CUSTOMER_EMAIL}`);
    console.log('Note: ShipStation API does not filter by email directly, fetching recent orders...\n');

    let allOrders: any[] = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore && page <= 5) {
      const url = `https://ssapi.shipstation.com/orders?pageSize=${pageSize}&page=${page}&sortBy=OrderDate&sortDir=DESC`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Shipstation API failed (${response.status}): ${errorText}`);
        break;
      }

      const data = await response.json() as any;
      const orders = data.orders || [];
      
      allOrders = allOrders.concat(orders);
      
      console.log(`Fetched page ${page}: ${orders.length} orders (total: ${allOrders.length})`);
      
      if (orders.length < pageSize) {
        hasMore = false;
      }
      page++;
    }

    const customerOrders = allOrders.filter(
      (order: any) => order.customerEmail?.toLowerCase() === CUSTOMER_EMAIL.toLowerCase()
    );

    console.log(`\n--- Found ${customerOrders.length} Order(s) for ${CUSTOMER_EMAIL} ---\n`);

    customerOrders.forEach((order: any, index: number) => {
      console.log(`Order #${index + 1}:`);
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  Order ID: ${order.orderId}`);
      console.log(`  Order Date: ${order.orderDate}`);
      console.log(`  Order Status: ${order.orderStatus}`);
      console.log(`  Order Total: $${order.orderTotal}`);
      console.log(`  Customer: ${order.customerName || 'N/A'}`);
      console.log(`  Email: ${order.customerEmail}`);
      
      if (order.items?.length > 0) {
        console.log(`  Items:`);
        order.items.forEach((item: any) => {
          console.log(`    - ${item.name} (x${item.quantity}) - SKU: ${item.sku || 'N/A'}`);
        });
      }
      
      if (order.shipTo) {
        const addr = order.shipTo;
        console.log(`  Ship To: ${addr.name}`);
        console.log(`  Address: ${addr.street1}, ${addr.city}, ${addr.state} ${addr.postalCode}`);
      }
      
      if (order.shipments?.length > 0) {
        console.log(`  Shipments:`);
        order.shipments.forEach((ship: any) => {
          console.log(`    - Carrier: ${ship.carrierCode}, Tracking: ${ship.trackingNumber || 'N/A'}`);
        });
      }
      console.log('');
    });

    return customerOrders;
  } catch (error) {
    console.log(`Shipstation API error: ${error}`);
    return [];
  }
}

async function main() {
  console.log('=========================================');
  console.log(`Fetching Orders for: ${CUSTOMER_EMAIL}`);
  console.log('=========================================');
  
  const [shopifyOrders, shipstationOrders] = await Promise.all([
    fetchShopifyOrders(),
    fetchShipstationOrders()
  ]);

  console.log('\n=========================================');
  console.log('SUMMARY');
  console.log('=========================================');
  console.log(`Shopify Orders: ${shopifyOrders.length}`);
  console.log(`Shipstation Orders: ${shipstationOrders.length}`);
}

main().catch(console.error);

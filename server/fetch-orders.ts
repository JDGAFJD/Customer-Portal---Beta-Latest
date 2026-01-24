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
      console.log(`  Updated: ${order.updated_at}`);
      console.log(`  Email: ${order.email}`);
      console.log(`  Phone: ${order.phone || 'N/A'}`);
      console.log(`  Financial Status: ${order.financial_status}`);
      console.log(`  Fulfillment Status: ${order.fulfillment_status || 'unfulfilled'}`);
      console.log(`  Total: ${order.total_price} ${order.currency}`);
      console.log(`  Subtotal: ${order.subtotal_price}`);
      console.log(`  Total Tax: ${order.total_tax}`);
      console.log(`  Total Discounts: ${order.total_discounts}`);
      console.log(`  Total Shipping: ${order.total_shipping_price_set?.shop_money?.amount || '0.00'}`);
      console.log(`  Order Status URL: ${order.order_status_url || 'N/A'}`);
      console.log(`  Tags: ${order.tags || 'None'}`);
      console.log(`  Note: ${order.note || 'None'}`);
      console.log(`  Source: ${order.source_name}`);
      console.log(`  Gateway: ${order.gateway}`);
      console.log(`  Processing Method: ${order.processing_method}`);
      
      if (order.note_attributes?.length > 0) {
        console.log(`  Note Attributes (Custom Fields):`);
        order.note_attributes.forEach((attr: any) => {
          console.log(`    - ${attr.name}: ${attr.value}`);
        });
      }
      
      if (order.line_items?.length > 0) {
        console.log(`  Items:`);
        order.line_items.forEach((item: any) => {
          console.log(`    - ${item.name}`);
          console.log(`      SKU: ${item.sku || 'N/A'}`);
          console.log(`      Quantity: ${item.quantity}`);
          console.log(`      Price: ${item.price}`);
          console.log(`      Variant ID: ${item.variant_id}`);
          console.log(`      Product ID: ${item.product_id}`);
          console.log(`      Fulfillment Status: ${item.fulfillment_status || 'unfulfilled'}`);
          if (item.properties?.length > 0) {
            console.log(`      Properties:`);
            item.properties.forEach((prop: any) => {
              console.log(`        - ${prop.name}: ${prop.value}`);
            });
          }
        });
      }
      
      if (order.fulfillments?.length > 0) {
        console.log(`  Fulfillments/Tracking:`);
        order.fulfillments.forEach((fulfillment: any, fIndex: number) => {
          console.log(`    Fulfillment ${fIndex + 1}:`);
          console.log(`      ID: ${fulfillment.id}`);
          console.log(`      Status: ${fulfillment.status}`);
          console.log(`      Created: ${fulfillment.created_at}`);
          console.log(`      Tracking Company: ${fulfillment.tracking_company || 'N/A'}`);
          console.log(`      Tracking Number: ${fulfillment.tracking_number || 'N/A'}`);
          console.log(`      Tracking URL: ${fulfillment.tracking_url || 'N/A'}`);
          if (fulfillment.tracking_numbers?.length > 0) {
            console.log(`      All Tracking Numbers: ${fulfillment.tracking_numbers.join(', ')}`);
          }
          if (fulfillment.tracking_urls?.length > 0) {
            console.log(`      All Tracking URLs: ${fulfillment.tracking_urls.join(', ')}`);
          }
        });
      }
      
      if (order.shipping_address) {
        const addr = order.shipping_address;
        console.log(`  Shipping Address:`);
        console.log(`    Name: ${addr.first_name} ${addr.last_name}`);
        console.log(`    Company: ${addr.company || 'N/A'}`);
        console.log(`    Address: ${addr.address1}`);
        console.log(`    Address 2: ${addr.address2 || 'N/A'}`);
        console.log(`    City: ${addr.city}`);
        console.log(`    Province: ${addr.province} (${addr.province_code})`);
        console.log(`    Zip: ${addr.zip}`);
        console.log(`    Country: ${addr.country} (${addr.country_code})`);
        console.log(`    Phone: ${addr.phone || 'N/A'}`);
      }
      
      if (order.billing_address) {
        const addr = order.billing_address;
        console.log(`  Billing Address:`);
        console.log(`    Name: ${addr.first_name} ${addr.last_name}`);
        console.log(`    Address: ${addr.address1}, ${addr.city}, ${addr.province} ${addr.zip}`);
      }
      
      if (order.shipping_lines?.length > 0) {
        console.log(`  Shipping Methods:`);
        order.shipping_lines.forEach((line: any) => {
          console.log(`    - ${line.title}: ${line.price}`);
        });
      }
      
      if (order.discount_codes?.length > 0) {
        console.log(`  Discount Codes:`);
        order.discount_codes.forEach((code: any) => {
          console.log(`    - ${code.code}: ${code.amount} (${code.type})`);
        });
      }
      
      if (order.refunds?.length > 0) {
        console.log(`  Refunds: ${order.refunds.length}`);
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
      console.log(`  Order Key: ${order.orderKey}`);
      console.log(`  Order Date: ${order.orderDate}`);
      console.log(`  Create Date: ${order.createDate}`);
      console.log(`  Modify Date: ${order.modifyDate}`);
      console.log(`  Payment Date: ${order.paymentDate || 'N/A'}`);
      console.log(`  Ship By Date: ${order.shipByDate || 'N/A'}`);
      console.log(`  Order Status: ${order.orderStatus}`);
      console.log(`  Order Total: $${order.orderTotal}`);
      console.log(`  Amount Paid: $${order.amountPaid || 0}`);
      console.log(`  Tax Amount: $${order.taxAmount || 0}`);
      console.log(`  Shipping Amount: $${order.shippingAmount || 0}`);
      console.log(`  Customer ID: ${order.customerId || 'N/A'}`);
      console.log(`  Customer: ${order.customerUsername || order.customerName || 'N/A'}`);
      console.log(`  Email: ${order.customerEmail}`);
      console.log(`  Customer Notes: ${order.customerNotes || 'None'}`);
      console.log(`  Internal Notes: ${order.internalNotes || 'None'}`);
      console.log(`  Gift: ${order.gift ? 'Yes' : 'No'}`);
      console.log(`  Gift Message: ${order.giftMessage || 'None'}`);
      console.log(`  Payment Method: ${order.paymentMethod || 'N/A'}`);
      console.log(`  Requested Shipping: ${order.requestedShippingService || 'N/A'}`);
      console.log(`  Carrier Code: ${order.carrierCode || 'N/A'}`);
      console.log(`  Service Code: ${order.serviceCode || 'N/A'}`);
      console.log(`  Package Code: ${order.packageCode || 'N/A'}`);
      console.log(`  Confirmation: ${order.confirmation || 'N/A'}`);
      console.log(`  Ship Date: ${order.shipDate || 'N/A'}`);
      console.log(`  Hold Until Date: ${order.holdUntilDate || 'N/A'}`);
      
      console.log(`  --- Custom Fields ---`);
      console.log(`  Custom Field 1: ${order.customField1 || 'N/A'}`);
      console.log(`  Custom Field 2: ${order.customField2 || 'N/A'}`);
      console.log(`  Custom Field 3: ${order.customField3 || 'N/A'}`);
      
      console.log(`  --- Store/Source Info ---`);
      console.log(`  Store ID: ${order.storeId || 'N/A'}`);
      console.log(`  External Order ID: ${order.externallyFulfilled ? 'Yes' : 'No'}`);
      console.log(`  External Order ID (Merged): ${order.externallyFulfilledBy || 'N/A'}`);
      
      console.log(`  --- Weight/Dimensions ---`);
      if (order.weight) {
        console.log(`  Weight: ${order.weight.value} ${order.weight.units}`);
      }
      if (order.dimensions) {
        console.log(`  Dimensions: ${order.dimensions.length}x${order.dimensions.width}x${order.dimensions.height} ${order.dimensions.units}`);
      }
      
      console.log(`  --- Insurance ---`);
      console.log(`  Insurance Provider: ${order.insuranceOptions?.provider || 'N/A'}`);
      console.log(`  Insure Shipment: ${order.insuranceOptions?.insureShipment ? 'Yes' : 'No'}`);
      console.log(`  Insured Value: $${order.insuranceOptions?.insuredValue || 0}`);
      
      if (order.advancedOptions) {
        console.log(`  --- Advanced Options ---`);
        console.log(`  Warehouse ID: ${order.advancedOptions.warehouseId || 'N/A'}`);
        console.log(`  Non-Machinable: ${order.advancedOptions.nonMachinable ? 'Yes' : 'No'}`);
        console.log(`  Saturday Delivery: ${order.advancedOptions.saturdayDelivery ? 'Yes' : 'No'}`);
        console.log(`  Contains Alcohol: ${order.advancedOptions.containsAlcohol ? 'Yes' : 'No'}`);
        console.log(`  Store ID: ${order.advancedOptions.storeId || 'N/A'}`);
        console.log(`  Custom Field 1: ${order.advancedOptions.customField1 || 'N/A'}`);
        console.log(`  Custom Field 2: ${order.advancedOptions.customField2 || 'N/A'}`);
        console.log(`  Custom Field 3: ${order.advancedOptions.customField3 || 'N/A'}`);
        console.log(`  Source: ${order.advancedOptions.source || 'N/A'}`);
        console.log(`  Merged/Split: ${order.advancedOptions.mergedOrSplit ? 'Yes' : 'No'}`);
        console.log(`  Merged IDs: ${order.advancedOptions.mergedIds?.join(', ') || 'N/A'}`);
        console.log(`  Parent ID: ${order.advancedOptions.parentId || 'N/A'}`);
        console.log(`  Bill To Party: ${order.advancedOptions.billToParty || 'N/A'}`);
        console.log(`  Bill To Account: ${order.advancedOptions.billToAccount || 'N/A'}`);
        console.log(`  Bill To Postal Code: ${order.advancedOptions.billToPostalCode || 'N/A'}`);
        console.log(`  Bill To Country Code: ${order.advancedOptions.billToCountryCode || 'N/A'}`);
      }
      
      if (order.items?.length > 0) {
        console.log(`  --- Items (${order.items.length}) ---`);
        order.items.forEach((item: any, iIndex: number) => {
          console.log(`    Item ${iIndex + 1}:`);
          console.log(`      Order Item ID: ${item.orderItemId}`);
          console.log(`      Line Item Key: ${item.lineItemKey || 'N/A'}`);
          console.log(`      SKU: ${item.sku || 'N/A'}`);
          console.log(`      Name: ${item.name}`);
          console.log(`      Image URL: ${item.imageUrl || 'N/A'}`);
          console.log(`      Quantity: ${item.quantity}`);
          console.log(`      Unit Price: $${item.unitPrice || 0}`);
          console.log(`      Tax Amount: $${item.taxAmount || 0}`);
          console.log(`      Shipping Amount: $${item.shippingAmount || 0}`);
          console.log(`      Warehouse Location: ${item.warehouseLocation || 'N/A'}`);
          console.log(`      Product ID: ${item.productId || 'N/A'}`);
          console.log(`      Fulfillment SKU: ${item.fulfillmentSku || 'N/A'}`);
          console.log(`      Adjustment: ${item.adjustment ? 'Yes' : 'No'}`);
          console.log(`      UPC: ${item.upc || 'N/A'}`);
          if (item.options?.length > 0) {
            console.log(`      Options:`);
            item.options.forEach((opt: any) => {
              console.log(`        - ${opt.name}: ${opt.value}`);
            });
          }
        });
      }
      
      if (order.shipTo) {
        const addr = order.shipTo;
        console.log(`  --- Ship To ---`);
        console.log(`  Name: ${addr.name}`);
        console.log(`  Company: ${addr.company || 'N/A'}`);
        console.log(`  Street 1: ${addr.street1}`);
        console.log(`  Street 2: ${addr.street2 || 'N/A'}`);
        console.log(`  Street 3: ${addr.street3 || 'N/A'}`);
        console.log(`  City: ${addr.city}`);
        console.log(`  State: ${addr.state}`);
        console.log(`  Postal Code: ${addr.postalCode}`);
        console.log(`  Country: ${addr.country}`);
        console.log(`  Phone: ${addr.phone || 'N/A'}`);
        console.log(`  Residential: ${addr.residential ? 'Yes' : 'No'}`);
        console.log(`  Address Verified: ${addr.addressVerified || 'N/A'}`);
      }
      
      if (order.billTo) {
        const addr = order.billTo;
        console.log(`  --- Bill To ---`);
        console.log(`  Name: ${addr.name}`);
        console.log(`  Company: ${addr.company || 'N/A'}`);
        console.log(`  Street 1: ${addr.street1}`);
        console.log(`  City: ${addr.city}`);
        console.log(`  State: ${addr.state}`);
        console.log(`  Postal Code: ${addr.postalCode}`);
        console.log(`  Country: ${addr.country}`);
        console.log(`  Phone: ${addr.phone || 'N/A'}`);
      }
      
      if (order.shipments?.length > 0) {
        console.log(`  --- Shipments (${order.shipments.length}) ---`);
        order.shipments.forEach((ship: any, sIndex: number) => {
          console.log(`    Shipment ${sIndex + 1}:`);
          console.log(`      Shipment ID: ${ship.shipmentId}`);
          console.log(`      Order ID: ${ship.orderId}`);
          console.log(`      Order Key: ${ship.orderKey || 'N/A'}`);
          console.log(`      Order Number: ${ship.orderNumber}`);
          console.log(`      Create Date: ${ship.createDate}`);
          console.log(`      Ship Date: ${ship.shipDate}`);
          console.log(`      Shipment Cost: $${ship.shipmentCost || 0}`);
          console.log(`      Insurance Cost: $${ship.insuranceCost || 0}`);
          console.log(`      Tracking Number: ${ship.trackingNumber || 'N/A'}`);
          console.log(`      Carrier Code: ${ship.carrierCode}`);
          console.log(`      Service Code: ${ship.serviceCode}`);
          console.log(`      Package Code: ${ship.packageCode}`);
          console.log(`      Confirmation: ${ship.confirmation || 'N/A'}`);
          console.log(`      Warehouse ID: ${ship.warehouseId || 'N/A'}`);
          console.log(`      Voided: ${ship.voided ? 'Yes' : 'No'}`);
          console.log(`      Void Date: ${ship.voidDate || 'N/A'}`);
          console.log(`      Market Notified: ${ship.marketplaceNotified ? 'Yes' : 'No'}`);
          console.log(`      Notify Error Msg: ${ship.notifyErrorMessage || 'N/A'}`);
          console.log(`      Label Data: ${ship.labelData ? 'Available' : 'N/A'}`);
          console.log(`      Form Data: ${ship.formData ? 'Available' : 'N/A'}`);
          if (ship.shipTo) {
            console.log(`      Ship To: ${ship.shipTo.name}, ${ship.shipTo.street1}, ${ship.shipTo.city}, ${ship.shipTo.state} ${ship.shipTo.postalCode}`);
          }
          if (ship.weight) {
            console.log(`      Weight: ${ship.weight.value} ${ship.weight.units}`);
          }
          if (ship.dimensions) {
            console.log(`      Dimensions: ${ship.dimensions.length}x${ship.dimensions.width}x${ship.dimensions.height} ${ship.dimensions.units}`);
          }
          if (ship.shipmentItems?.length > 0) {
            console.log(`      Shipment Items:`);
            ship.shipmentItems.forEach((si: any) => {
              console.log(`        - ${si.name} (x${si.quantity}) SKU: ${si.sku || 'N/A'}`);
            });
          }
        });
      } else {
        console.log(`  --- Shipments ---`);
        console.log(`  No shipments yet`);
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

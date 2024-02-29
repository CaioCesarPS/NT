function addToStockWhenSalesOrderFinished(
  orderedSalesOrders,
  orderedPurchaseOrders,
  index,
  stock
) {
  if (!orderedSalesOrders[index]) {
    stock += orderedPurchaseOrders[index].quantity;
    orderedPurchaseOrders[index].arrived = true;

    return {
      error: true,
      updatedStock: null,
    };
  }

  return {
    error: false,
    updatedStock: stock,
  };
}

function allocate(salesOrders, purchaseOrders) {
  const orderedSalesOrders = salesOrders.sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  const orderedPurchaseOrders = purchaseOrders
    .map((order) => {
      return {
        ...order,
        arrived: false,
      };
    })
    .sort(
      (a, b) =>
        new Date(a.receiving).getTime() - new Date(b.receiving).getTime()
    );

  let stock = 0;
  let index = 0;
  let purchaseOrderIndex = 0;
  let allocationDates = [];
  const hasAnyUnarrivedPurchaseOrder = orderedPurchaseOrders.some(
    (order) => !order.arrived
  );

  // iterate until the purchase orders are all arrived
  while (hasAnyUnarrivedPurchaseOrder) {
    if (orderedPurchaseOrders.length === index) {
      return allocationDates;
    }

    const { error, updatedStock } = addToStockWhenSalesOrderFinished(
      orderedSalesOrders,
      orderedPurchaseOrders,
      index,
      stock
    );

    if (error) {
      index++;
      continue;
    }

    stock = updatedStock;

    // if the stock is less than the ordered quantity, we need to wait for the next purchase order
    if (stock < orderedSalesOrders[index].quantity) {
      if (!orderedPurchaseOrders[purchaseOrderIndex]) {
        return allocationDates;
      }

      // iterate over the purchase orders until the stock is enough to fulfill the sales order
      while (stock < orderedSalesOrders[index].quantity) {
        stock += orderedPurchaseOrders[purchaseOrderIndex].quantity;
        orderedPurchaseOrders[purchaseOrderIndex].arrived = true;
        purchaseOrderIndex++;
      }
  }

    // if the stock is enough to fulfill the sales order, we need to allocate the expected delivery date
    if (stock >= orderedSalesOrders[index].quantity) {
      stock -= orderedSalesOrders[index].quantity;
      const expectedDateInSec = new Date(
        orderedPurchaseOrders[index].receiving
      );

      const expectedDate = new Date(
        expectedDateInSec.setDate(expectedDateInSec.getDate() + 7)
      )
        .toISOString()
        .split('T')[0];
      allocationDates.push({
        id: orderedSalesOrders[index].id,
        expectedDeliveryDate: expectedDate,
      });
    }
    index++;
    continue;
  }
}

console.log(allocate(salesOrders, purchaseOrders));

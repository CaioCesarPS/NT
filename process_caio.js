// 1- O cliente pode fazer compra de produtos em estoque ou não, mas que estejam vindo.
// 2- Os Clientes que podem fazer pedidos de prdutos que não estejam no estoque mas eles precisam de uma data pra saber quando o pedido será
// atendido.
//3- Para fazer isso, será alocado o fornecimentos recebido aos pedidos pendentes por ordem de chegada.

// SalesOrders: são as ordens criadas pelos clientes para o loja.
// PurchaseOrders: são as ordens criadas pela loja pra receber o produto do fornecedor.

// Expected: retornar um array de objetos, cada objeto deve incluir o id da saleOrder, data que o cliente deve esperar para receber o produto
// OBS: só fazemos a ordem de compra quando temos produtos suficientes para preencher a order ex: if a saleOrder for para 2 nós precisamos ter
// 2 disponiveis antes de enviar
//
// A funçao deve suportar qualquer quantidade de sales orders e purchase ordes.
// Nesse exemplo vamos usar apenas 1 tipo de produto, assumindo que o cliente vai receber 7 dias depois da loja ter recebido do fornecedor.

const salesOrders = [
  {
    id: 'S1',
    created: '2020-01-02',
    quantity: 6,
  },
  {
    id: 'S2',
    created: '2020-11-05',
    quantity: 2,
  },
  {
    id: 'S3',
    created: '2019-12-04',
    quantity: 3,
  },
  {
    id: 'S4',
    created: '2020-01-20',
    quantity: 2,
  },
  {
    id: 'S5',
    created: '2019-12-15',
    quantity: 9,
  },
];

const purchaseOrders = [
  {
    id: 'P1',
    receiving: '2020-01-04',
    quantity: 4,
  },
  {
    id: 'P2',
    receiving: '2020-01-05',
    quantity: 3,
  },
  {
    id: 'P3',
    receiving: '2020-02-01',
    quantity: 5,
  },
  {
    id: 'P4',
    receiving: '2020-03-05',
    quantity: 1,
  },
  {
    id: 'P5',
    receiving: '2020-02-20',
    quantity: 7,
  },
];

const stockEnum = {
  INSUFICIENT_STOCK: 'INSUFICIENT_STOCK',
};

// function removeFromStockOrFail(stock, quantityToRemove) {
//   if (quantityToRemove > stock) {
//     return {
//       updatedStock: null,
//       error: stockEnum.INSUFICIENT_STOCK,
//     };
//   }
//   return {
//     updatedStock: stock - quantityToRemove,
//     error: null,
//   };
// }

// function addToStock(stock, quantityToAdd) {
//   return (stock += quantityToAdd);
// }

// function allocateStock(salesOrders, purchaseOrders) {}

function allocate(salesOrders, purchaseOrders) {
  // Sort sales orders by creation date
  const orderedSalesOrders = salesOrders
    .sort((a, b) => new Date(b.created) - new Date(a.created))
    .reverse();
  console.log('orderedSalesOrders', orderedSalesOrders);

  // Sort purchase orders by receiving date
  const orderedPurchaseOrders = purchaseOrders
    .sort((a, b) => new Date(b.receiving) - new Date(a.receiving))
    .reverse();
  console.log('orderedPurchaseOrders', orderedPurchaseOrders);

  let availableQuantity = 0; // Initialize available quantity
  let allocationDates = {}; // Object to store allocation dates for each sales order

  let i = 0; // Index for purchase orders
  for (const salesOrder of orderedSalesOrders) {
    const { id, created, quantity } = salesOrder;
    let remainingQuantity = quantity; // Initialize remaining quantity for the current sales order

    // Allocate from available supply until the sales order is fulfilled
    while (remainingQuantity > 0 && i < orderedPurchaseOrders.length) {
      const purchaseOrder = orderedPurchaseOrders[i];
      const { receiving, quantity: receivedQuantity } = purchaseOrder;

      // Update available quantity if purchase order has been received
      if (new Date(receiving) <= new Date(created)) {
        availableQuantity += receivedQuantity;
        i++;
        continue; // Move to the next purchase order
      }

      // Allocate from available supply to the current sales order
      const allocatedQuantity = Math.min(remainingQuantity, receivedQuantity);
      remainingQuantity -= allocatedQuantity;
      availableQuantity -= allocatedQuantity;

      // Store allocation date for the current sales order
      if (!allocationDates[id]) {
        allocationDates[id] = receiving;
      }

      // If the sales order is fulfilled, break the loop
      if (remainingQuantity === 0) {
        break;
      }

      i++; // Move to the next purchase order
    }

    // If the sales order is not fulfilled, calculate the expected allocation date
    if (remainingQuantity > 0) {
      // const daysToWait =
      //   Math.ceil(remainingQuantity / orderedPurchaseOrders[i - 1].quantity) * 7;

      const remainingPurchaseQuantity = purchaseOrders[i - 1].quantity;
      let ordersNeeded = Math.ceil(
        remainingQuantity / remainingPurchaseQuantity
      );

      // Calculamos o tempo de espera multiplicando o número de pedidos necessários pelo tempo de entrega de um pedido
      const daysToWait = ordersNeeded * 7;
      const expectedAllocationDate = new Date(
        orderedPurchaseOrders[i - 1].receiving
      );
      expectedAllocationDate.setDate(
        expectedAllocationDate.getDate() + daysToWait
      );
      allocationDates[id] = expectedAllocationDate.toISOString().split('T')[0];
    }
  }

  // Create an array of objects containing sales order ID and allocation date
  const result = Object.keys(allocationDates)
    .map((id) => ({
      id: id,
      expectedDeliveryDate: allocationDates[id],
    }))
    .sort(
      (a, b) =>
        new Date(a.expectedDeliveryDate) - new Date(b.expectedDeliveryDate)
    );

  return result;
}

console.log(allocate(salesOrders, purchaseOrders));

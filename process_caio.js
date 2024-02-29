// 1- O cliente pode fazer compra de produtos em estoque ou não, mas que estejam vindo.
// 2- Os Clientes podem fazer pedidos de prdutos que não estejam no estoque mas eles precisam de uma data pra saber quando o pedido será
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
  {
    id: 'S6',
    created: '2020-11-07',
    quantity: 1,
  },
  {
    id: 'S7',
    created: '2020-11-08',
    quantity: 5,
  },
  {
    id: 'S8',
    created: '2020-11-09',
    quantity: 3,
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
  {
    id: 'P6',
    receiving: '2020-03-21',
    quantity: 10,
  },
  {
    id: 'P7',
    receiving: '2020-03-22',
    quantity: 10,
  },
  {
    id: 'P8',
    receiving: '2020-03-23',
    quantity: 10,
  },
];

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
  // eu vou iterar sobre as os as compras dos fornecedores, se o estoque atual nao suprir o pedido ele adiciona no estoque.
  // quando o proximo estoque chegar ele vai tentar suprir o pedido novamente.
  // se surprir ele vai criar um objeto contento o id e a data de entrega que é a data do ultimo estoque + 7 dias.
  // ele vai deletar o pedido que foi suprido e vai para o proximo pedido.
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

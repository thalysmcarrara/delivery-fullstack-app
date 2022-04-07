import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import Context from '../context/Context';

const DATA_TEST_ID = 'customer_order_details__element-order-details-label-order-id';
const DATA_TEST_N = 'customer_order_details__element-order-details-label-seller-name';
const DATA_B = 'customer_order_details__button-delivery-check';
const DATA_TEST_DA = 'customer_order_details__element-order-details-label-order-date';
const DATA_S = 'customer_order_details__element-order-details-label-delivery-status';
const DATA_ITEM_N = 'customer_order_details__element-order-table-item-number-';
const DATA_ITEM_D = 'customer_order_details__element-order-table-name-';
const DATA_ITEM_Q = 'customer_order_details__element-order-table-quantity-';
const DATA_ITEM_P = 'customer_order_details__element-order-table-sub-total-';
const DATA_ITEM_TP = 'customer_order_details__element-order-total-price';

function OrderDetails() {
  const { get, socket } = useContext(Context);
  const id = useLocation().pathname.split('/').pop();
  const [order, setOrder] = useState();
  const [currProducts, setProducts] = useState([]);

  const getOrders = async () => {
    const { data: { saleDetail, seller } } = await
    get('customer_checkout', id);

    setOrder({ ...saleDetail, sellerId: seller.name });

    const { data: { products } } = await
    get('customer_orders', id);

    setProducts(products);
  };

  useEffect(() => {
    getOrders();
  }, []); // eslint-disable-line

  const updateStatus = (status) => {
    socket.emit('changeStatus', { id, status });
  };

  socket.on('updateStatus', () => {
    getOrders();
  });

  const head = () => (
    <thead>
      <tr>
        <th data-testid={ DATA_TEST_ID }>{order.id}</th>
        <th data-testid={ DATA_TEST_N }>{order.sellerId}</th>
        <th data-testid={ DATA_TEST_DA }>
          {order.saleDate.split('T')[0].split('-').reverse().join('/')}
        </th>
        <th data-testid={ DATA_S }>{order.status}</th>
        <th>
          <button
            type="button"
            data-testid={ DATA_B }
            disabled={ order.status !== 'Em Trânsito' }
            onClick={ () => updateStatus('Entregue') }
          >
            Marcar como entrege
          </button>
        </th>
      </tr>
    </thead>
  );

  if (!order) return (<div>Loading...</div>);

  return (
    <div>
      <table>
        {head()}
      </table>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Descrição</th>
            <th>Quantidade</th>
            <th>Valor Unitário</th>
            <th>Sub Total</th>
          </tr>
        </thead>
        <tbody>
          { currProducts.map((product, index) => {
            const total = (Number(product.SaleProduct.quantity) * Number(product.price))
              .toFixed(2)
              .toString()
              .replace('.', ',');

            return (
              (
                <tr key={ product.name }>
                  <td
                    data-testid={ `${DATA_ITEM_N}${index}` }
                  >
                    {index + 1}
                  </td>
                  <td data-testid={ `${DATA_ITEM_D}${product.saleId}` }>
                    {product.name}
                  </td>
                  <td data-testid={ `${DATA_ITEM_Q}${product.saleId}` }>
                    {product.SaleProduct.quantity}
                  </td>
                  <td data-testid={ `${DATA_ITEM_P}${product.saleId}` }>
                    {product.price}
                  </td>
                  <td
                    data-testid={ `${DATA_ITEM_TP}${order.id}` }
                  >
                    { total }
                  </td>
                </tr>
              )
            );
          })}
        </tbody>
      </table>
      <h1
        data-testid={ DATA_ITEM_TP }
      >
        {Number(order.totalPrice)
          .toFixed(2)
          .toString()
          .replace('.', ',')}
      </h1>
    </div>
  );
}

export default OrderDetails;
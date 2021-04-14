export const clientSendOrder = (client, date) => `
<p>Hola, espero que te encuentres muy bien.</p>

<p>El cliente ${client}, ha enviado el pedido para el día ${date}.</p>

<p>Por favor revisar los pedidos.</p>

<p>Muchas gracias.</p>
`;

export const clientSendOrderConfirmation = (orderName, date) => `
<p>Hola, espero que te encuentres muy bien.</p>

<p>Este es un correo de confirmación de que ha enviado el pedido ${orderName} para el día ${date}.</p>

<p>Pronto se le estará  entregando su pedido.</p>

<p>Muchas gracias por su preferencia.</p>
`;
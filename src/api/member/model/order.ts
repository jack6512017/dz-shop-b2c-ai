//用户订单API接口
export default {
	// 列表
	orderIndex: '/member/order/index',
	// 详细
	orderView: '/member/order/view',
	// 取消
	orderClose: '/member/order/close',
	// 删除
	orderDelete: '/member/order/delete',
	// 确认收货
	orderTakeDelivery: '/member/order/take-delivery',

	/* 订单退款退货 */
	// 列表
	orderProductIndex: '/member/order-product/index',
	// 退款申请
	orderProductRefundApply: '/member/order-product/refund-apply',
	// 退货提交
	orderProductRefundSalesReturn: '/member/order-product/refund-sales-return',
	// 换货确认收货
	orderProductRefundSalesDelivery: '/member/order-product/refund-sales-delivery',
	// 关闭申请
	orderProductRefundClose: '/member/order-product/refund-close',

	/* 订单售后 */
	// 退款申请
	orderCustomerApply: '/member/order-customer/apply',
	// 退货提交
	orderCustomerSalesReturn: '/member/order-customer/sales-return',
	// 换货确认收货
	orderCustomerSalesDelivery: '/member/order-customer/sales-delivery',
	// 关闭申请
	orderCustomerClose: '/member/order-customer/close',

	/* 订单物流 */
	orderProductExpressDetails: '/member/order-product-express/details',

	/* 订单发票*/
	// 添加
	orderInvoiceCreate: '/member/order-invoice/create',

	/* 卡券详情 */
	// 列表
	orderProductVirtualIndex: '/member/order-product-virtual/index',
	// 详细
	orderProductVirtualView: '/member/order-product-virtual/view',
	// 生产二维码
	orderProductVirtualQr: '/member/order-product-virtual/qr',
};

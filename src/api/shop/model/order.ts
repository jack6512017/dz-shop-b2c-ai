//订单API接口
export default {
	/* 	订单 */
	orderPreview: '/shop/order/order/preview',
	// 创建订单
	orderCreate: '/shop/order/order/create',
	// 运费计算
	orderFreightFee: '/shop/order/order/freight-fee',

	/* 商品提货 */
	// 校验
	orderProductPickupCheck: '/shop/order/product-pickup/check',
	// 提货
	orderProductPickupCreate: '/shop/order/product-pickup/create',
	// 经销商-校验
	orderProductPickupDealerCheck: '/shop/order/product-pickup/dealer-check',
	// 经销商-提货
	orderProductPickupDealerCreate: '/shop/order/product-pickup/dealer-create',

	/* 卡卷核销 */
	// 校验
	orderProductVirtualVerificationCheck: '/shop/order/product-virtual-verification/check',
	// 提货
	orderProductVirtualVerificationCreate: 'shop/order/product-virtual-verification/create',
};

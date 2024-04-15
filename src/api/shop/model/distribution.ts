//分销商API接口
export default {
	/* 用户信息 */
	// 个人中心
	distributionMemberIndex: '/shop/distribution/member/index',
	// 收益统计
	distributionMemberEstimateStat: '/shop/distribution/member/estimate-stat',
	// 获取上级分销商
	distributionMemberParent: '/shop/distribution/member/parent',
	// 我的团队
	distributionMemberChild: '/shop/distribution/member/child',
	// 我的团队(裂变分销)
	distributionMemberFissionChild: '/shop/distribution/member/fission-child',
	// 我的团队(店铺分销)
	distributionMemberStoreChild: '/shop/distribution/member/store-child',
	// 我的团队(云仓分销)
	distributionMemberWarehouseChild: '/shop/distribution/member/warehouse-child',
	// 推广二维码
	distributionMemberQr: '/shop/distribution/member/qr',

	/* 推广海报  */
	// 列表
	distributionPosterIndex: '/shop/distribution/poster/index',

	/* 分销记录 */
	// 列表
	distributionPromoterRecordIndex: '/shop/distribution/promoter-record/index',
	// 待结算变动
	distributionPromoterRecordChange: '/shop/distribution/promoter-record/change',
	// 直推记录
	distributionPromoterRecordSelf: '/shop/distribution/promoter-record/self',
	// 直推记录统计
	distributionPromoterRecordSelfStat: '/shop/distribution/promoter-record/self-stat',
	// 团队记录
	distributionPromoterRecordTeam: '/shop/distribution/promoter-record/team',
	// 团队记录统计
	distributionPromoterRecordTeamStat: '/shop/distribution/promoter-record/team-stat',

	/* 店铺分销-等级 */
	// 列表
	distributionStoreLevelIndex: '/shop/distribution/store-level/index',
	// 下一级升级条件
	distributionStoreLevelNextLevel: '/shop/distribution/store-level/next-level',

	/* 区域分销-申请 */
	// 列表
	distributionPromoterRegionalIndex: '/shop/distribution/promoter-regional/index',
	// 申请
	distributionPromoterRegionalCreate: '/shop/distribution/promoter-regional/create',
	// 最后申请记录
	distributionPromoterRegionalLast: '/shop/distribution/promoter-regional/last',
	// 分销配置
	distributionPromoterRegionalConfig: '/shop/distribution/promoter-regional/config',

	/* 云仓分销-等级 */
	// 列表
	distributionWarehouseLevelIndex: '/shop/distribution/warehouse-level/index',
	// 等级日志
	distributionWarehouseLevelLog: '/shop/distribution/warehouse-level/log',
	// 分销配置
	distributionWarehouseLevelConfig: '/shop/distribution/warehouse-level/config',

	/* 云仓分销-库存产品 */
	// 列表
	distributionWarehouseProductIndex: '/shop/distribution/warehouse-product/index',
	// 详情
	distributionWarehouseProductView: '/shop/distribution/warehouse-product/view',

	/* 云仓分销-进货订单 */
	// 订单预览
	distributionWarehousePurchaseOrderPreview: '/shop/distribution/warehouse-purchase-order/preview',
	// 创建订单
	distributionWarehousePurchaseOrderCreate: '/shop/distribution/warehouse-purchase-order/create',
	// 详细
	distributionWarehousePurchaseOrderView: '/shop/distribution/warehouse-purchase-order/view',

	/* 云仓分销-提货订单 */
	// 订单预览
	distributionWarehousePickUpOrderPreview: '/shop/distribution/warehouse-pick-up-order/preview',
	// 	创建订单
	distributionWarehousePickUpOrderCreate: '/shop/distribution/warehouse-pick-up-order/create',
	// 	运费计算
	distributionWarehousePickUpOrderFreightFee: '/shop/distribution/warehouse-pick-up-order/freight-fee',

	/* 云仓分销-库存日志 */
	// 我的佣金
	distributionWarehouseStockLogIndex: '/shop/distribution/warehouse-stock-log/index',
	// 库存统计
	distributionWarehouseStockLogStatistics: '/shop/distribution/warehouse-stock-log/statistics',

	/* 云仓分销-排行榜 */
	// 代理统计
	distributionWarehouseRankingIndex: '/shop/distribution/warehouse-ranking/index',
};

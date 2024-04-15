<template>
	<view>
		<dz-navbar-immersive
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar title="订单详情"></dz-navbar>
		</dz-navbar-immersive>
		<dz-navbar
			:title="'订单详情'"
			:is-fixed="false"
			:background="{ background: theme.dzBaseColor }"
			:border-bottom="false"
			:back-icon-color="theme.dzBaseFontColor"
			:title-color="theme.dzBaseFontColor"
		></dz-navbar>
		<view class="content">
			<view class="status" :style="{ background: theme.dzBaseColor }">
				<view class="status-box">
					<view class="left">
						<!-- 已付款 -->
						<view
							v-if="[1].indexOf(parseInt(orderDetail.order_status)) !== -1"
							class="dzicon-iconfont dzicon-presentfill icon-size"
							:style="{ color: theme.dzBaseDisabled }"
						></view>
						<!-- 待支付 -->
						<view
							v-if="[0, 201].indexOf(parseInt(orderDetail.order_status)) !== -1"
							class="dzicon-iconfont dzicon-babyfill icon-size"
							:style="{ color: theme.dzBaseDisabled }"
						></view>
						<!-- 已收货 -->
						<view
							v-if="[3, 4, 202].indexOf(parseInt(orderDetail.order_status)) !== -1"
							class="dzicon-iconfont dzicon-baoguo_shouhuo icon-size"
							:style="{ color: theme.dzBaseDisabled }"
						></view>
						<!-- 发货中 -->
						<view
							v-if="[2, 12].indexOf(parseInt(orderDetail.order_status)) !== -1"
							class="dzicon-iconfont dzicon-deliver_fill icon-size"
							:style="{ color: theme.dzBaseDisabled }"
						></view>
						<!-- 待成团-->
						<view
							v-if="[101].indexOf(parseInt(orderDetail.order_status)) !== -1"
							class="dzicon-iconfont dzicon-friendfill icon-size"
							:style="{ color: theme.dzBaseDisabled }"
						></view>
						<!-- 已关闭-->
						<view
							v-if="[-4].indexOf(parseInt(orderDetail.order_status)) !== -1"
							class="dzicon-iconfont dzicon-weichengjiaodingdan icon-size"
							:style="{ color: theme.dzBaseDisabled }"
						></view>
						<view class="tip" :style="{ color: theme.dzBaseFontColor }">
							<!-- <view class="pay" v-if="orderDetail.product[0].refund_status != 0">售后处理</view> -->
							<view class="pay">{{ orderStatusFilter(orderDetail.order_status) }}</view>
							<view class="pay" v-if="joinBuyStatus()"> 正在开团中 </view>
							<view class="pay" v-if="joinBuyTimeoutStatus()"> 开团超时 </view>
							<view class="msg" v-if="refundIndex >= 1">{{ refundIndex }}件商品在售后中</view>
							<view class="msg" v-if="parseInt(orderDetail.order_status) == 0">
								<dz-count-down
									:timestamp="orderDetail.close_left_time"
									:show-days="false"
									:color="theme.dzBaseFontColor"
									fontSize="24"
									:separator-color="theme.dzBaseFontColor"
									:bg-color="theme.dzBaseColor"
									@timeEnd="timeout()"
								></dz-count-down>
								分钟后订单将自动关闭
							</view>
							<!-- 拼团倒计时 -->
							<view
								class="msg"
								v-if="parseInt(orderDetail.order_status) === 101 && orderDetail.close_left_time && orderDetail.close_left_time > 0"
							>
								{{ language.joinBuyGroup.joinBuyLeftTime }}
								<dz-count-down
									:timestamp="orderDetail.close_left_time"
									:show-days="false"
									:color="theme.dzBaseFontColor"
									fontSize="24"
									:separator-color="theme.dzBaseFontColor"
									:bg-color="theme.dzBaseColor"
									@timerEnd="getOrderDetail()"
								></dz-count-down>
							</view>
						</view>
					</view>
					<view class="right">
						<dz-button
							v-if="parseInt(orderDetail.order_status) === 0 || parseInt(orderDetail.order_status) === 202"
							:plain="true"
							size="medium"
							shape="circle"
							:custom-style="{
								background: theme.dzBaseLight,
								borderColor: theme.dzBaseDisabled,
								color: theme.dzBaseColor,
								width: '160rpx',
							}"
							hover-class="none"
							:border="false"
							@click="pay"
						>
							{{ parseInt(orderDetail.order_status) === 0 ? '去支付' : '支付余款' }}
						</dz-button>
						<dz-button
							v-if="parseInt(orderDetail.order_status) === 2 && refundStaus([0, 5, -1, -2, -3])"
							:plain="true"
							size="medium"
							shape="circle"
							:custom-style="{
								background: theme.dzBaseLight,
								borderColor: theme.dzBaseDisabled,
								color: theme.dzBaseColor,
								width: '160rpx',
							}"
							hover-class="none"
							:border="false"
							@click="orderTakeDelivery"
						>
							确定收货
						</dz-button>
						<dz-button
							@click="puy(orderDetail)"
							v-if="
								orderDetail.order_status == 3 ||
								orderDetail.order_status == 4 ||
								(orderDetail.order_status == -4 && !['join_buy'].includes(orderDetail.marketing_type))
							"
							:plain="true"
							size="medium"
							shape="circle"
							:border="false"
							:custom-style="{
								background: theme.dzBaseLight,
								borderColor: theme.dzBaseDisabled,
								color: theme.dzBaseColor,
								width: '160rpx',
							}"
							hover-class="none"
						>
							再次购买
						</dz-button>
					</view>
				</view>
			</view>
			<view class="order-detail">
				<!-- 自提 -->
				<view class="address" v-if="orderDetail.pickup && orderDetail.shipping_type == 2">
					<view class="dzicon-iconfont dzicon-round_location_fill"></view>
					<view class="address-info">
						<view class="title">{{ orderDetail.pickup.name }} {{ orderDetail.pickup.mobile }}</view>
						<view class="address-tip">{{ orderDetail.pickup.address }}</view>
						<view class="icon">自提</view>
					</view>
				</view>
				<!-- 物流配送 -->
				<view class="address" v-else>
					<view class="dzicon-iconfont dzicon-round_location_fill"></view>
					<view>
						<view class="title">{{ orderDetail.receiver_name }} {{ orderDetail.receiver_mobile }}</view>
						<view class="address-tip">{{ orderDetail.receiver_region_name }}{{ orderDetail.receiver_address }}</view>
					</view>
				</view>
				<view class="product">
					<view class="logistics" v-if="shippingStatus()">
						<view class="logistics-l" @tap="toPage('productExpressDetails', orderDetail.id)">
							<view class="logistics-tetle">物流信息</view>
							<view class="courier"></view>
						</view>
						<view class="dzicon-iconfont dzicon-right"></view>
					</view>
					<view class="cell-item">
						<view class="order">
							<dz-tag
								class="dz-m-r-10 order-btn"
								:bg-color="theme.dzBaseColor"
								:color="theme.dzBaseFontColor"
								mode="dark"
								size="mini"
								v-if="isPickupOrder(orderDetail, 1)"
							>
								提货订单
							</dz-tag>
							<view class="order-tetle">订单编号</view>
							<view class="order-num">{{ orderDetail.order_sn }}</view>
						</view>
						<view class="order-btn">
							<dz-button
								:plain="true"
								type="info"
								size="mini"
								shape="circle"
								hoverClass="none"
								:border="false"
								:custom-style="{
									height: '40rpx',
									background: '#FFF',
									lineHeight: '40rpx',
									border: '1rpx solid rgba(0,0,0,0.12)',
								}"
								@click="copy(orderDetail.order_sn)"
							>
								复制
							</dz-button>
						</view>
					</view>
					<block v-for="(item, index) in orderDetail.product" :key="index">
						<view class="order-item" @tap="toProductDetail(item)">
							<view class="left">
								<view class="image"><dz-image :src="item.product_picture" borderRadius="10" width="170" height="170"></dz-image></view>
								<view class="title">
									<view class="name">
										<dz-tag
											class="dz-m-r-10"
											:bg-color="theme.dzBaseColor"
											:border-color="theme.dzBaseColor"
											:color="theme.dzBaseFontColor"
											mode="dark"
											size="mini"
											:show="parseInt(item.gift_flag) > 0 ? true : false"
											:text="language.orderCreate.giveaways"
										></dz-tag>
										{{ item.product_name }}
									</view>
									<view class="sku">{{ item.sku_name || '默认款' }}</view>
									<view class="dz-m-t-10" :style="{ color: theme.dzBaseColor }">
										<text v-if="!isPickupOrder(orderDetail, 1)" class="dz-m-r-4"
											>￥{{ orderDetail.marketing_type == 'combination' ? item.product_original_money : item.price }}</text
										>
										x {{ item.num }}
									</view>
								</view>
							</view>
						</view>
						<view class="btn">
							<view v-if="customerService">
								<dz-button
									:plain="true"
									:open-type="parseInt(serviceType) === 4 ? '' : 'contact'"
									:sessionFrom="sessionFrom"
									type="info"
									shape="circle"
									size="medium"
									hoverClass="none"
									:border="false"
									:custom-style="{
										width: '152rpx',
										height: '56rpx',
										marginLeft: '20rpx',
										marginTop: '20rpx',
										background: '#FFF',
										padding: '0 76rpx',
										lineHeight: '56rpx',
										border: '1rpx solid rgba(0,0,0,0.12)',
									}"
									@tap="serviceTap"
								>
									联系客服
								</dz-button>
							</view>
							<block v-if="parseInt(item.gift_flag) !== 1">
								<view>
									<!-- 订单已支付且没有发货，且没有申请售后，可以直接退款 -->
									<dz-button
										v-if="productRefundMoneyStatus(item)"
										:plain="true"
										type="info"
										size="medium"
										shape="circle"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="orderRefund(item)"
									>
										申请退款
									</dz-button>
								</view>
								<view>
									<!-- 订单已经发货，且没有完成，可以申请退款退货 -->
									<dz-button
										v-if="productRefundStatus(item)"
										:plain="true"
										type="info"
										size="medium"
										shape="circle"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="toRefund(item)"
									>
										售后服务
									</dz-button>
								</view>
								<view>
									<dz-button
										v-if="item.refund_status != 0 || item.customer_refund_status != 0"
										type="info"
										shape="circle"
										size="medium"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="refundDetail('refundDetail', item, index)"
									>
										售后详情
									</dz-button>
								</view>
								<view>
									<dz-button
										v-if="item.refund_status == 1 || item.refund_status == 2 || item.refund_status == 3 || item.refund_status == 4"
										:plain="true"
										type="info"
										shape="circle"
										size="medium"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: item.refund_type == 2 ? '202rpx' : '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="cancelRefund(item.order_status, item.id)"
									>
										{{ parseInt(item.refund_type) === 1 ? '取消退款' : parseInt(item.refund_type) === 2 ? '取消退款退货' : '取消换货' }}
									</dz-button>
								</view>
								<view>
									<dz-button
										v-if="(item.order_status == 2 || item.order_status == 3 || item.order_status == 4) && item.refund_status == 7"
										type="info"
										shape="circle"
										size="medium"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="salesDelivery(item)"
									>
										确认收货
									</dz-button>
								</view>
								<view>
									<dz-button
										v-if="(item.order_status == 2 || item.order_status == 3 || item.order_status == 4) && item.refund_status == 2"
										:plain="true"
										type="info"
										shape="circle"
										size="medium"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="refundDetail('refundShipping', item)"
									>
										填写物流
									</dz-button>
								</view>
								<view>
									<dz-button
										v-if="evaluationButtonStatus(item)"
										type="info"
										shape="circle"
										size="medium"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="toEvaluation(item)"
									>
										去评论
									</dz-button>
								</view>
								<view>
									<dz-button
										v-if="evaluationViewButtonStatus(item)"
										type="info"
										size="medium"
										shape="circle"
										hoverClass="none"
										:border="false"
										:custom-style="{
											width: '152rpx',
											height: '56rpx',
											marginLeft: '20rpx',
											marginTop: '20rpx',
											background: '#FFF',
											padding: '0 76rpx',
											lineHeight: '56rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="toEvaluationDetail(item)"
									>
										查看评论
									</dz-button>
								</view>
							</block>
						</view>
					</block>
				</view>
				<view class="cell-box">
					<dz-cell-item
						center
						title="配送方式"
						:arrow="false"
						:value="filterShippingType(orderDetail.shipping_type)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="orderDetail.payment_explain"
						center
						title="支付方式"
						:arrow="false"
						:value="orderDetail.payment_explain"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						center
						title="快递公司"
						:arrow="false"
						:value="orderDetail.company_name || '等待配送'"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="shopSetting.order_invoice_is_open == 1 && orderDetail.order_status != -4"
						center
						:arrow="false"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					>
						<template #title>
							发票类型
							<text class="dz-m-l-10 dz-color-9">{{
								orderDetail.invoice ? (orderDetail.invoice.type == 1 ? '企业电子发票' : '个人电子发票') : '不开发票'
							}}</text
							><dz-icon name="tip" :color="theme.dzTipsColor" customStyle="padding: 10rpx" @click="invoiceTipClick"></dz-icon>
						</template>
						<template #value>
							<view class="dz-flex dz-row-right dz-col-center">
								<view v-if="!orderDetail.invoice"
									><dz-button
										:plain="true"
										type="info"
										size="mini"
										shape="circle"
										hoverClass="none"
										:border="false"
										:custom-style="{
											height: '40rpx',
											background: '#FFF',
											lineHeight: '40rpx',
											marginLeft: '10rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="invoiceCreate"
									>
										开票
									</dz-button></view
								>
								<view v-if="orderDetail.invoice" class="dz-m-r-10 dz-font-24">
									<text v-if="orderDetail.invoice.state == 0">未开票</text>
									<text v-if="orderDetail.invoice.state == 1">开票中</text>
									<text v-if="orderDetail.invoice.state == 2">已开票</text>
								</view>
								<view v-if="orderDetail.invoice && [0, 1].includes(parseInt(orderDetail.invoice.state))"
									><dz-button
										:plain="true"
										type="info"
										size="mini"
										shape="circle"
										hoverClass="none"
										:border="false"
										:custom-style="{
											height: '40rpx',
											background: '#FFF',
											lineHeight: '40rpx',
											marginLeft: '10rpx',
											border: '1rpx solid rgba(0,0,0,0.12)',
										}"
										@click="invoiceCreate"
									>
										修改抬头
									</dz-button></view
								>
							</view>
						</template>
					</dz-cell-item>
					<dz-cell-item
						v-if="orderDetail.point && parseInt(orderDetail.point) > 0"
						center
						:title="`${shopSetting.point_front_name}抵扣`"
						:arrow="false"
						:value="
							orderDetail.point_money == '0.00'
								? api.formatString(language.order.integralToUse2, orderDetail.point || 0, shopSetting.point_front_name)
								: api.formatString(
										language.order.integralToUse,
										orderDetail.point || 0,
										shopSetting.point_front_name,
										orderDetail.point_money || 0
								  )
						"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
				</view>
				<view class="cell-box">
					<dz-cell-item
						center
						title="下单时间"
						:arrow="false"
						:value="api.timeFormat(orderDetail.created_time)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						center
						title="商品总额"
						:arrow="false"
						:value="api.formatString(language.orderCreate.price, orderDetail.product_original_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						center
						title="运费"
						:arrow="false"
						:value="'+' + api.formatString(language.orderCreate.price, orderDetail.shipping_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						center
						title="发票税费"
						:arrow="false"
						:value="'+' + api.formatString(language.orderCreate.price, orderDetail.tax_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>

					<dz-cell-item
						v-if="getMarketingItem('coupon')"
						center
						title="优惠劵"
						:arrow="false"
						:value="'-' + api.formatString(language.orderCreate.price, getMarketingItem('coupon').discount_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="getMarketingItem('full_give')"
						center
						title="满减送"
						:arrow="false"
						:value="'-' + api.formatString(language.orderCreate.price, getMarketingItem('full_give').discount_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="getMarketingItem('discountt')"
						center
						title="限时折扣"
						:arrow="false"
						:value="'-' + api.formatString(language.orderCreate.price, getMarketingItem('discountt').discount_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="getMarketingItem('limited_buy')"
						center
						title="限量购"
						:arrow="false"
						:value="'-' + api.formatString(language.orderCreate.price, getMarketingItem('limited_buy').discount_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="getMarketingItem('combination')"
						center
						title="组合套餐"
						:arrow="false"
						:value="'-' + api.formatString(language.orderCreate.price, getMarketingItem('combination').discount_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="getMarketingItem('full_mail')"
						center
						title="满包邮"
						:arrow="false"
						:value="getMarketingItem('full_mail').marketing_name"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="getMarketingItem('reduce')"
						center
						title="随机立减"
						:arrow="false"
						:value="'-' + api.formatString(language.orderCreate.price, getMarketingItem('reduce').discount_money)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<dz-cell-item
						v-if="orderDetail.give_point && parseInt(orderDetail.give_point) > 0"
						center
						:title="`赠送${shopSetting.point_front_name}`"
						:arrow="false"
						:value="api.formatString(language.orderCreate.integral, orderDetail.give_point, shopSetting.point_front_name)"
						:customStyle="{ padding: '10rpx 20rpx' }"
						:border-bottom="false"
						hover-class="none"
					></dz-cell-item>
					<view class="dz-m-t-10 dz-p-l-20 dz-p-r-20">
						<view class="dz-border-bottom"></view>
					</view>
					<view class="payMoney">
						<view>实付款</view>
						<view class="price" :style="{ color: theme.dzBaseColor }"><text class="dz-font-24">￥</text>{{ orderDetail.pay_money }}</view>
					</view>
				</view>
			</view>
		</view>
		<view class="dz-ios-p-safe-bottom"></view>
		<view class="footer">
			<view class="footer-bottom">
				<view class="footer-btn dz-row-left" v-if="parseInt(orderDetail.order_status) === -4">
					<view>
						<dz-button
							:custom-style="{
								background: '#FFF',
								border: '1rpx solid rgba(0,0,0,0.12)',
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							mode="info"
							size="medium"
							:border="false"
							shape="circle"
							@click="OrderClose"
						>
							删除订单
						</dz-button>
					</view>
				</view>
				<view class="footer-btn" v-if="parseInt(orderDetail.order_status) === 0" style="margin-left: auto">
					<view>
						<dz-button
							:custom-style="{
								background: '#FFF',
								border: '1rpx solid rgba(0,0,0,0.12)',
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							size="medium"
							:border="false"
							shape="circle"
							@click="orderClose"
						>
							取消订单
						</dz-button>
					</view>
					<view>
						<dz-button
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '160rpx',
							}"
							hover-class="none"
							shape="circle"
							size="medium"
							:border="false"
							@click="pay()"
						>
							去支付
						</dz-button>
					</view>
				</view>
				<view v-if="joinBuyDetailStatus()" class="dz-flex dz-row-right" style="margin-left: auto">
					<view v-if="orderDetail.marketing_type == 'join_buy'">
						<dz-button
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							:border="false"
							size="medium"
							shape="circle"
							@click="toPage('joinBuyDetail', orderDetail.join_buy_id)"
						>
							拼团详情
						</dz-button>
					</view>
					<!-- 砍价详情 -->
					<view v-if="orderDetail.marketing_type == 'haggle'">
						<dz-button
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							:border="false"
							@click="toPage('haggleDetails', orderDetail.marketing_id)"
						>
							砍价详情
						</dz-button>
					</view>
				</view>
				<view v-if="parseInt(orderDetail.pay_status) === 1" class="dz-flex dz-row-right" style="margin-left: auto">
					<view v-if="parseInt(orderDetail.order_status) === 2">
						<dz-button
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							:border="false"
							@click="orderTakeDelivery"
						>
							确认收货
						</dz-button>
					</view>
					<view v-if="(orderStatus(3) || orderStatus(4)) && isEvaluate && (refundStaus(0) || refundStaus(-2) || refundStaus(-3))">
						<dz-button
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							@click="toEvaluation(orderDetail)"
							>去评论</dz-button
						>
					</view>
					<!-- 				<view v-if="(orderDetail.order_status == 3 || orderDetail.order_status == 4) && orderDetail.evaluate_status == 1">
						<dz-button
							type="info"
							size="medium"
							shape="circle"
							:custom-style="{
								background: '#FFF',
								border: '1rpx solid rgba(0,0,0,0.12)',
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							:border="false"
							@click="toEvaluationAllDetail()"
							>查看评论</dz-button
						>
					</view> -->
					<!-- 拼团详情 -->
					<view v-if="orderDetail.marketing_type == 'join_buy'">
						<dz-button
							:custom-style="{
								background: '#FFF',
								border: '1rpx solid rgba(0,0,0,0.12)',
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							:border="false"
							@click="toPage('joinBuyDetail', orderDetail.join_buy_id)"
						>
							拼团详情
						</dz-button>
					</view>
					<!-- 砍价详情 -->
					<view v-if="orderDetail.marketing_type == 'haggle'">
						<dz-button
							:custom-style="{
								background: theme.dzBaseColor,
								color: theme.dzBaseFontColor,
								width: '160rpx',
								marginRight: '20rpx',
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							:border="false"
							@click="toPage('haggleDetails', orderDetail.marketing_id)"
						>
							砍价详情
						</dz-button>
					</view>
					<view v-if="orderDetail.pickup && orderDetail.shipping_type == 2">
						<dz-button
							:custom-style="{
								width: '160rpx',
								marginRight: '20rpx',
								background: '#FFF',
								border: '1rpx solid rgba(0,0,0,0.12)',
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							type="info"
							:border="false"
							@click="getCode()"
						>
							<dz-icon name="qrcode" size="36" customStyle="margin-right: 6rpx"></dz-icon>
							提货码
						</dz-button>
					</view>
					<view>
						<dz-button
							:border="false"
							:custom-style="{
								width: '160rpx',
								background: '#FFF',
								border: '1rpx solid rgba(0,0,0,0.12)',
							}"
							hover-class="none"
							size="medium"
							shape="circle"
							type="info"
							@click="backClick"
						>
							返回
						</dz-button>
					</view>
				</view>
			</view>
		</view>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" @click="getOrderDetail"></dz-page-loading>
		<!-- 确定收货提醒 -->
		<dz-modal
			v-model:show="isShow"
			:mask-close-able="false"
			title="确认收货"
			content="请确定在收到商品后操作哦"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			@cancel="takeDeliveryCancel"
			@confirm="takeDeliveryConfirm"
		></dz-modal>
		<!-- 取消订单提醒 -->
		<dz-modal
			v-model:show="closeShow"
			:mask-close-able="false"
			content="确定要取消该订单"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			@cancel="orderCloseCancel"
			@confirm="orderCloseConfirm"
		></dz-modal>
		<!-- 取消退款提醒 -->
		<dz-modal
			v-model:show="cancelRefundShow"
			:mask-close-able="false"
			content="取消退款后将无法再次提交申请，是否继续取消退款?"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="idShowCancel"
			@cancel="cancelRefundCancel"
			@confirm="cancelRefundConfirm"
		></dz-modal>
		<dz-modal
			v-model:show="salesDeliveryModalShow"
			:mask-close-able="false"
			content="是否确认已经收到货？"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="true"
			@cancel="salesDeliveryCancel"
			@confirm="salesDeliveryConfirm"
		></dz-modal>
		<!-- 提货码 -->
		<dz-popup v-model:show="pickupShow" mode="center" border-radius="30" :closeable="true" width="80%" zIndex="998" :custom-style="{ overflow: 'visible' }">
			<view class="popup-box">
				<image @longpress="long" :src="imgSrc" mode=""></image>
				<view class="tip dz-m-t-20">提货码 {{ orderDetail.pickup_code }}</view>
			</view>
		</dz-popup>
		<canvas class="hideCanvas" canvas-id="qrcode" style="width: 250px; height: 250px" />
		<dz-modal
			v-model:show="downloadShow"
			:mask-close-able="false"
			:confirm-color="theme.dzBaseColor"
			:show-cancel-button="false"
			:async-close="true"
			:content="`正在下载（${downloadText}）`"
			@confirm="downloadCancel"
			:confirm-text="'取消'"
		></dz-modal>
		<dz-modal
			v-model:show="invoiceModalShow"
			:mask-close-able="false"
			title="开票提示"
			:confirm-color="theme.dzBaseColor"
			confirmText="我知道了"
			width="90%"
			@confirm="invoiceConfirm"
		>
			<view class="dz-p-30 dz-font-24">
				<view>根据选择的发票类型不同，开具发票时间提示如下:</view>
				<view class="dz-m-t-20">1.开具发票需要您先进行确认收货。</view>
				<view class="dz-m-t-20">2.电子发票在订单完成后7天内开出，在订单详情中下载和查 看。</view>
				<view class="dz-m-t-20">3.如您下单时未选择开票，180天内，仍可通过订单详情在收货 后重新申请开票。</view>
				<view class="dz-m-t-20">4.退货后原开具发票自动失效，将不能再做为有效票据。</view>
				<view class="dz-m-t-20">5.开具同一发票的多个商品部分退货的，原发票将作废，并重 新开具与实际等额的发票。</view>
				<view class="dz-m-t-20">6.海购商品无法开具国内发票。</view>
			</view>
		</dz-modal>
		<dz-modal
			ref="modalRef"
			v-model:show="invoiceModalCreateShow"
			:mask-close-able="false"
			title="开票"
			:async-close="true"
			:confirm-color="theme.dzBaseColor"
			@confirm="invoiceCreateConfirm"
			:show-cancel-button="invoiceShowCancelButton"
		>
			<dz-field
				label="发票抬头"
				v-model="invoice.title"
				disabled
				placeholder="请选择发票"
				rightIcon="right"
				:border-bottom="false"
				@click="selectInvoice"
			></dz-field>
		</dz-modal>
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, toRefs, getCurrentInstance, unref } from 'vue';
import { onLoad, onUnload, onPageScroll } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';
import uQRCode from '@/core/utils/uqrcode';

const userStore = useUserStore();
const proxy = getCurrentInstance();
const language = uni.$api.language;
const modalRef = ref(null);
const data = reactive({
	serviceType: null,
	orderId: '',
	orderDetail: {},
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	isShow: false,
	scrollTop: 0,
	opacity: 0,
	refundIndex: 0,
	closeShow: false,
	cancelRefundShow: false,
	cancelRefundData: {},
	idShowCancel: true,
	customerService: false, //是否使用客服
	sessionFrom: '',
	salesDeliveryModalShow: false,
	salesDeliveryData: {},
	pickupShow: false,
	imgSrc: '',
	downloadText: '',
	downloadPercent: '',
	downloadShow: false,
	downloadTask: null,
	invoiceModalShow: false,
	invoiceShowCancelButton: true,
	invoiceModalCreateShow: false,
	invoice: {
		title: '',
	},
});

const theme = computed(() => {
	return userStore.getTheme;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const hasLogin = computed(() => {
	return userStore.hasLogin;
});

const wechatMpLogin = computed(() => {
	return userStore.getWechatMpLogin;
});

onLoad(async (options) => {
	await uni.$onLaunched;
	uni.setNavigationBarTitle({
		title: '订单详情',
	});
	data.orderId = options.id;
	data.serviceType = shopSetting.value.app_service_type;
	let serviceType = parseInt(shopSetting.value.app_service_type);
	if (serviceType > 0) {
		if (hasLogin.value) {
			data.sessionFrom =
				'{"source":"' +
				'订单编号：' +
				data.orderDetail.order_sn +
				'","mobile":"' +
				userInfo.value.mobile +
				'","sex":"' +
				userInfo.value.gender +
				'","nickName":"' +
				userInfo.value.nickname +
				'","avatarUrl":"' +
				userInfo.value.head_portrait +
				'"}';
		}
		//2为小程序原生客服，3为芝麻小客服
		if (serviceType === 2) {
			// #ifdef MP-WEIXIN
			data.customerService = true;
			// #endif
		}
		if (serviceType === 3) {
			data.customerService = true;
		}
		if (serviceType === 4) {
			// #ifdef MP-WEIXIN
			data.customerService = true;
			// #endif
			// #ifdef H5
			if (uni.$api.h5IsWechat()) {
				data.customerService = true;
			}
			// #endif
		}
	}

	getOrderDetail();
	uni.$on('refundChange', (data) => {
		data.refundIndex = 0;
		getOrderDetail();
	});
	uni.$on('evaluationStatus', (data) => {
		data.refundIndex = 0;
		getOrderDetail();
	});
	uni.$on('getInvoice', (e) => {
		data.invoice = e;
	});
});

onUnload(() => {
	uni.$off(['refundChange', 'evaluationStatus', 'getInvoice']);
});

onPageScroll((e) => {
	data.scrollTop = e.scrollTop;
});

const navbarStyle = computed(() => {
	let style = {};
	style.opacity = data.opacity;
	return style;
});

// 是否评论
const isEvaluate = computed(() => {
	if (data.orderDetail.product) {
		return data.orderDetail.product.every((item) => item.evaluate_status == 0);
	}
});

function getMarketingItem(type: string) {
	if (!data.orderDetail.marketingDetail || !data.orderDetail.marketingDetail.length) return null;
	return data.orderDetail.marketingDetail.find((item) => item.marketing_type == type);
}

function filterShippingType(value) {
	const data = ['物流配送', '买家自提', '货到付款', '本地配送', '虚拟商品'];
	return data[parseInt(value) - 1];
}

// 订单状态
function orderStatus(val) {
	if (data.orderDetail.product) {
		return data.orderDetail.product.every((item) => parseInt(item.order_status) == val);
	}
}

// 售后状态
function refundStaus(val) {
	if (data.orderDetail.product && val.length > 1) {
		return data.orderDetail.product.every((item) => val.indexOf(parseInt(item.refund_status)) != -1);
	}
}
//拼团状态
function joinBuyStatus() {
	return (
		parseInt(data.orderDetail.order_status) === 101 &&
		data.orderDetail.pay_status == 1 &&
		data.orderDetail.close_left_time &&
		data.orderDetail.close_left_time > 0
	);
}

//拼团超时状态
function joinBuyTimeoutStatus() {
	return (
		parseInt(data.orderDetail.order_status) === 101 &&
		data.orderDetail.pay_status == 1 &&
		data.orderDetail.close_left_time &&
		data.orderDetail.close_left_time < 0
	);
}

//评论状态
function evaluationButtonStatus(item) {
	return (
		(item.order_status == 3 || item.order_status == 4) &&
		item.evaluate_status == 0 &&
		(item.refund_status == 0 || item.refund_status == -2 || item.refund_status == -3)
	);
}

//查看评论状态
function evaluationViewButtonStatus(item) {
	return (
		(item.order_status == 3 || item.order_status == 4) &&
		(item.evaluate_status == 1 || item.evaluate_status == 2) &&
		(item.refund_status == 0 || item.refund_status == -2 || item.refund_status == -3)
	);
}

//拼团详情状态
function joinBuyDetailStatus() {
	return (
		parseInt(data.orderDetail.order_status) === -4 &&
		parseInt(data.orderDetail.pay_status) !== 1 &&
		(data.orderDetail.marketing_type == 'join_buy' || data.orderDetail.marketing_type == 'haggle')
	);
}

//退货状态
function productRefundStatus(item) {
	return (
		(([2, 3, 12].indexOf(parseInt(item.order_status)) !== -1 || (parseInt(item.order_status) === 4 && customerRefundTime())) &&
			parseInt(item.shipping_status) !== 0 &&
			[0, -3].indexOf(parseInt(item.refund_status)) !== -1) ||
		(parseInt(item.refund_status) === -2 && shopSetting.value.order_refund_cancel_reapply == 1)
	);
}

//退款状态
function productRefundMoneyStatus(item) {
	return [1, 12].indexOf(parseInt(item.order_status)) !== -1 && item.shipping_status == 0 && [0, -3].indexOf(parseInt(item.refund_status)) !== -1;
}

//物流状态
function shippingStatus() {
	return [2, 3, 4, 12].indexOf(parseInt(data.orderDetail.order_status)) !== -1 && data.orderDetail.is_virtual != -1 && data.orderDetail.shipping_type == 1;
}

// 提货订单状态
function isPickupOrder(val, state) {
	if (val.product) {
		return val.product.every((item) => parseInt(item.warehouse_is_pickup) === state);
	}
}

function opacityChange(e) {
	data.opacity = e.opacity;
}

function orderStatusFilter(status) {
	let state;
	uni.$api.dataConfig.orderStatus.forEach((orderItem) => {
		if (orderItem.key === parseInt(status)) {
			state = orderItem.value;
			if (data.orderDetail.shipping_type == 2) {
				switch (parseInt(status)) {
					case 1:
						state = '待提货';
						break;
					case 2:
						state = '已提货';
						break;
					case 3:
						state = '已提货';
						break;
				}
			}
		}
	});
	return state;
}

async function getOrderDetail() {
	data.pageLoadingShow = true;
	await uni.$api.http
		.get(uni.$api.apiMember.orderView, {
			params: {
				id: data.orderId,
			},
		})
		.then((res) => {
			data.orderDetail = res.data;
			if (res.data.invoice) {
				data.invoice = res.data.invoice;
			}
			if (data.orderDetail.product) {
				data.refundIndex = data.orderDetail.product.filter(
					(item) =>
						parseInt(item.refund_status) &&
						parseInt(item.refund_status) !== -1 &&
						parseInt(item.refund_status) !== -2 &&
						parseInt(item.refund_status) !== -3 &&
						parseInt(item.refund_status) !== 5
				).length;
			}
			setTimeout(() => {
				data.pageLoadingShow = false;
			}, 100);
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});
}

function saveImg() {
	// #ifndef H5
	//如果是在线图片，下载并保存
	if (uni.$api.isUrl(data.imgSrc)) {
		data.downloadPercent = 0;
		data.downloadText = data.downloadPercent + '%';
		data.downloadShow = true;
		data.downloadTask = uni.downloadFile({
			url: data.imgSrc,
			success: (res) => {
				if (res.statusCode === 200) {
					uni.saveImageToPhotosAlbum({
						filePath: res.tempFilePath,
						success: () => {
							uni.$api.toast('已下载到您的手机相册');
							data.downloadShow = false;
						},
						fail: () => {
							uni.$api.toast('保存失败，请重试');
							data.downloadShow = false;
						},
					});
				}
			},
			fail: () => {
				uni.$api.toast('下载失败，请重试');
				data.downloadShow = false;
			},
		});

		data.downloadTask.onProgressUpdate((res) => {
			data.downloadPercent = res.progress;
			data.downloadText = res.progress + '%';
		});
	} else {
		uni.saveImageToPhotosAlbum({
			filePath: data.imgSrc,
			success() {
				uni.$api.toast('已保存到您的手机相册');
			},
		});
	}
	// #endif
	// #ifdef H5
	uni.$api.toast('请长按松开后选择另存为保存到相册');
	// #endif
}

function long() {
	// #ifndef H5
	uni.saveImageToPhotosAlbum({
		filePath: data.imgSrc,
		success() {
			uni.$api.toast('保存成功');
		},
	});
	// #endif
	// #ifdef H5
	uni.$api.toast('请长按松开后选择另存为保存到相册');
	// #endif
}

function downloadCancel() {
	try {
		data.downloadTask.abort();
	} finally {
		data.downloadShow = false;
	}
}

function invoiceTipClick() {
	data.invoiceModalShow = true;
}

function invoiceConfirm() {
	data.invoiceModalShow = false;
}

function invoiceCreate() {
	data.invoiceModalCreateShow = true;
}

function selectInvoice() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.invoice,
		query: {
			source: 'orderCreate',
		},
	});
}

async function invoiceCreateConfirm() {
	if (data.invoice && !data.invoice.id) {
		data.invoiceShowCancelButton = true;
		unref(modalRef)?.clearLoading();
		uni.$api.toast('请选择发票');
		return;
	}
	data.invoiceShowCancelButton = false;
	await uni.$api.http
		.post(uni.$api.apiMember.orderInvoiceCreate, {
			member_id: userInfo.value.id,
			order_id: data.orderId,
			invoice_id: data.invoice.id,
		})
		.then(() => {
			getOrderDetail();
		})
		.finally(() => {
			data.invoiceModalCreateShow = false;
			data.invoiceShowCancelButton = true;
		});
}
// 复制
function copy(val) {
	uni.$api.copy(val);
	uni.$api.toast('订单号已复制到剪贴板');
}

// 查看物流/拼团/砍价
function toPage(url, id) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			id,
		},
	});
}

// 确定收货
function orderTakeDelivery(item, index) {
	data.isShow = true;
}

// 取消收货
function takeDeliveryCancel() {
	data.isShow = false;
}

// 确认收货
async function takeDeliveryConfirm() {
	await uni.$api.http
		.get(uni.$api.apiMember.orderTakeDelivery, {
			params: {
				id: data.orderId,
			},
		})
		.then(() => {
			data.isShow = false;
			uni.$emit('orderChange', {});
			getOrderDetail();
		});
}

// 删除订单
async function OrderClose() {
	await uni.$api.http
		.delete(
			uni.$api.apiShop.orderDelete,
			{},
			{
				params: {
					id: this.orderId,
				},
			}
		)
		.then(() => {
			uni.$api.toast('订单删除成功');
			uni.$emit('orderChange', { id: data.orderId });
			setTimeout(() => {
				uni.$api.router.back();
			}, 500);
		});
}

async function getCode() {
	data.imgSrc = await getQrcode();
	if (!data.imgSrc) return uni.$api.toast('生成二维码失败');
	data.pickupShow = true;
}

async function getQrcode() {
	return new Promise((resolve, reject) => {
		uQRCode.make({
			canvasId: 'qrcode',
			componentInstance: proxy,
			text: `pickup-${data.orderDetail.pickup_code}`,
			size: 250,
			margin: 10,
			backgroundColor: '#ffffff',
			foregroundColor: '#000000',
			fileType: 'jpg',
			correctLevel: uQRCode.defaults.correctLevel,
			success: (res) => {
				resolve(res);
			},
			fail: (res) => {
				reject(res);
			},
		});
	});
}

// 商品详情
function toProductDetail(item) {
	if (parseInt(item.product_status) == 0) return uni.$api.toast(uni.$api.language.user.productTheShelves);
	let url;
	const params = {
		id: item.product_id,
	};
	if (data.orderDetail.marketing_type && ['join_buy', 'limited_buy', 'haggle', 'discount'].includes(data.orderDetail.marketing_type)) {
		if (data.orderDetail.marketing_type == 'discount') {
			params.marketing_id = data.orderDetail.marketing_id;
		}
		url = uni.$api.dataConfig.marketingType[data.orderDetail.marketing_type].path;
	} else {
		url = 'product';
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: params,
	});
}

// 去评论
function toEvaluation(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.evaluation,
		query: {
			data: JSON.stringify(item),
		},
	});
}

function toEvaluationAllDetail() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.evaluationIndex,
		query: {
			id: data.orderId,
		},
	});
}

// 查看单个评论
function toEvaluationDetail(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.evaluationDetail,
		query: {
			order_id: item.order_id,
			product_id: item.id,
		},
	});
}

// 售后服务(未完成订单)
function toRefund(item) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.refundIndex,
		query: {
			id: item.id,
			order_id: item.order_id,
		},
	});
}

function orderRefund(item) {
	const params = {
		id: item.id,
		warehouse_is_pickup: item.warehouse_is_pickup ? item.warehouse_is_pickup : null,
		num: item.num,
		order_id: item.order_id,
		product_money: item.product_money,
	};
	// #ifdef MP
	if (wechatMpLogin.value && shopSetting.value.notify_miniprogram_sub && shopSetting.value.notify_miniprogram_sub.order_refund_audit) {
		wx.requestSubscribeMessage({
			tmplIds: [
				shopSetting.value.notify_miniprogram_sub.order_refund_audit, //   退款审核结果通知
			],
			success: () => {
				uni.$api.router.push({
					route: uni.$api.routesConfig.orderRefundApply,
					query: {
						data: JSON.stringify(params),
						shipping_money: data.orderDetail.shipping_money,
					},
				});
				return;
			},
			fail: () => {
				uni.$api.router.push({
					route: uni.$api.routesConfig.orderRefundApply,
					query: {
						data: JSON.stringify(params),
						shipping_money: data.orderDetail.shipping_money,
					},
				});
				return;
			},
		});
	} else {
		uni.$api.router.push({
			route: uni.$api.routesConfig.orderRefundApply,
			query: {
				data: JSON.stringify(params),
				shipping_money: data.orderDetail.shipping_money,
			},
		});
	}
	// #endif
	// #ifndef MP
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderRefundApply,
		query: {
			data: JSON.stringify(params),
			shipping_money: data.orderDetail.shipping_money,
		},
	});
	// #endif
}

// 再次去购买
function puy(item) {
	let data = {};
	data.type = 'buy_again';
	data.buy_again_id = item.id;
	data.data = 'buy_again';
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(data)),
		},
	});
}

// 退款详情
function refundDetail(url, item) {
	const params = {
		id: item.id,
		order_id: item.order_id,
		order_status: item.order_status,
	};
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: {
			...params,
			shipping_money: data.orderDetail.shipping_money,
		},
	});
}

// 取消退款
function cancelRefund(status, id) {
	data.cancelRefundData = { status, id };
	data.cancelRefundShow = true;
}

function cancelRefundCancel() {
	data.cancelRefundShow = false;
}

async function cancelRefundConfirm() {
	data.idShowCancel = false;
	let api = uni.$api.apiMember.orderProductRefundClose;
	if (parseInt(data.cancelRefundData.status) == 4) {
		api = uni.$api.apiMember.orderCustomerClose;
	}
	await uni.$api.http
		.post(api, {
			id: data.cancelRefundData.id,
		})
		.then(() => {
			getOrderDetail();
			data.cancelRefundShow = false;
			uni.$emit('orderChange', {});
		})
		.catch(() => {
			data.cancelRefundShow = false;
		});
}

// 取消订单
function orderClose() {
	data.closeShow = true;
}

// 取消订单
function orderCloseCancel() {
	data.closeShow = false;
}

// 取消订单确认
async function orderCloseConfirm() {
	await uni.$api.http
		.get(uni.$api.apiMember.orderClose, {
			params: {
				id: data.orderId,
			},
		})
		.then(() => {
			getOrderDetail();
			data.closeShow = false;
			uni.$emit('orderChange', {});
		});
}

// 去支付
function pay() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.pay,
		query: {
			id: data.orderId,
		},
	});
}

// 超时
function timeout(index) {
	data.orderDetail[index].close_left_time = -1;
	data.orderDetail[index].order_status = -4;
}

function backClick() {
	uni.$api.router.back();
}

function serviceTap() {
	let serviceType = parseInt(shopSetting.value.app_service_type);
	if (serviceType === 2) {
		//微信原生小程序客服
		// #ifndef MP-WEIXIN
		uni.$api.toast('请在小程序中打开客服');
		// #endif
	} else if (serviceType === 3) {
		//芝麻小客服
		// #ifndef MP-WEIXIN
		let customerServiceUrl = shopSetting.value.app_service_zmxkf_url;
		if (!customerServiceUrl) {
			uni.$api.toast('客服暂未配置');
			return;
		}
		if (hasLogin.value) {
			let params = {
				source: encodeURIComponent('订单编号：' + data.orderDetail.order_sn),
				openid: userInfo.value.id,
				mobile: userInfo.value.mobile,
				sex: userInfo.value.gender,
				nickName: encodeURIComponent(userInfo.value.nickname),
				avatarUrl: encodeURIComponent(userInfo.value.head_portrait),
			};

			customerServiceUrl = uni.$api.objParseUrlAndParam(customerServiceUrl, params);
			uni.$api.shop.clearCustomerServiceRead();
			uni.$api.router.push({
				route: uni.$api.routesConfig.webview,
				query: {
					url: uni.$api.strEncode(customerServiceUrl),
				},
			});
		} else {
			//要求先登录
			uni.$api.router.push({
				route: uni.$api.routesConfig.login,
			});
		}
		// #endif
	} else if (serviceType == 4) {
		//企业微信客服
		let customerServiceUrl = shopSetting.value.app_service_wxkf_url;
		let corpId = shopSetting.value.app_service_wxkf_id;
		if (!customerServiceUrl || !corpId) {
			uni.$api.toast('客服暂未配置');
			return;
		}
		// #ifdef MP-WEIXIN
		wx.openCustomerServiceChat({
			extInfo: { url: customerServiceUrl },
			corpId,
			fail() {
				uni.$api.toast('启用微信客服失败');
			},
		});
		// #endif
		// #ifdef H5
		if (uni.$api.h5IsWechat()) {
			window.location.href = customerServiceUrl;
		}
		window.open(customerServiceUrl);
		// #endif
		// #ifdef APP-PLUS
		plus.runtime.openURL(customerServiceUrl);
		// #endif
	}
}

function salesDelivery(item) {
	data.salesDeliveryData = item;
	data.salesDeliveryModalShow = true;
}

function salesDeliveryCancel() {
	data.salesDeliveryModalShow = false;
}

function salesDeliveryConfirm() {
	salesDeliverySubmit();
}

async function salesDeliverySubmit() {
	await uni.$api.http
		.post(data.salesDeliveryData.order_status == 4 ? uni.$api.apiMember.orderCustomerSalesDelivery : uni.$api.apiMember.orderProductRefundSalesDelivery, {
			id: data.salesDeliveryData.id,
		})
		.then(() => {
			data.salesDeliveryModalShow = false;
			uni.$api.toast('提交成功');
			getOrderDetail();
		});
}

function customerRefundTime() {
	if (!data.orderDetail.after_sale_date || data.orderDetail.after_sale_date == '') {
		return true;
	}
	return (Date.now() / 1000).toFixed(0) < parseInt(data.orderDetail.after_sale_date) + parseInt(data.orderDetail.finish_time);
}

const {
	scrollTop,
	orderDetail,
	pageLoadingShow,
	pageLoadingStatus,
	refundIndex,
	customerService,
	serviceType,
	sessionFrom,
	isShow,
	downloadText,
	closeShow,
	cancelRefundShow,
	idShowCancel,
	salesDeliveryModalShow,
	pickupShow,
	downloadShow,
	invoiceModalShow,
	invoiceModalCreateShow,
	invoiceShowCancelButton,
	invoice,
	imgSrc,
} = {
	...toRefs(data),
};
</script>

<style lang="scss">
.content {
	padding-bottom: 115rpx;
}
.status {
	width: 100%;
	height: 260rpx;
}
.status-box {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 50rpx 20rpx 20rpx;
	.left {
		.icon-size {
			font-size: 96rpx;
		}
		display: flex;
		align-items: center;
		.tip {
			margin-left: 20rpx;
			.pay {
				font-size: 36rpx;
				font-weight: bold;
			}
			.msg {
				font-size: 24rpx;
			}
		}
	}
}
.order-detail {
	padding: 0 20rpx;
}
.address {
	display: flex;
	align-items: center;
	position: relative;
	overflow: hidden;
	padding: 20rpx;
	margin-top: -60rpx;
	background-color: #fff;
	border-radius: 20rpx;
	.dzicon-round_location_fill {
		font-size: 72rpx;
		margin-right: 20rpx;
	}
	.title {
		font-size: 32rpx;
		color: $dz-main-color;
		line-height: 54rpx;
	}
	.address-tip {
		margin: 6rpx 0;
		font-size: 28rpx;
		color: $dz-tips-color;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.icon {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		top: 0;
		right: 0;
		height: 35rpx;
		width: 70rpx;
		font-size: 24rpx;
		color: #ffffff;
		background-color: $dz-type-warning;
		border-radius: 0 0 0 15rpx;
	}
}
.product {
	margin: 20rpx 0;
	padding: 20rpx;
	border-radius: 20rpx;
	background-color: #ffffff;
	.logistics {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
		.logistics-l {
			flex: 1;
			display: flex;
			align-items: center;
			.logistics-tetle {
				font-size: 28rpx;
				color: $dz-content-color;
				margin-right: 20rpx;
			}
			.courier {
				width: 500rpx;
				font-size: 28rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				margin-right: 10rpx;
				color: #dea32c;
			}
		}
		.dzicon-right {
			flex-shrink: 0;
		}
	}
	.cell-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		.order {
			flex: 1;
			display: flex;
			align-items: center;
			.order-tetle {
				width: 120rpx;
				font-size: 26rpx;
				color: $dz-content-color;
				margin-right: 8rpx;
			}
			.order-num {
				width: 360rpx;
				font-size: 26rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				color: $dz-tips-color;
			}
		}
		.order-btn {
			flex-shrink: 0;
		}
	}
	.order-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		.left {
			display: flex;
			.image {
				flex-shrink: 0;
				width: 170rpx;
				height: 170rpx;
				border-radius: 10rpx;
				background-color: $dz-bg-color;
			}
			.title {
				margin-left: 20rpx;
				.name {
					line-height: 40rpx;
					color: $dz-main-color;
					font-size: 28rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
				}
				.sku {
					margin-top: 10rpx;
					font-size: 24rpx;
					color: $dz-content-color;
				}
			}
		}

		.right {
			.price-box {
				margin-left: 10rpx;
				text-align: right;
				font-size: 24rpx;
				color: $dz-tips-color;
			}
		}
	}
	.btn {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		margin-bottom: 40rpx;
	}
	.btn:last-child {
		margin-bottom: 0;
	}
}
.cell-box {
	padding: 10rpx 0rpx;
	margin-bottom: 20rpx;
	background-color: #ffffff;
	border-radius: 20rpx;
	.payMoney {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		padding: 25rpx 0rpx 15rpx;
		font-size: 32rpx;
		.price {
			display: flex;
			align-items: center;
			margin: 0 20rpx;
			font-size: 34rpx;
			font-weight: bold;
		}
	}
}
.footer {
	position: fixed;
	bottom: 0;
	z-index: 2;
	width: 100%;
	background-color: #fff;
	.footer-bottom {
		width: 100%;
		height: 110rpx;
		padding: 0 20rpx;
		display: flex;
		// justify-content: flex-end;
		align-items: center;
		margin-bottom: env(safe-area-inset-bottom);
	}
	.text {
		font-size: 28rpx;
		color: $dz-content-color;
	}

	.footer-btn {
		display: flex;
		// justify-content: flex-end;
	}
}
.popup-box {
	text-align: center;
	image {
		border: none;
		border-radius: 0;
		width: 300rpx;
		height: 300rpx;
		margin-top: 90rpx;
	}

	.tip {
		padding-bottom: 90rpx;
		color: #909993;
		-webkit-user-select: text;
	}
}
.hideCanvas {
	position: fixed;
	top: -999px;
	left: -999px;
	z-index: -99;
}
</style>

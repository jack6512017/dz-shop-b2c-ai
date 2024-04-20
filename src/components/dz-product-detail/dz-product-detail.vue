<template>
	<view class="container">
		<!--header-->
		<view
			class="dz-header-box"
			:class="{ 'dz-bar-line': opcity > 0.85 }"
			:style="{
				height: height + 'px',
				background: 'rgba(255,255,255,' + opcity + ')',
			}"
		>
			<view class="dz-header" :style="{ paddingTop: top + 'px', opacity: opcity }">
				<view class="dz-title">
					<dz-tabs
						:list="tabList"
						:current="current"
						:scrollable="false"
						lineHeight="4"
						:activeStyle="{
							color: theme.dzBaseColor,
							fontWeight: 'bold',
						}"
						bgColor="transpare"
						:lineColor="theme.dzBaseColor"
						@change="tabChange"
					></dz-tabs>
				</view>
			</view>
			<view class="dz-header-icon" :style="{ paddingTop: top + 'px' }">
				<view
					class="dz-icon-box"
					:style="{
						backgroundColor: opcity < 1 ? 'rgba(0, 0, 0, 0.5)' : '',
					}"
					@tap="backClick(1)"
				>
					<dz-icon name="back_light" :size="36" :color="opcity < 1 ? '#fff' : ''"></dz-icon>
				</view>
				<button v-if="showShare && shopSetting.product_poster_is_open != 1" class="dz-transparent-btn" open-type="share" @tap.stop="shareClick">
					<view
						class="dz-icon-box dz-icon-ml"
						:style="{
							backgroundColor: opcity < 1 ? 'rgba(0, 0, 0, 0.5)' : '',
						}"
						@tap.stop="shareClick"
					>
						<dz-icon name="forward" :size="32" :color="opcity < 1 ? '#fff' : ''"></dz-icon>
					</view>
				</button>
				<view
					v-if="showShare && shopSetting.product_poster_is_open == 1"
					class="dz-icon-box dz-icon-ml"
					:style="{
						backgroundColor: opcity < 1 ? 'rgba(0, 0, 0, 0.5)' : '',
					}"
					@tap.stop="shareClick"
				>
					<dz-icon name="forward" :size="32" :color="opcity < 1 ? '#fff' : ''"></dz-icon>
				</view>
			</view>
		</view>
		<!--header-->
		<!--banner-->
		<view class="dz-banner-swiper">
			<swiper :autoplay="false" :interval="5000" :duration="150" :circular="true" :style="{ height: scrollH + 'px' }" @change="bannerChange">
				<!--H5和小程序直接播放视频-->
				<!-- #ifndef APP-PLUS -->
				<block v-if="product.video_url">
					<swiper-item>
						<video
							id="productVedio"
							ref="videoRef"
							:style="{ width: '100%', height: scrollH + 'px' }"
							:src="product.video_url"
							:poster="product.covers[0]"
							object-fit="cover"
							autoplay
							vslide-gesture
							page-gesture
							enable-play-gesture
							controls
							:enable-progress-gesture="false"
							@ended="videoEnded"
						></video>
					</swiper-item>
				</block>
				<!-- #endif -->
				<block v-for="(item, index) in product.covers" :key="index">
					<swiper-item :data-index="index" @tap.stop="previewBanner">
						<image :src="item" mode="aspectFit" class="dz-slide-image" :style="{ height: scrollH + 'px' }" />
					</swiper-item>
				</block>
			</swiper>
			<!--APP做视频跳转-->
			<!-- #ifdef APP-PLUS -->
			<view v-if="product.video_url" class="dz-video__box" @tap.stop="vedioPlay">
				<image :src="assets.videoPlayer" mode="widthFix"></image>
				<view>{{ language.product.productVedio }}</view>
			</view>
			<!-- #endif -->
			<!--指示器-->
			<view class="dz-banner-tag" v-if="bannerLength > 1 && (product.video_url ? bannerIndex > 0 : true)">
				<dz-tag type="info" shape="circle" mode="dark" bg-color="rgba(0, 0, 0, 0.5)" border-color="rgba(0, 0, 0, 0.5)" :color="theme.dzBaseFontColor">
					{{ bannerIndex + 1 }}/{{ bannerLength }}
				</dz-tag>
			</view>
		</view>
		<!--banner-->

		<!--属性-->
		<view class="dz-pro-detail">
			<view class="dz-product-title dz-border-radius">
				<!--直接购买-->
				<block v-if="isBuyMode || product.marketing_type == ''">
					<!--预售商品-->
					<block v-if="parseInt(product.is_open_presell) === 1">
						<view class="dz-marketing-price">
							<view
								class="dz-marketing-pricebox dz-marketing-presale dz-padding"
								:style="{
									background: 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')',
									color: theme.dzBaseFontColor,
								}"
							>
								<view class="dz-marketing-pro-price">
									<view>
										<text>{{ language.application.moneySymbol }}</text>
										<text class="dz-price">{{ currentProductPrice }}</text>
									</view>
									<view class="dz-marketing-original-price" v-if="product.market_price > product.price">
										{{ language.application.moneySymbol }}{{ product.market_price }}
									</view>
								</view>
								<view class="dz-marketing-sold">
									<text>
										{{
											parseInt(product.presell_delivery_type) === 1
												? api.formatString(language.product.preSaleDeliverTime, api.timeFormat(product.presell_time, 'yyyy-mm-dd'))
												: api.formatString(language.product.preSaleDeliverDay, product.presell_day)
										}}
									</text>
									<view class="dz-marketing-tag">
										<dz-tag
											class="dz-m-l-10"
											size="mini"
											mode="plain"
											bg-color="transparent"
											:border-color="theme.dzBaseFontColor"
											:color="theme.dzBaseFontColor"
										>
											{{ language.product.preSaleProduct }}
										</dz-tag>
									</view>
								</view>
							</view>
						</view>
					</block>
					<!--非预售产品-->
					<block v-else>
						<view class="dz-pro-pricebox dz-padding" :style="{ color: theme.dzBaseColor }">
							<view class="dz-pro-price">
								<view v-if="parseInt(product.point_exchange_type) === 0 || parseInt(product.point_exchange_type) === 1">
									<text>{{ language.application.moneySymbol }}</text>
									<text class="dz-price price">{{ currentProductPrice }}</text>
								</view>
								<view v-else-if="parseInt(product.point_exchange_type) === 2">
									<text>{{ language.application.moneySymbol }}</text>
									<text class="dz-price">{{ currentProductPrice }}</text>
									<text class="dz-m-l-10 dz-m-r-10">{{ language.application.and }}</text>
									<text class="dz-price">{{ product.point_exchange }}</text>
									<text>{{ api.formatString(language.product.point, shopSetting.point_front_name) }}</text>
								</view>
								<view v-else-if="parseInt(product.point_exchange_type) === 3">
									<text>{{ language.application.moneySymbol }}</text>
									<text class="dz-price">{{ currentProductPrice }}</text>
									<text class="dz-m-l-10 dz-m-r-10">{{ language.application.or }}</text>
									<text class="dz-price">{{ product.point_exchange }}</text>
									<text>{{ api.formatString(language.product.point, shopSetting.point_front_name) }}</text>
								</view>
								<view v-if="parseInt(product.point_exchange_type) === 4">
									<text class="dz-price">{{ product.point_exchange }}</text>
									<text>{{ api.formatString(language.product.point, shopSetting.point_front_name) }}</text>
								</view>
							</view>
							<view class="dz-collection dz-size" @tap="collectClick">
								<dz-icon
									:name="collected ? 'likefill' : 'like'"
									:color="collected ? theme.dzBaseColor : theme.dzMainColor"
									:size="40"
								></dz-icon>
								<view class="dz-scale-collection" :style="{ color: collected ? theme.dzBaseColor : '' }" :class="{ 'dz-icon-dark': collected }">
									{{ language.product.collect }}
								</view>
							</view>
						</view>
						<view class="dz-original-price dz-gray" v-if="product.market_price > product.price">
							<text class="dz-line-through"
								>{{ language.product.marketPriceInfo }} {{ language.application.moneySymbol }}{{ product.market_price }}</text
							>
						</view>
					</block>
				</block>

				<!--营销模式-->
				<block v-else>
					<!--砍价-->
					<block v-if="product.marketing_type == 'haggle'">
						<view class="dz-marketing-price">
							<view
								class="dz-marketing-pricebox dz-marketing-left dz-padding"
								:style="{
									background: 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')',
									color: theme.dzBaseFontColor,
								}"
							>
								<view class="dz-marketing-pro-price">
									<view>
										<text>{{ language.application.moneySymbol }}</text>
										<text class="dz-price">{{ marketingPrice }}</text>
									</view>
									<view class="dz-marketing-original-price" v-if="marketingMarketPrice > marketingPrice">
										{{ language.application.moneySymbol }}{{ marketingMarketPrice }}
									</view>
								</view>
								<view class="dz-marketing-sold">
									<text>
										{{ language.product.inviteBargain }} {{ language.application.moneySymbol
										}}{{ api.toFixed(marketingPrice - (1 - api.toFloat(product.marketing.min_rate / 100)) * marketingPrice, 2) }}
									</text>
									<view class="dz-marketing-tag">
										<dz-tag
											class="dz-m-l-10"
											size="mini"
											mode="plain"
											bg-color="transparent"
											:border-color="theme.dzBaseFontColor"
											:color="theme.dzBaseFontColor"
										>
											{{ language.product.marketingBargain }}
										</dz-tag>
									</view>
								</view>
							</view>
							<view class="dz-marketing-right" :style="{ background: theme.dzBaseLight }">
								<dz-button
									v-if="parseInt(product.marketing.state) === 2"
									:disabled="true"
									:border="false"
									:customStyle="{ background: theme.dzBaseLight, color: theme.dzBaseFontColor }"
								>
									{{ language.product.marketingFinished }}
								</dz-button>
								<text class="dz-base-color" v-if="parseInt(product.marketing.state) === 0">{{ language.product.marketingStart }}</text>
								<dz-count-down
									v-if="parseInt(product.marketing.state) === 0"
									:timestamp="product.marketing.start_time_left"
									:show-border="true"
									:color="theme.dzBaseFontColor"
									:separator-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:bg-color="theme.dzBaseColor"
									font-size="20"
									@timeEnd="marketingStart"
								></dz-count-down>
								<text class="dz-base-color" v-if="parseInt(product.marketing.state) === 1">{{ language.product.marketingFinish }}</text>
								<dz-count-down
									v-if="parseInt(product.marketing.state) === 1"
									:timestamp="product.marketing.end_time_left"
									:show-border="true"
									:color="theme.dzBaseFontColor"
									:separator-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:bg-color="theme.dzBaseColor"
									font-size="20"
									@timeEnd="marketingEnd"
								></dz-count-down>
							</view>
						</view>
					</block>
					<!--限时折扣-->
					<block v-else-if="product.marketing_type == 'discount'">
						<view class="dz-marketing-price">
							<view
								class="dz-marketing-pricebox dz-marketing-left dz-padding"
								:style="{
									background: 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')',
									color: theme.dzBaseFontColor,
								}"
							>
								<view class="dz-marketing-pro-price">
									<view>
										<text>{{ language.application.moneySymbol }}</text>
										<text class="dz-price">{{ currentProductPrice }}</text>
									</view>
									<view class="dz-marketing-original-price" v-if="product.price"
										>{{ language.application.moneySymbol }}{{ product.price }}</view
									>
								</view>
								<view class="dz-marketing-sold">
									<text>
										{{ language.product.marketingDiscountTip
										}}{{ api.formatString(language.product.marketingDiscountInfo, product.marketing.discount) }}
									</text>
									<view class="dz-marketing-tag">
										<dz-tag
											class="dz-m-l-10"
											size="mini"
											mode="plain"
											bg-color="transparent"
											:border-color="theme.dzBaseFontColor"
											:color="theme.dzBaseFontColor"
										>
											{{ language.product.marketingDiscount }}
										</dz-tag>
									</view>
								</view>
							</view>
							<view class="dz-marketing-right" :style="{ background: theme.dzBaseLight }">
								<dz-button v-if="parseInt(product.marketing.state) === 2" type="info" size="medium" :disabled="true">
									{{ language.product.marketingFinished }}
								</dz-button>
								<text class="dz-base-color" v-if="parseInt(product.marketing.state) === 0">{{ language.product.marketingStart }}</text>
								<dz-count-down
									v-if="parseInt(product.marketing.state) === 0"
									:timestamp="product.marketing.start_time_left"
									:show-border="true"
									:color="theme.dzBaseFontColor"
									:separator-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:bg-color="theme.dzBaseColor"
									font-size="20"
									@timeEnd="marketingStart"
								></dz-count-down>
								<text class="dz-base-color" v-if="parseInt(product.marketing.state) === 1">{{ language.product.marketingFinish }}</text>
								<dz-count-down
									v-if="parseInt(product.marketing.state) === 1"
									:timestamp="product.marketing.end_time_left"
									:show-border="true"
									:color="theme.dzBaseFontColor"
									:separator-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:bg-color="theme.dzBaseColor"
									font-size="20"
									@timeEnd="marketingEnd"
								></dz-count-down>
							</view>
						</view>
					</block>
					<!--限量购-->
					<block v-else-if="product.marketing_type == 'limited_buy'">
						<view class="dz-marketing-price">
							<view
								class="dz-marketing-pricebox dz-marketing-left dz-padding"
								:style="{
									background: 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')',
									color: theme.dzBaseFontColor,
								}"
							>
								<view class="dz-marketing-pro-price">
									<view>
										<text>{{ language.application.moneySymbol }}</text>
										<text class="dz-price">{{ currentProductPrice }}</text>
									</view>
									<view class="dz-marketing-original-price" v-if="product.market_price > product.price">
										{{ language.application.moneySymbol }}{{ product.market_price }}
									</view>
								</view>
								<view class="dz-marketing-sold">
									<text>
										{{
											product.marketing.remark
												? product.marketing.remark
												: api.formatString(
														language.product.marketingLimitedBuyInfo,
														product.marketing.min_num,
														product.marketing.max_num
												  )
										}}
									</text>
									<view class="dz-marketing-tag">
										<dz-tag
											class="dz-m-l-10"
											size="mini"
											mode="plain"
											bg-color="transparent"
											:border-color="theme.dzBaseFontColor"
											:color="theme.dzBaseFontColor"
										>
											{{ language.product.marketingLimitedBuy }}
										</dz-tag>
									</view>
								</view>
							</view>
							<view class="dz-marketing-right" :style="{ background: theme.dzBaseLight }">
								<dz-button
									v-if="parseInt(product.marketing.state) === 2"
									:border="false"
									:customStyle="{ background: theme.dzBaseLight, color: theme.dzBaseFontColor }"
									:disabled="true"
								>
									{{ language.product.marketingFinished }}
								</dz-button>
								<text class="dz-base-color" v-if="parseInt(product.marketing.state) === 0">{{ language.product.marketingStart }}</text>
								<dz-count-down
									v-if="parseInt(product.marketing.state) === 0"
									:timestamp="product.marketing.start_time_left"
									:show-border="true"
									:color="theme.dzBaseFontColor"
									:separator-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:bg-color="theme.dzBaseColor"
									font-size="20"
									@timeEnd="marketingStart"
								></dz-count-down>
								<text class="dz-base-color" v-if="parseInt(product.marketing.state) === 1">{{ language.product.marketingFinish }}</text>
								<dz-count-down
									v-if="parseInt(product.marketing.state) === 1"
									:timestamp="product.marketing.end_time_left"
									:show-border="true"
									:color="theme.dzBaseFontColor"
									:separator-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:bg-color="theme.dzBaseColor"
									font-size="20"
									@timeEnd="marketingEnd"
								></dz-count-down>
							</view>
						</view>
					</block>
					<!--拼团-->
					<block v-else-if="product.marketing_type == 'join_buy'">
						<view class="dz-marketing-price">
							<view
								class="dz-marketing-pricebox dz-marketing-presale dz-padding"
								:style="{
									background: 'linear-gradient(30deg, ' + theme.dzBaseDark + ', ' + theme.dzBaseColor + ')',
									color: theme.dzBaseFontColor,
								}"
							>
								<view class="dz-marketing-pro-price">
									<view>
										<text>{{ language.application.moneySymbol }}</text>
										<text class="dz-price">{{ currentProductPrice }}</text>
									</view>
									<view class="dz-marketing-original-price" v-if="product.market_price > product.price">
										{{ language.application.moneySymbol }}{{ product.market_price }}
									</view>
								</view>
								<view class="dz-marketing-sold">
									<view style="width: 90%">
										<dz-tag
											class="dz-m-r-10"
											size="mini"
											mode="plain"
											bg-color="transparent"
											:border-color="theme.dzBaseFontColor"
											:color="theme.dzBaseFontColor"
										>
											{{ api.formatString(language.product.marketingJoinBuyNum, product.marketing.num) }}
										</dz-tag>
										{{
											joinBuyInfo.length > 0 && joinBuyInfo[1].total != '0'
												? api.formatString(language.product.marketingJoinBuySuccess, joinBuyInfo[1].total)
												: api.formatString(language.product.marketingJoinBuyValidTime, product.marketing.valid_time)
										}}
									</view>
								</view>
								<view class="dz-m-t-10" v-if="product.marketing.remark">{{ product.marketing.remark }}</view>
							</view>
						</view>
					</block>
					<!--TODO 预约购买-->
					<block v-else-if="product.marketing_type == 'subscribe_buy'"></block>
				</block>

				<!--公共属性-->
				<view class="dz-pro-titbox">
					<view
						class="dz-font-sm dz-m-t-10"
						v-if="
							(isBuyMode || product.marketing_type == '') &&
							parseInt(product.is_open_presell) !== 1 &&
							parseInt(product.point_exchange_type) === 1 &&
							product.pointConfig &&
							product.pointConfig.point_to_cash_is_open &&
							product.pointConfig.point_to_cash_is_open == 1 &&
							parseInt(product.max_use_point) > 0
						"
					>
						每件商品最多可用{{ product.max_use_point }}{{ api.formatString(language.product.point, shopSetting.point_front_name) }}抵扣{{
							parseInt(product.max_use_point) * parseFloat(product.pointConfig.point_to_cash_convert_rate)
						}}元
					</view>
					<view class="dz-pro-title">
						<!--会员折扣标记-->
						<dz-icon
							v-if="product.memberDiscount && product.memberDiscount.discount && product.memberDiscount.discount > 0"
							class="dz-m-r-10"
							:size="40"
							:color="theme.dzBaseColor"
							name="memberDiscount"
						></dz-icon>
						<!--虚拟产品标记-->
						<dz-icon
							v-if="parseInt(product.is_virtual) === 1"
							class="dz-m-r-10"
							size="40"
							:color="theme.dzBaseColor"
							name="virtualProduct"
						></dz-icon>

						<dz-tag
							v-if="parseInt(product.is_open_presell) === 1"
							class="dz-m-r-10"
							size="mini"
							mode="plain"
							:border-color="theme.dzBaseColor"
							:color="theme.dzBaseColor"
							customStyle="padding: 5rpx;"
						>
							{{ language.product.preSaleProduct }}
						</dz-tag>
						<dz-tag
							v-if="parseInt(product.is_hot) === 1"
							class="dz-m-r-10"
							size="mini"
							mode="plain"
							:border-color="theme.dzBaseColor"
							:color="theme.dzBaseColor"
							customStyle="padding: 5rpx;"
						>
							{{ language.product.hot }}
						</dz-tag>
						<dz-tag
							v-if="parseInt(product.is_recommend) === 1"
							class="dz-m-r-10"
							size="mini"
							mode="plain"
							:border-color="theme.dzBaseColor"
							:color="theme.dzBaseColor"
							customStyle="padding: 5rpx;"
						>
							{{ language.product.recommend }}
						</dz-tag>
						<dz-tag
							v-if="parseInt(product.is_new) === 1"
							class="dz-m-r-10"
							size="mini"
							mode="plain"
							:border-color="theme.dzBaseColor"
							:color="theme.dzBaseColor"
							customStyle="padding: 5rpx;"
						>
							{{ language.product.new }}
						</dz-tag>
						<dz-tag
							v-if="product.min_buy > 1"
							class="dz-m-r-10"
							size="mini"
							mode="plain"
							:border-color="theme.dzBaseColor"
							:color="theme.dzBaseColor"
							:text="`${product.min_buy}件起售`"
							customStyle="padding: 5rpx;"
						></dz-tag>

						<text class="product-name"> {{ product.name }} </text>
					</view>
				</view>

				<view class="dz-padding dz-p-b-30"> </view>

				<view class="dz-padding dz-p-b-30">
					<view class="dz-sub-title dz-size dz-gray" v-if="product.sketch">{{ product.sketch }}</view>
					<view
						v-if="
							isBuyMode &&
							parseInt(product.is_open_presell) !== 1 &&
							['join_buy', 'limited_buy', 'haggle', 'discount'].includes(product.marketing_type)
						"
						class="dz-marketing-type"
						@tap="marketingTab"
					>
						<view class="dz-flex"
							><dz-image
								:src="api.dataConfig.marketingType[product.marketing_type].icon"
								:width="50"
								:height="50"
								:customStyle="{ marginRight: '10rpx' }"
							></dz-image>
							正在进行{{ api.dataConfig.marketingType[product.marketing_type].title }}活动，点击参加</view
						>
						<dz-icon name="right" color="#666"></dz-icon>
					</view>
					<view class="dz-sale-info dz-size dz-gray">
						<view>
							{{ language.product.shipping }}：{{
								parseInt(product.shipping_type) === 1
									? language.product.shippingFree
									: product.shippingTemplate && product.shippingTemplate.short_description
									? product.shippingTemplate.short_description
									: language.product.shippingPay
							}}
						</view>
						<view>{{ language.product.monthSale }}：{{ product.total_sales || '-' }}</view>
						<view class="dz-line-1">{{ product.address_name || '' }}</view>
					</view>
				</view>
			</view>
			<!--公共属性-->

			<!--拼团内容-->
			<block v-if="!isBuyMode && joinBuyInfo.length > 0 && joinBuyInfo[0].total != '0' && product.marketing_type == 'join_buy'">
				<view class="dz-radius-all dz-mtop">
					<dz-cell-item
						bg-color="#FFF"
						hover-class=""
						:title-style="{ fontWeight: 'bold' }"
						:title="api.formatString(language.product.joinBuyJoinTitle, joinBuyInfo[0].total)"
						:arrow="false"
					></dz-cell-item>
					<swiper
						v-if="joinBuyInfo[0].list.length > 0"
						:indicator-dots="false"
						:autoplay="true"
						:interval="5000"
						:duration="500"
						:circular="true"
						:display-multiple-items="joinBuyInfo[0].list.length > 1 ? 2 : 1"
						:vertical="true"
						:class="[joinBuyInfo[0].list.length > 1 ? 'dz-group-swiper-multi' : 'dz-group-swiper-sigle', 'dz-group-swiper']"
					>
						<block v-for="(item, index) in joinBuyInfo[0].list" :key="index">
							<swiper-item>
								<view class="dz-group-user">
									<view class="dz-user-left">
										<image :src="item.member_head_portrait || assets.missingFace" :lazy-load="true"></image>
										<view class="dz-user-anme">{{ item.member_nickname || language.application.anonymous }}</view>
									</view>
									<view class="dz-user-right">
										<view class="dz-user-countdown">
											<view class="dz-group-num">{{
												api.formatString(language.product.joinBuyLack, item.total_number - item.number)
											}}</view>
											<view class="dz-group-countdown">
												<view class="dz-countdown-right">{{ language.application.left }}</view>
												<dz-count-down
													:timestamp="item.end_time_left"
													:show-border="true"
													:color="theme.dzBaseFontColor"
													:separator-color="theme.dzBaseColor"
													:border-color="theme.dzBaseColor"
													:bg-color="theme.dzBaseColor"
													font-size="20"
												></dz-count-down>
												<view class="dz-countdown-left">{{ language.application.finished }}</view>
											</view>
										</view>
										<dz-button
											:border="false"
											:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
											hover-class="none"
											size="mini"
											shape="circle"
											@click="joinBuyClick(item.id)"
										>
											{{ language.product.joinBuyJoin }}
										</dz-button>
									</view>
								</view>
							</swiper-item>
						</block>
					</swiper>
				</view>
			</block>
			<block v-if="!isBuyMode && product.marketing_type == 'join_buy'">
				<!--拼团规则玩法介绍-->
				<view class="dz-group-rule dz-mtop dz-radius-all">
					<dz-cell-item
						bg-color="#FFF"
						hover-class=""
						:title-style="{ fontWeight: 'bold' }"
						:title="language.product.joinBuyRuleTitle"
						:value="language.product.joinBuyRuleInfo"
						@click="joinBuyRuleClick"
					></dz-cell-item>
					<view class="dz-step__box">
						<view class="dz-step-item">
							<image :src="assets.joinBuyStep1"></image>
							<view class="dz-step-text">{{ language.product.joinBuyRuleStep1 }}</view>
						</view>
						<view class="dz-step-arrow"><image :src="assets.stepArrow"></image></view>
						<view class="dz-step-item">
							<image :src="assets.joinBuyStep2"></image>
							<view class="dz-step-text">{{ language.product.joinBuyRuleStep2 }}</view>
						</view>
						<view class="dz-step-arrow"><image :src="assets.stepArrow"></image></view>
						<view class="dz-step-item">
							<image :src="assets.joinBuyStep3"></image>
							<view class="dz-step-text">{{ language.product.joinBuyRuleStep3 }}</view>
						</view>
						<view class="dz-step-arrow"><image :src="assets.stepArrow"></image></view>
						<view class="dz-step-item">
							<image :src="assets.joinBuyStep4"></image>
							<view class="dz-step-text">{{ language.product.joinBuyRuleStep4 }}</view>
						</view>
					</view>
				</view>
				<dz-popup v-model:show="joinBuyRuleShow" mode="center" border-radius="40" length="84%">
					<view style="padding: 30rpx 40rpx">
						<view class="dz-modal__title">{{ language.product.joinBuyRuleModelTitle }}</view>
						<view class="dz-modal__p" v-for="(item, index) in language.product.joinBuyRuleModelInfo" :key="index">{{ item }}</view>
						<view class="dz-modal__btn">
							<dz-button
								:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
								hover-class="none"
								size="medium"
								shape="circle"
								@click="hideJoinBuyRule"
							>
								{{ language.application.gotIt }}
							</dz-button>
						</view>
					</view>
				</dz-popup>
			</block>
			<!--拼团内容-->

			<!--商品说明-->
			<view class="dz-discount-box dz-radius-all dz-mtop">
				<!--优惠券-->
				<view class="dz-list-cell" v-if="product.canReceiveCoupon && product.canReceiveCoupon.length" @tap="coupon">
					<view class="dz-cell-title">{{ language.product.coupon }}</view>
					<view class="dz-flex-center">
						<view style="line-height: 48rpx">
							<block v-for="(item, index) in product.canReceiveCoupon" :key="index">
								<dz-tag
									class="dz-m-r-10"
									size="mini"
									:bg-color="theme.dzBaseColor"
									:border-color="theme.dzBaseColor"
									:color="theme.dzBaseFontColor"
								>
									{{
										api.toFloat(item.at_least) > 0 && item.type != 2
											? api.formatString(language.product.overMoney, api.toFloat(item.at_least))
											: ''
									}}{{
										item.type == 1
											? api.formatString(language.product.discountMoney, api.toFloat(item.money))
											: api.formatString(language.product.discountPercent, api.toFloat(item.discount / 10))
									}}
								</dz-tag>
							</block>
						</view>
					</view>
					<view class="dz-ml-auto"><dz-icon name="right" :size="28" color="#666"></dz-icon></view>
				</view>
				<!-- 已选规格 -->
				<view class="dz-list-cell" @tap="showPopup">
					<view class="dz-cell-title">已选</view>
					<view
						v-if="selectArr.some((item) => item != '')"
						v-for="(item, index) in selectArr"
						:key="index"
						class="dz-flex-center dz-line-h-32"
						:class="{ 'dz-m-r-10': index < selectArr.length - 1 }"
					>
						{{ item }}
					</view>
					<block v-else>默认款</block>
					<view class="dz-ml-auto"><dz-icon name="right" :size="28" color="#666"></dz-icon></view>
				</view>
				<!--库存-->
				<view class="dz-list-cell" v-if="parseInt(product.is_stock_visible) == 1">
					<view class="dz-cell-title">{{ language.product.store }}</view>
					<view class="dz-flex-center">
						<text class="dz-base-color dz-bold" v-if="parseInt(product.stock) === 0">{{ language.product.outOfStockTip }}</text>
						<text v-else>{{ `${language.product.left} ${product.stock} ${product.unit || language.application.unit}` }}</text>
					</view>
				</view>
				<!--会员折扣-->
				<view class="dz-list-cell" v-if="product.memberDiscount && product.memberDiscount.discount && product.memberDiscount.discount > 0">
					<view class="dz-cell-title">{{ language.product.member }}</view>
					<view class="dz-flex-center">
						<text>{{ api.formatString(language.product.memberDiscountPercent, product.memberDiscount.discount) }}</text>
					</view>
				</view>
				<!--限购-->
				<view class="dz-list-cell" v-if="isBuyMode && parseInt(product.max_buy) > 0">
					<view class="dz-cell-title">{{ language.product.maxBuy }}</view>
					<view class="dz-flex-center">
						<text>{{ `${api.formatString(language.product.maxBuyPertime, product.max_buy)} ${product.unit || language.application.unit}` }}</text>
					</view>
				</view>
				<!--包邮-->
				<view class="dz-list-cell" v-if="product.fullMail && product.fullMail.is_open == '1' && parseInt(product.shipping_type) !== 1">
					<view class="dz-cell-title">{{ language.product.shippingFree }}</view>
					<view class="dz-flex-center">
						<text>{{
							api.formatString(language.product.overMoneyShippingFree, language.application.moneySymbol + product.fullMail.full_mail_money)
						}}</text>
					</view>
				</view>
				<view class="dz-list-cell" v-if="product.fullMail && product.fullMail.is_open == '2' && parseInt(product.shipping_type) !== 1">
					<view class="dz-cell-title">{{ language.product.shippingFree }}</view>
					<view class="dz-flex-center">
						<text>{{ api.formatString(language.product.overMoneyShippingFree, product.fullMail.full_mail_number + '件') }}</text>
					</view>
				</view>
				<!--邮费说明-->
				<view
					class="dz-list-cell"
					v-if="product.shippingTemplate && product.fullMail && product.fullMail.is_open == '0' && parseInt(product.shipping_type) !== 1"
				>
					<view class="dz-cell-title">{{ language.product.shippingInfo }}</view>
					<view class="dz-flex-center">
						<text>{{ product.shippingTemplate.description }}</text>
					</view>
				</view>
				<!--满减送-->
				<view class="dz-list-cell" v-if="product.fullGiveRule && product.fullGiveRule.length > 0">
					<view class="dz-cell-title">{{ language.product.overReduce }}</view>
					<view>
						<view class="dz-promotion-box" style="width: 100%" v-for="(item, index) in product.fullGiveRule" :key="index">
							<text>{{ item }}</text>
						</view>
					</view>
				</view>
				<!--赠送积分-->
				<view class="dz-list-cell" v-if="parseInt(product.give_point) > 0">
					<view class="dz-cell-title">{{ api.formatString(language.product.point, shopSetting.point_front_name) }}</view>
					<view class="dz-flex-center">
						<text>
							{{
								api.formatString(
									language.product.overPointShipping,
									parseInt(product.give_point),
									parseInt(product.point_give_type) === 1 ? '%' : shopSetting.point_front_name
								)
							}}
						</text>
					</view>
				</view>
				<!--积分抵扣-->
				<view
					class="dz-list-cell"
					v-if="
						parseInt(product.point_exchange_type) === 1 &&
						product.pointConfig &&
						product.pointConfig.point_to_cash_is_open == 1 &&
						parseInt(product.max_use_point) > 0
					"
				>
					<view class="dz-cell-title">{{ api.formatString(language.product.deduct, shopSetting.point_front_name) }}</view>
					<view>
						<view class="dz-promotion-box" style="width: 100%">
							<text>
								{{
									api.formatString(
										language.product.deductByPoints,
										product.max_use_point,
										shopSetting.point_front_name,
										parseInt(product.max_use_point) * parseFloat(product.pointConfig.point_to_cash_convert_rate)
									)
								}}
							</text>
						</view>
						<view class="dz-promotion-box" style="width: 100%" v-if="product.pointConfig.desc">
							<text>{{ product.pointConfig.desc }}</text>
						</view>
					</view>
				</view>
				<!--必须加上积分购买-->
				<view class="dz-list-cell" v-if="parseInt(product.point_exchange_type) === 2">
					<view class="dz-cell-title">{{ api.formatString(language.product.needPoint, shopSetting.point_front_name) }}</view>
					<view class="dz-flex-center">
						<text>{{ api.formatString(language.product.needPointInfo, product.point_exchange, shopSetting.point_front_name) }}</text>
					</view>
				</view>
				<!--积分换购或者直接现金购买-->
				<view class="dz-list-cell" v-if="parseInt(product.point_exchange_type) === 3 || parseInt(product.point_exchange_type) === 4">
					<view class="dz-cell-title">{{ language.product.exchange }}</view>
					<view class="dz-flex-center">
						<text>{{ api.formatString(language.product.exchangeByPointsTip, product.point_exchange, shopSetting.point_front_name) }}</text>
					</view>
				</view>
				<!--阶梯优惠-->
				<view class="dz-list-cell" v-if="product.ladderPreferential && product.ladderPreferential.length > 0">
					<view class="dz-cell-title">{{ language.product.preferential }}</view>
					<view>
						<view class="dz-promotion-box" style="width: 100%" v-for="(item, index) in product.ladderPreferential" :key="index">
							<text>
								{{
									parseInt(item.type) === 1
										? api.formatString(
												language.product.overQuantityMoney,
												item.quantity + (product.unit || language.application.unit),
												product.unit || language.application.unit,
												item.price
										  )
										: api.formatString(
												language.product.overQuantityDiscount,
												item.quantity + (product.unit || language.application.unit),
												product.unit || language.application.unit,
												item.price
										  )
								}}
							</text>
						</view>
					</view>
				</view>
				<!--服务-->
				<view class="dz-guarantee" v-if="product.tags && product.tags.length > 0">
					<view class="dz-guarantee-item" v-for="(item, index) in product.tags" :key="index">
						<dz-icon name="roundcheck" :size="28" color="#999"></dz-icon>
						<text class="dz-pl">{{ item }}</text>
					</view>
				</view>
			</view>
			<!--商品说明-->
			<!-- 商品属性 -->
			<view v-if="product.custom_attributes" class="dz-basic-info dz-mtop dz-radius-all dz-p-30">
				<block v-for="(item, index) in JSON.parse(product.custom_attributes)" :key="index">
					<view class="dz-list-cell dz-list-cell-attributes" :class="JSON.parse(product.custom_attributes).length - 1 == index ? '' : 'dz-m-b-20'">
						<view class="dz-cell-title dz-cell-title-attributes">{{ item.label }}</view>
						<view class="dz-flex-1">
							<text>{{ item.value }}</text>
						</view>
					</view>
				</block>
			</view>
			<!-- 商品属性 -->
			<!--组合套餐-->
			<view class="dz-basic-info dz-mtop dz-radius-all" v-if="product.combination && product.combination.length > 0">
				<dz-cell-item
					:bg-color="'#FFF'"
					hover-class=""
					:title-style="{ fontWeight: 'bold' }"
					:title="api.formatString(language.product.combination, product.combination.length)"
					:value="language.product.combinationTip"
					:arrow="false"
				></dz-cell-item>
				<scroll-view scroll-x class="combination-list">
					<view
						class="combination-item"
						:class="product.combination.length - 1 != index ? ' dz-border-right' : ''"
						v-for="(item, index) in product.combination"
						:key="item.id"
						@tap.stop="combinationClick(item.id)"
					>
						<view class="combination-product-item" v-for="subItem in item.combinationProduct" :key="subItem.id">
							<image class="combination-product-img" :src="subItem.product.picture" mode="aspectFill"></image>
							<text class="combination-product-price">{{ language.application.moneySymbol }}{{ subItem.product.price }}</text>
						</view>
						<view class="combination-product-title"
							>{{ item.name }}<text :style="{ color: theme.dzBaseColor }">{{ language.application.moneySymbol }}{{ item.price }}</text></view
						>
					</view>
				</scroll-view>
			</view>
			<!--组合套餐-->
			<!--评价-->
			<view class="evaluate dz-cmt-box dz-mtop dz-radius-all">
				<dz-cell-item
					:bg-color="'#FFF'"
					hover-class=""
					:title="api.formatString(language.product.evaluate, (product.evaluateStat && product.evaluateStat.total_num) || 0)"
					:value="api.formatString(language.product.evaluateGoodRate, product.match_ratio)"
					@click="evaluationClick"
				></dz-cell-item>
				<view v-if="product.evaluate && product.evaluate.length > 0">
					<block v-for="(item, index) in product.evaluate" :key="index">
						<view class="dz-evaluate-box" v-if="index < 3">
							<image class="portrait" :src="item.member_head_portrait || assets.missingFace" mode="aspectFill"></image>

							<view class="right">
								<view class="name">
									<text>{{ item.member_nickname || language.application.anonymous }}</text>
									<dz-rate :value="item.scores" :disabled="true" active-icon="favor_fill_light"></dz-rate>
								</view>

								<text class="con dz-line-2">{{ item.content || language.product.evaluateDefault }}</text>
								<view class="bot">
									<text class="attr">{{ item.sku_name || language.application.defaultSkuName }}</text>
									<text class="time">{{ api.timeFormat(item.created_time) }}</text>
								</view>
							</view>
						</view>
					</block>
					<view class="dz-cmt-btn">
						<dz-button
							type="info"
							shape="circle"
							size="medium"
							hoverClass="none"
							:border="false"
							:custom-style="{ width: '240rpx', height: '64rpx', lineHeight: '64rpx', background: '#fff', border: '1rpx solid rgba(0,0,0,0.12)' }"
							@click="evaluationClick"
						>
							{{ language.product.evaluateView }}
						</dz-button>
					</view>
				</view>
				<view v-else>
					<view style="width: 100%; text-align: center; padding: 40rpx 20rpx">{{ language.product.evaluateEmpty }}</view>
				</view>
			</view>
			<!--评价-->

			<!--商品详情-->
			<view class="dz-product-detail dz-radius-all">
				<dz-title title="商品详情" mode="line" :barColor="theme.dzBaseDisabled"></dz-title>
				<dz-parse class="dz-product-img" :content="product.intro" lazy-load></dz-parse>
				<view class="dz-safearea-bottom"></view>
			</view>
			<!--商品详情-->

			<!--底部操作栏-->
			<view class="dz-operation-ios">
				<view class="dz-operation">
					<view class="dz-operation-left" :class="[customerService ? 'dz-col-3' : 'dz-col-1-5']">
						<view v-if="customerService" class="dz-operation-item" hover-class="dz-opcity" :hover-stay-time="150">
							<dz-button
								:open-type="parseInt(serviceType) == 4 ? '' : 'contact'"
								:sessionFrom="sessionFrom"
								@click="serviceTap"
								:border="false"
								hover-class="none"
								:custom-style="{
									display: 'block',
									background: 'transparent',
									margin: '0rpx',
									padding: '0rpx',
									borderRadius: '0rpx',
									borderWidth: '0rpx',
									lineHeight: '1',
									width: '100%',
									height: '100rpx',
								}"
							>
								<view class="dz-operation-item" hover-class="dz-opcity" style="height: 100rpx">
									<dz-icon name="service" :size="46" :color="theme.dzMainColor"></dz-icon>
									<view class="dz-operation-text dz-scale-small">{{ language.product.onlineService }}</view>
									<dz-badge v-if="customerServiceUnread" type="error" size="mini" :count="customerServiceUnread" :offset="[2, 0]"></dz-badge>
								</view>
							</dz-button>
						</view>
						<view class="dz-operation-item" hover-class="dz-opcity" :hover-stay-time="150" @tap.stop="cartTap">
							<dz-icon name="cart" :size="46" :color="theme.dzMainColor"></dz-icon>
							<view class="dz-operation-text dz-scale-small">{{ language.product.cart }}</view>
							<dz-badge type="error" size="mini" :count="cartNum" :offset="[-4, 20]"></dz-badge>
						</view>
					</view>
					<view class="dz-operation-right dz-right-flex" :class="[customerService ? 'dz-col-7' : 'dz-col-8-5']">
						<block v-if="isBuyMode || product.marketing_type == ''">
							<block v-if="parseInt(product.is_open_presell) === 1">
								<!--预售-->
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											width: '100%',
											background: buyBtnDisabled ? theme.dzBaseDisabled : theme.dzBaseColor,
											color: theme.dzBaseFontColor,
										}"
										hover-class="none"
										:disabled="buyBtnDisabled"
										:border="false"
										shape="circle"
										@click="showPopup"
									>
										<view class="dz-btn__box">
											<view>
												{{
													buyBtnDisabled
														? language.product.outOfStock
														: `${language.product.depositPay}(${
																parseInt(product.presell_delivery_type) === 1
																	? api.formatString(
																			language.product.preSaleDeliverTime,
																			api.timeFormat(product.presell_time, 'yyyy-mm-dd')
																	  )
																	: api.formatString(language.product.preSaleDeliverDay, product.presell_day)
														  })`
												}}
											</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">{{ presellPrice }}</view>
											</view>
										</view>
									</dz-button>
								</view>
							</block>
							<block v-else>
								<!--正常购买-->
								<!--购物车-->
								<view class="dz-flex-1" v-if="!cartBtnHide">
									<dz-button
										:custom-style="{
											background: buyBtnDisabled ? theme.dzSubDisabled : theme.dzSubColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: '40rpx 0 0 40rpx',
										}"
										hover-class="none"
										:disabled="buyBtnDisabled"
										:border="false"
										shape="rightAngle"
										@click="showPopup"
									>
										{{ language.product.addToCart }}
									</dz-button>
								</view>
								<!--积分换购-->
								<view class="dz-flex-1" v-if="parseInt(product.point_exchange_type) === 3 || parseInt(product.point_exchange_type) === 4">
									<dz-button
										:custom-style="{
											background: buyBtnDisabled ? theme.dzSubDisabled : theme.dzSubColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: parseInt(product.point_exchange_type) === 4 ? '40rpx' : '40rpx 0 0 40rpx',
										}"
										hover-class="none"
										:disabled="buyBtnDisabled"
										:border="false"
										shape="rightAngle"
										@click="showPopup"
									>
										<view class="dz-btn__box">
											<view>
												{{
													buyBtnDisabled
														? language.product.outOfStock
														: api.formatString(language.product.exchangeByPoints, shopSetting.point_front_name)
												}}
											</view>
											<view class="dz-flex-end">
												<view class="dz-size-32">{{ product.point_exchange }}</view>
												<view class="dz-font-24 dz-m-l-5">{{
													api.formatString(language.product.point, shopSetting.point_front_name)
												}}</view>
											</view>
										</view>
									</dz-button>
								</view>
								<!--积分加钱-->
								<view class="dz-flex-1" v-if="parseInt(product.point_exchange_type) === 2">
									<dz-button
										:custom-style="{
											background: parseInt(currentSkuStock) === 0 ? theme.dzBaseDisabled : theme.dzBaseColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: '40rpx',
										}"
										hover-class="none"
										:disabled="parseInt(currentSkuStock) === 0"
										:border="false"
										shape="rightAngle"
										@click="showPopup"
									>
										<view class="dz-btn__box">
											<view>{{ parseInt(currentSkuStock) === 0 ? language.product.outOfStock : language.product.directBuy }}</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">
													{{ api.formatString(language.product.needPointTip, product.point_exchange, shopSetting.point_front_name) }}
												</view>
											</view>
										</view>
									</dz-button>
								</view>
								<!--购买-->
								<view
									class="dz-flex-1"
									v-if="
										parseInt(product.point_exchange_type) === 0 ||
										((parseInt(product.point_exchange_type) === 1 ||
											parseInt(product.point_exchange_type) === 3 ||
											!product.marketing_type) &&
											product.point_exchange_type != 2 &&
											product.point_exchange_type != 4)
									"
								>
									<dz-button
										:custom-style="{
											padding: '0 10rpx',
											background: buyBtnDisabled ? theme.dzBaseDisabled : theme.dzBaseColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: !cartBtnHide ? '0 40rpx 40rpx 0' : '40rpx',
										}"
										hover-class="none"
										:disabled="buyBtnDisabled"
										:border="false"
										shape="rightAngle"
										@click="showPopup"
									>
										<!--有会员折扣-->
										<block v-if="product.memberDiscount && product.memberDiscount.discount && product.memberDiscount.discount > 0">
											<view class="dz-btn__box">
												<view>{{ buyBtnDisabled ? language.product.outOfStock : language.product.directBuy }}</view>
												<view class="dz-flex-end">
													<view class="dz-font-22">{{ language.product.memberDiscount }} {{ language.application.moneySymbol }}</view>
													<view class="dz-font-24">{{ currentPrice }}</view>
												</view>
											</view>
										</block>
										<!--无会员折扣-->
										<block v-else>{{ buyBtnDisabled ? language.product.outOfStock : language.product.directBuy }}</block>
									</dz-button>
								</view>
							</block>
						</block>
						<block v-else>
							<!--拼团-->
							<block v-if="product.marketing_type === 'join_buy'">
								<block v-if="buyBtnDisabled">
									<view class="dz-flex-1">
										<dz-button
											:custom-style="{ background: theme.dzBaseDisabled, color: theme.dzBaseFontColor, width: '100%' }"
											hover-class="none"
											:disabled="true"
											:border="false"
											shape="circle"
										>
											{{ language.product.outOfStock }}
										</dz-button>
									</view>
								</block>
								<block v-else>
									<view class="dz-flex-1">
										<dz-button
											:custom-style="{
												background: theme.dzSubColor,
												color: theme.dzBaseFontColor,
												width: '100%',
												borderRadius: '40rpx 0 0 40rpx',
											}"
											hover-class="none"
											:border="false"
											shape="rightAngle"
											@click="showPopup"
										>
											<view class="dz-btn__box">
												<view>{{ language.product.directBuy }}</view>
												<view class="dz-flex-end">
													<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
													<view class="dz-size-32">{{ marketingProductPrice }}</view>
												</view>
											</view>
										</dz-button>
									</view>
									<view class="dz-flex-1">
										<dz-button
											:custom-style="{
												background: theme.dzBaseColor,
												color: theme.dzBaseFontColor,
												width: '100%',
												borderRadius: '0 40rpx 40rpx 0',
											}"
											hover-class="none"
											:border="false"
											shape="rightAngle"
											@click="joinBuyShowPopup"
										>
											<view class="dz-btn__box">
												<view>{{ language.product.joinBuy }}</view>
												<view class="dz-flex-end">
													<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
													<view class="dz-size-32">{{ currentPrice }}</view>
												</view>
											</view>
										</dz-button>
									</view>
								</block>
							</block>
							<!--砍价-->
							<block v-else-if="product.marketing_type === 'haggle'">
								<block v-if="buyBtnDisabled || parseInt(product.marketing.state) !== 1">
									<view class="dz-flex-1">
										<dz-button
											:custom-style="{ background: theme.dzBaseDisabled, color: theme.dzBaseFontColor, width: '100%' }"
											hover-class="none"
											:disabled="true"
											:border="false"
											shape="circle"
										>
											{{
												buyBtnDisabled
													? language.product.outOfStock
													: parseInt(product.marketing.state) === 0
													? '活动即将开始'
													: '活动已结束'
											}}
										</dz-button>
									</view>
								</block>
								<block v-else>
									<view class="dz-flex-1">
										<dz-button
											:custom-style="{
												background: theme.dzSubColor,
												color: theme.dzBaseFontColor,
												width: '100%',
												borderRadius: '40rpx 0 0 40rpx',
											}"
											hover-class="none"
											:border="false"
											shape="rightAngle"
											@click="showPopup"
										>
											<view class="dz-btn__box">
												<view>{{ language.product.directBuy }}</view>
												<view class="dz-flex-end">
													<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
													<view class="dz-size-32">{{ currentPrice }}</view>
												</view>
											</view>
										</dz-button>
									</view>
									<view class="dz-flex-1">
										<dz-button
											:custom-style="{
												background: theme.dzBaseColor,
												color: theme.dzBaseFontColor,
												width: '100%',
												borderRadius: '0 40rpx 40rpx 0',
											}"
											hover-class="none"
											:border="false"
											shape="rightAngle"
											@click="showPopup"
										>
											<view class="dz-btn__box">
												<view>{{ language.product.haggleBudy }}</view>
												<view class="dz-flex-end">
													<view class="dz-size-26">{{ language.product.inviteBargain }} {{ language.application.moneySymbol }}</view>
													<view class="dz-size-32">
														{{
															api.toFixed(
																marketingPrice - (1 - api.toFloat(product.marketing.min_rate / 100)) * marketingPrice,
																2
															)
														}}
													</view>
												</view>
											</view>
										</dz-button>
									</view>
								</block>
							</block>
							<!--限量购-->
							<block v-else-if="product.marketing_type === 'limited_buy'">
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: buyBtnDisabled || parseInt(product.marketing.state) !== 1 ? theme.dzBaseDisabled : theme.dzBaseColor,
											color: theme.dzBaseFontColor,
											width: '100%',
										}"
										hover-class="none"
										:disabled="buyBtnDisabled || parseInt(product.marketing.state) !== 1"
										:border="false"
										shape="circle"
										@click="showPopup"
									>
										<view class="dz-btn__box">
											<view>
												{{
													buyBtnDisabled
														? language.product.outOfStock
														: parseInt(product.marketing.state) === 0
														? language.product.startSoon
														: parseInt(product.marketing.state) === 2
														? language.product.alreadyOver
														: language.product.limitedBuy
												}}
											</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">{{ currentPrice }}</view>
											</view>
										</view>
									</dz-button>
								</view>
							</block>
							<!--限时折扣-->
							<block v-else-if="product.marketing_type === 'discount'">
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: buyBtnDisabled || parseInt(product.marketing.state) !== 1 ? theme.dzBaseDisabled : theme.dzBaseColor,
											color: theme.dzBaseFontColor,
											width: '100%',
										}"
										hover-class="none"
										:disabled="buyBtnDisabled || parseInt(product.marketing.state) !== 1"
										:border="false"
										shape="circle"
										@click="showPopup"
									>
										<view class="dz-btn__box">
											<view>
												{{
													buyBtnDisabled
														? language.product.outOfStock
														: parseInt(product.marketing.state) === 0
														? language.product.startSoon
														: parseInt(product.marketing.state) === 2
														? language.product.alreadyOver
														: language.product.discountBuy
												}}
											</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">{{ currentPrice }}</view>
											</view>
										</view>
									</dz-button>
								</view>
							</block>
						</block>
					</view>
				</view>
			</view>
			<!--底部操作栏-->
		</view>

		<!--优惠券列表-->
		<dz-popup v-model:show="couponShow" mode="bottom" border-radius="40">
			<view class="dz-coupon-title">推荐优惠劵</view>
			<scroll-view scroll-y style="max-height: 800rpx" class="dz-coupon-list">
				<block v-for="(item, index) in product.canReceiveCoupon" :key="index">
					<dz-coupon-item :coupon="item" isButton customStyle="margin-top: 20rpx" @click="getCoupon($event, index)"></dz-coupon-item>
				</block>
				<view style="height: 20rpx"></view>
			</scroll-view>
		</dz-popup>
		<!--优惠券列表-->
		<!-- app分享 -->
		<!-- #ifdef APP-PLUS -->
		<dz-app-share
			v-model:show="appShareShow"
			:isPoster="shopSetting.product_poster_is_open == 1"
			:config="shareData"
			@onPoster="posterClick"
		></dz-app-share>
		<!-- #endif -->
		<!-- app分享 -->
		<!-- h5分享 -->
		<!-- #ifdef H5 -->
		<dz-h5-share v-model:show="appShareShow" @onPoster="posterClick" @onShare="h5Share"></dz-h5-share>
		<!-- #endif -->
		<!-- 微信小程序分享 -->
		<!-- #ifdef MP -->
		<dz-wechat-share v-model:show="appShareShow" @onPoster="posterClick"></dz-wechat-share>
		<!-- #endif -->
		<!-- 微信小程序分享 -->
		<!-- 海报 -->
		<dz-poster-modal
			v-model:show="posterShow"
			:product="product"
			:isBuyMode="isBuyMode"
			:shareData="shareData"
			:warehouseDistribution="warehouseDistribution"
			:currentPrice="currentPrice"
			:marketingPrice="marketingPrice"
		></dz-poster-modal>
		<!-- 海报 -->
		<!-- 规格选择 -->
		<dz-popup v-model:show="skuPopupShow" mode="bottom" :border-radius="40" closeIcon="roundclose" :closeIconSize="40" :closeable="true">
			<view class="dz-popup-box">
				<view class="dz-product-box dz-padding">
					<view class="dz-popup-img" @tap.stop="previewImgs(currentSkuPicture || product.picture, [currentSkuPicture || product.picture])">
						<dz-image :src="currentSkuPicture || product.picture" :width="200" :height="200" :borderRadius="20"></dz-image>
					</view>
					<view class="dz-popup-price">
						<view class="dz-amount" :style="{ color: theme.dzBaseColor }">
							<!--会员折扣标记-->
							<dz-icon
								v-if="product.memberDiscount && product.memberDiscount.discount && product.memberDiscount.discount > 0"
								class="dz-m-r-10"
								:size="40"
								:color="theme.dzBaseColor"
								name="memberDiscount"
							></dz-icon>

							<text>{{ language.application.moneySymbol }}</text>
							<text class="dz-price">{{ currentPrice }}</text>
						</view>
						<view v-if="selectArr.some((item) => item != '')" class="dz-number">
							已选：
							<text
								class="selected-text"
								style="line-height: 32rpx"
								v-for="(item, index) in selectArr"
								:key="index"
								:class="{ 'dz-m-r-10': index < selectArr.length - 1 }"
								>{{ item }}</text
							>
						</view>
						<view class="dz-number" v-if="currentSkuStock !== null && parseInt(product.is_stock_visible) == 1">
							<text class="selected-text"
								>{{ language.product.store }}：{{ currentSkuStock }} {{ product.unit || language.application.unit }}</text
							>
						</view>
					</view>
				</view>
				<scroll-view scroll-y class="dz-popup-scroll">
					<view class="dz-scrollview-box">
						<block v-for="(item, index) in specList" :key="index">
							<view class="dz-bold dz-attr-title">{{ item.title }}</view>
							<view class="dz-attr-box">
								<block v-if="parseInt(item.show_type) === 3">
									<dz-row>
										<block v-for="(childItem, childIndex) in specChildList" :key="childIndex">
											<dz-col v-if="childItem.spec_id === item.id" :gutter="0" :span="4">
												<view
													class="dz-sku"
													:style="{
														color: subIndex[index] == childIndex ? theme.dzBaseColor : '',
														borderColor: subIndex[index] == childIndex ? theme.dzBaseColor : '#f7f7f7',
														fontWeight: subIndex[index] == childIndex ? 'bold' : 500,
													}"
													:class="[childItem.ishow ? '' : 'dz-pic-disabled', item.value.length > 3 ? 'dz-m-b-20' : '']"
													@tap="skuClick(childItem, index, childIndex, item.show_type)"
												>
													<dz-image :src="childItem.data || product.picture" :borderRadius="20" :width="190" :height="190"></dz-image>
													<view class="sku-name dz-line-1">{{ childItem.title }}</view>
													<view
														class="icon"
														@tap.stop="previewImgs(childItem.data || product.picture, [childItem.data || product.picture])"
													>
														<dz-icon name="change" :size="28" color="#fff"></dz-icon>
													</view>
												</view>
											</dz-col>
										</block>
									</dz-row>
								</block>
								<block v-else-if="parseInt(item.show_type) === 2">
									<!--颜色属性-->
									<block v-for="(childItem, childIndex) in specChildList" :key="childIndex">
										<view
											class="dz-attr-item"
											v-if="childItem.spec_id === item.id"
											:style="{
												color: subIndex[index] == childIndex ? theme.dzBaseColor : '#333',
											}"
											:class="[childItem.ishow ? '' : 'dz-pic-disabled', subIndex[index] == childIndex ? 'dz-attr-active' : '']"
											@tap="skuClick(childItem, index, childIndex, item.show_type)"
										>
											<view
												v-if="childItem.data"
												class="attr-color"
												:style="{
													backgroundColor: childItem.data,
												}"
											></view>
											{{ childItem.title }}
										</view>
									</block>
								</block>
								<block v-else>
									<!--文字属性-->
									<block v-for="(childItem, childIndex) in specChildList" :key="childIndex">
										<view
											class="dz-attr-item"
											v-if="childItem.spec_id === item.id"
											:style="{
												color: subIndex[index] == childIndex ? theme.dzBaseColor : '#333',
												borderColor: subIndex[index] == childIndex ? theme.dzBaseColor : '',
											}"
											:class="[childItem.ishow ? '' : 'dz-disabled', subIndex[index] == childIndex ? 'dz-attr-active' : '']"
											@tap="skuClick(childItem, index, childIndex, item.show_type)"
										>
											{{ childItem.title }}
										</view>
									</block>
								</block>
							</view>
						</block>
					</view>
				</scroll-view>
				<dz-line></dz-line>
				<view class="dz-number-content dz-bold dz-attr-title">
					<view class="dz-attr-title">{{ language.product.number }}</view>
					<dz-number-box
						:max="maxNum === 0 ? parseInt(currentSkuStock) : maxNum > parseInt(currentSkuStock) ? parseInt(currentSkuStock) : maxNum"
						:min="minNum"
						:disabled="parseInt(currentSkuStock) === 0"
						input-width="100"
						v-model="currentSkuNumber"
					></dz-number-box>
				</view>
				<view class="dz-operation dz-operation-right dz-right-flex dz-popup-btn dz-p-20">
					<block v-if="isBuyMode || product.marketing_type == ''">
						<block v-if="parseInt(product.is_open_presell) === 1">
							<!--预售-->
							<view class="dz-flex-1">
								<dz-button
									:custom-style="{
										background: parseInt(currentSkuStock) === 0 ? theme.dzBaseDisabled : theme.dzBaseColor,
										color: theme.dzBaseFontColor,
										width: '100%',
									}"
									hover-class="none"
									:disabled="parseInt(currentSkuStock) === 0"
									:border="false"
									shape="circle"
									@click="preSell"
								>
									<view class="dz-btn__box">
										<view>
											{{
												parseInt(currentSkuStock) === 0
													? language.product.outOfStock
													: api.formatString(
															language.product.preBuy,
															parseInt(product.presell_delivery_type) === 1
																? api.formatString(
																		language.product.preSaleDeliverTime,
																		api.timeFormat(product.presell_time, 'yyyy-mm-dd')
																  )
																: api.formatString(language.product.preSaleDeliverDay, product.presell_day)
													  )
											}}
										</view>
										<view class="dz-flex-end">
											<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
											<view class="dz-size-32">{{ presellPrice }}</view>
										</view>
									</view>
								</dz-button>
							</view>
						</block>
						<block v-else>
							<!--正常购买-->
							<!--购物车-->
							<view class="dz-flex-1" v-if="!cartBtnHide">
								<dz-button
									:custom-style="{
										background: parseInt(currentSkuStock) === 0 ? theme.dzSubDisabled : theme.dzSubColor,
										color: theme.dzBaseFontColor,
										width: '100%',
										borderRadius: '40rpx 0 0 40rpx',
									}"
									hover-class="none"
									:disabled="parseInt(currentSkuStock) === 0"
									:border="false"
									shape="rightAngle"
									@click="addToCart"
								>
									{{ language.product.addToCart }}
								</dz-button>
							</view>
							<!--纯积分换购-->
							<view class="dz-flex-1" v-if="parseInt(product.point_exchange_type) === 3 || parseInt(product.point_exchange_type) === 4">
								<dz-button
									:custom-style="{
										background: parseInt(currentSkuStock) === 0 ? theme.dzSubDisabled : theme.dzSubColor,
										color: theme.dzBaseFontColor,
										width: '100%',
										borderRadius: parseInt(product.point_exchange_type) === 4 ? '40rpx' : '40rpx 0 0 40rpx',
									}"
									hover-class="none"
									:disabled="parseInt(currentSkuStock) === 0"
									:border="false"
									shape="rightAngle"
									@click="pointExchange"
								>
									<view class="dz-btn__box">
										<view>
											{{
												parseInt(currentSkuStock) === 0
													? language.product.outOfStock
													: api.formatString(language.product.exchangeByPoints, shopSetting.point_front_name)
											}}
										</view>
										<view class="dz-flex-end">
											<view class="dz-size-32">{{ product.point_exchange }}</view>
											<view class="dz-size-26 dz-m-l-5">{{
												api.formatString(language.product.point, shopSetting.point_front_name)
											}}</view>
										</view>
									</view>
								</dz-button>
							</view>
							<!--积分加钱-->
							<view class="dz-flex-1" v-if="parseInt(product.point_exchange_type) === 2">
								<dz-button
									:custom-style="{
										background: parseInt(currentSkuStock) === 0 ? theme.dzBaseDisabled : theme.dzBaseColor,
										color: theme.dzBaseFontColor,
										width: '100%',
										borderRadius: '40rpx',
									}"
									hover-class="none"
									:disabled="parseInt(currentSkuStock) === 0"
									:border="false"
									shape="rightAngle"
									@click="pointExchange"
								>
									<view class="dz-btn__box">
										<view>{{ parseInt(currentSkuStock) === 0 ? language.product.outOfStock : language.product.directBuy }}</view>
										<view class="dz-flex-end">
											<view class="dz-size-26">
												{{ api.formatString(language.product.needPointTip, product.point_exchange, shopSetting.point_front_name) }}
											</view>
										</view>
									</view>
								</dz-button>
							</view>
							<!--直接购买-->
							<view
								class="dz-flex-1"
								v-if="
									(parseInt(product.point_exchange_type) === 0 ||
										parseInt(product.point_exchange_type) === 1 ||
										parseInt(product.point_exchange_type) === 3 ||
										!product.marketing_type) &&
									product.point_exchange_type != 2 &&
									product.point_exchange_type != 4
								"
							>
								<dz-button
									:custom-style="{
										background: parseInt(currentSkuStock) === 0 ? theme.dzBaseDisabled : theme.dzBaseColor,
										color: theme.dzBaseFontColor,
										width: '100%',
										borderRadius: !cartBtnHide ? '0 40rpx 40rpx 0' : '40rpx',
									}"
									hover-class="none"
									:disabled="parseInt(currentSkuStock) === 0"
									:border="false"
									shape="rightAngle"
									@click="buy"
								>
									<!--有会员折扣-->
									<block v-if="product.memberDiscount && product.memberDiscount.discount && product.memberDiscount.discount > 0">
										<view class="dz-btn__box">
											<view>{{ parseInt(currentSkuStock) === 0 ? language.product.outOfStock : language.product.directBuy }}</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.product.memberDiscount }} {{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">{{ currentPrice }}</view>
											</view>
										</view>
									</block>
									<!--无会员折扣-->
									<block v-else>{{ parseInt(currentSkuStock) === 0 ? language.product.outOfStock : language.product.directBuy }}</block>
								</dz-button>
							</view>
						</block>
					</block>
					<block v-else>
						<!--拼团-->
						<block v-if="product.marketing_type === 'join_buy'">
							<block v-if="parseInt(currentSkuStock) === 0">
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: theme.dzBaseDisabled,
											color: theme.dzBaseFontColor,
											width: '100%',
										}"
										hover-class="none"
										:disabled="true"
										:border="false"
										shape="circle"
									>
										{{ language.product.outOfStock }}
									</dz-button>
								</view>
							</block>
							<block v-else>
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: theme.dzSubColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: '40rpx 0 0 40rpx',
										}"
										hover-class="none"
										:border="false"
										shape="rightAngle"
										@click="buy"
									>
										<view class="dz-btn__box">
											<view>{{ language.product.directBuy }}</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">{{ marketingProductPrice }}</view>
											</view>
										</view>
									</dz-button>
								</view>
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: theme.dzBaseColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: '0 40rpx 40rpx 0',
										}"
										hover-class="none"
										:border="false"
										shape="rightAngle"
										@click="joinBuy"
									>
										<view class="dz-btn__box">
											<view>{{ joinBuyId ? language.product.joinBuys : language.product.joinBuy }}</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">{{ currentPrice }}</view>
											</view>
										</view>
									</dz-button>
								</view>
							</block>
						</block>
						<!--砍价-->
						<block v-else-if="product.marketing_type === 'haggle'">
							<block v-if="parseInt(currentSkuStock) === 0 || parseInt(product.marketing.state) !== 1">
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: theme.dzBaseDisabled,
											color: theme.dzBaseFontColor,
											width: '100%',
										}"
										hover-class="none"
										:disabled="true"
										:border="false"
										shape="circle"
									>
										{{
											parseInt(currentSkuStock) === 0
												? language.product.outOfStock
												: parseInt(product.marketing.state) === 0
												? language.product.startSoon
												: language.product.alreadyOver
										}}
									</dz-button>
								</view>
							</block>
							<block v-else>
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: theme.dzSubColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: '40rpx 0 0 40rpx',
										}"
										hover-class="none"
										:border="false"
										shape="rightAngle"
										@click="buy"
									>
										<view class="dz-btn__box">
											<view>{{ language.product.directBuy }}</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">{{ currentPrice }}</view>
											</view>
										</view>
									</dz-button>
								</view>
								<view class="dz-flex-1">
									<dz-button
										:custom-style="{
											background: theme.dzBaseColor,
											color: theme.dzBaseFontColor,
											width: '100%',
											borderRadius: '0 40rpx 40rpx 0',
										}"
										hover-class="none"
										:border="false"
										shape="rightAngle"
										@click="haggleBuy"
									>
										<view class="dz-btn__box">
											<view>{{ language.product.haggleBudy }}</view>
											<view class="dz-flex-end">
												<view class="dz-size-26">{{ language.product.inviteBargain }} {{ language.application.moneySymbol }}</view>
												<view class="dz-size-32">
													{{ api.toFixed(marketingPrice - (1 - api.toFloat(product.marketing.min_rate / 100)) * marketingPrice, 2) }}
												</view>
											</view>
										</view>
									</dz-button>
								</view>
							</block>
						</block>
						<!--限量购-->
						<block v-else-if="product.marketing_type === 'limited_buy'">
							<view class="dz-flex-1">
								<dz-button
									:custom-style="{
										background:
											parseInt(currentSkuStock) === 0 || parseInt(product.marketing.state) !== 1
												? theme.dzBaseDisabled
												: theme.dzBaseColor,
										color: theme.dzBaseFontColor,
										width: '100%',
									}"
									hover-class="none"
									:disabled="parseInt(currentSkuStock) === 0 || parseInt(product.marketing.state) !== 1"
									:border="false"
									shape="circle"
									@click="limitedBuy"
								>
									<view class="dz-btn__box">
										<view>
											{{
												parseInt(currentSkuStock) === 0
													? language.product.outOfStock
													: parseInt(product.marketing.state) === 0
													? language.product.startSoon
													: parseInt(product.marketing.state) === 2
													? language.product.alreadyOver
													: language.product.limitedBuy
											}}
										</view>
										<view class="dz-flex-end">
											<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
											<view class="dz-size-32">{{ currentPrice }}</view>
										</view>
									</view>
								</dz-button>
							</view>
						</block>
						<!--限时折扣-->
						<block v-else-if="product.marketing_type === 'discount'">
							<view class="dz-flex-1">
								<dz-button
									:custom-style="{
										background:
											parseInt(currentSkuStock) === 0 || parseInt(product.marketing.state) !== 1
												? theme.dzBaseDisabled
												: theme.dzBaseColor,
										color: theme.dzBaseFontColor,
										width: '100%',
									}"
									hover-class="none"
									:disabled="parseInt(currentSkuStock) === 0 || parseInt(product.marketing.state) !== 1"
									:border="false"
									shape="circle"
									@click="discountBuy"
								>
									<view class="dz-btn__box">
										<view>
											{{
												parseInt(currentSkuStock) === 0
													? language.product.outOfStock
													: parseInt(product.marketing.state) === 0
													? language.product.startSoon
													: parseInt(product.marketing.state) === 2
													? language.product.alreadyOver
													: language.product.discountBuy
											}}
										</view>
										<view class="dz-flex-end">
											<view class="dz-size-26">{{ language.application.moneySymbol }}</view>
											<view class="dz-size-32">{{ currentPrice }}</view>
										</view>
									</view>
								</dz-button>
							</view>
						</block>
					</block>
				</view>
			</view>
		</dz-popup>
		<!--底部弹出选择层-->
		<!-- 规格选择 -->
	</view>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted, computed, getCurrentInstance, unref, toRefs } from 'vue';
import { useUserStore } from '@/state/modules/user';

let systemInfo = uni.getSystemInfoSync();
const props = defineProps({
	//产品详情
	productData: {
		type: Object,
		default() {
			return {
				memberDiscount: { discount: 0 },
			};
		},
	},
	//是否直接购买模式，如为true则不显示商品营销信息
	isBuyMode: {
		type: Boolean,
		default: true,
	},
	//拼团信息
	joinBuyInfo: {
		type: Array,
		default() {
			return [];
		},
	},
	//是否显示客服
	customerService: {
		type: Boolean,
		default: false,
	},
	//小程序客服用户信息
	sessionFrom: {
		type: String,
		default: '',
	},
	//是否显示分享按钮
	showShare: {
		type: Boolean,
		default: true,
	},
	//分享数据
	shareData: {
		type: Object,
		default() {
			return {
				shareUrl: '',
				shareTitle: '',
				shareContent: '',
				shareImg: '',
			};
		},
	},
	// H5或者小程序打开指定页面后页面栈为1，这时候无法跳转到上一页，当页面栈为1的时候点击后退按钮跳转到的页面地址
	backRelaunchUrl: {
		type: String,
		default: '/pages/main/index/index',
	},
	//距离顶部的高度
	scrollTop: {
		type: [String, Number],
		default: 0,
	},
	serviceType: {
		type: [String, Number],
		default: 0,
	},
	wxCustomerServicePath: {
		type: String,
		default: '',
	},
});

const proxy = getCurrentInstance()?.proxy ?? null;
const userStore = useUserStore();
const language = uni.$api.language;
const assets = uni.$api.assetsConfig;
const videoRef = ref(null);
const opcity = ref<number>(0); //透明度
const height = ref<number>(64); //header高度
const top = ref<number>(26); //标题图标距离顶部距离
const current = ref<number>(0);
const tabList = ref<array>([
	{
		top: 0,
		name: '商品',
		value: 0,
	},
	{
		top: 0,
		name: '评论',
		value: 1,
	},
	{
		top: 0,
		name: '详情',
		value: 2,
	},
]);
const bannerIndex = ref<number>(0);
const scrollH = ref<number>(0); //滚动总高度
const iconOpcity = ref<number>(0);
const bannerLength = ref<number>(1);
const currentProductPrice = ref<string>(''); //当前显示价格
const collected = ref<boolean>(false);
const currentSkuStock = ref<number>(0);
const currentSkuId = ref<string>('');
const currentSkuPrice = ref<string>('');
const currentSkuName = ref<string>('');
const currentSkuNumber = ref<number>(0);
const currentSkuPicture = ref<string>('');

const marketingPrice = ref<string>('');
const joinBuyId = ref<string>(''); //加入拼团ID
const appShareShow = ref<boolean>(false);
const couponShow = ref<boolean>(false);
const posterShow = ref<boolean>(false);

const marketingProductPrice = ref<string>('0');
const marketingMarketPrice = ref<string>('0');
const warehouseDistribution = ref<boolean>(false); // 是否是云仓分销
const skuPopupShow = ref<boolean>(false);
const joinBuyRuleShow = ref<boolean>(false);
const specList = ref<array>([]); //属性列表
const specChildList = ref<array>([]); //属性内容
const difference = ref<array>([]); //sku列表
const selectArr = ref<array>([]); //存放被选中的值
const subIndex = ref<array>([]); //是否选中 因为不确定是多规格还是但规格，所以这里定义数组来判断

const minNum = ref<number>(1); //当前最小购买数量
const maxNum = ref<number>(0); //当前最大购买数量

const data = reactive<object>({
	product: props.productData,
	//存放要和选中的值进行匹配的数据
	shopItemInfo: {},
	//存放最后选中的商品
	selectShop: {},
	videoContext: null,
});

const theme = computed(() => {
	return userStore.getTheme;
});

const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const cartNum = computed(() => {
	return userStore.getCartNum;
});

const customerServiceUnread = computed(() => {
	return userStore.getCustomerServiceUnread;
});

//计算购买按钮是否不可用
const buyBtnDisabled = computed(() => {
	if (Object.keys(data.product).length === 0) {
		return true;
	}
	return parseInt(currentSkuStock.value || data.product.stock) === 0;
});

//计算购物车按钮是否不显示
const cartBtnHide = computed(() => {
	if (Object.keys(data.product).length === 0) {
		return true;
	}
	return (
		(props.isBuyMode || data.product.marketing_type == '') && (parseInt(data.product.point_exchange_type) > 1 || parseInt(data.product.is_virtual) === 1)
	);
});

//计算当前规格购买价格
const currentPrice = computed(() => {
	if (Object.keys(data.product).length === 0) {
		return 0.0;
	}
	if (props.isBuyMode || !data.product.marketing_type) {
		let price = currentSkuPrice.value || data.product.minSkuPrice;
		//直接购买模式
		if (data.product.memberDiscount && parseFloat(data.product.memberDiscount.discount) > 0) {
			//会员折扣
			return parseFloat(price * (1 - parseFloat(data.product.memberDiscount.discount) / 100)).toFixed(2);
		} else {
			return parseFloat(price).toFixed(2);
		}
	} else {
		//营销模式
		let price;
		if (data.product.marketing_type === 'haggle') {
			//砍价
			price = marketingPrice.value ? marketingPrice.value : data.product.price;
		}
		if (data.product.marketing_type === 'discount') {
			//限时折扣
			const decimal = data.product.marketing && data.product.marketing.decimal_reservation_number;
			const discount = data.product.marketing && data.product.marketing.discount;
			price = currentSkuPrice.value || data.product.minSkuPrice;

			//限时折扣价格保留方式
			switch (parseInt(decimal)) {
				case -1:
					//保留角和分
					price = uni.$api.toFixed((price * discount) / 100, 2);
					break;
				case 0:
					//抹去角和分
					price = Math.floor((price * discount) / 100) * 10;
					price = (Math.round(price * 10) / 100).toFixed(0);
					break;
				case 1:
					//抹去分
					price = uni.$api.toFixed((price * discount) / 100, 1);
					break;
				default:
					price = uni.$api.toFixed((price * discount) / 100, 2);
			}
		}

		if (data.product.marketing_type === 'limited_buy') {
			//限量购
			price = marketingPrice.value ? marketingPrice.value : data.product.marketing.ladder.price;
		}
		if (data.product.marketing_type === 'join_buy') {
			//拼团
			price = marketingPrice.value ? marketingPrice.value : data.product.join_buy_price;
		}
		if (data.product.memberDiscount && parseFloat(data.product.memberDiscount.discount) > 0) {
			price = price * (1 - parseFloat(data.product.memberDiscount.discount) / 100);
		}
		return parseFloat(price || '0').toFixed(2);
	}
});

// 预售金额
const presellPrice = computed(() => {
	if (Object.keys(data.product).length === 0) {
		return 0.0;
	}
	let price = data.product.presell_price;
	price = price > currentPrice.value * currentSkuNumber.value ? currentPrice.value * currentSkuNumber.value : price;
	return parseFloat(price || '0').toFixed(2);
});

watch(
	() => props.scrollTop,
	(val) => {
		if (val < tabList.value[1].top) {
			current.value = 0;
		}
		if (val >= tabList.value[1].top && val < tabList.value[2].top) {
			current.value = 1;
			return;
		}
		if (val >= tabList.value[2].top) {
			current.value = 2;
		}
		let scroll = val <= 0 ? 0 : val;
		let _opcity = scroll / scrollH.value;
		if (opcity.value >= 1 && _opcity >= 1) {
			return;
		}
		opcity.value = _opcity;
		iconOpcity.value = 0.5 * (1 - _opcity < 0 ? 0 : 1 - _opcity);
	}
);

// 获取导航菜单的尺寸
function getSize(el) {
	return new Promise((resolve) => {
		uni.$api.getRect(`.${el}`, false, proxy).then((size) => {
			resolve(size);
		});
	});
}

watch(
	() => props.productData,
	async (val) => {
		if (Object.keys(val).length === 0) {
			return;
		}
		data.product = val;
		//计算轮播图的数量
		bannerLength.value = val.covers.length;
		if (val.video_url) {
			bannerLength.value += 1;
		}
		//判断是否收藏
		collected.value = !!val.myCollect;

		//判断最小购买数量
		if (!props.isBuyMode && val.marketing_type === 'limited_buy') {
			currentSkuNumber.value = minNum.value = val.marketing ? parseInt(val.marketing.min_num) : 1;
		} else {
			currentSkuNumber.value = minNum.value = parseInt(val.min_buy) || 1;
		}

		//判断最大购买数量
		if (!props.isBuyMode) {
			if (val.marketing_type === 'limited_buy') {
				maxNum.value = val.marketing ? parseInt(val.marketing.max_num) : 0;
			} else if (val.marketing_type === 'haggle') {
				maxNum.value = 1;
			} else if (val.marketing_type === 'joinBuy') {
				//TODO 这里应该根据配置来判断最多可以购买多少件
				maxNum.value = 1;
			} else {
				maxNum.value = parseInt(val.max_buy);
			}
		} else {
			maxNum.value = parseInt(val.max_buy);
		}

		//计算当前产品显示金额
		if (props.isBuyMode || !val.marketing_type) {
			//直接购买模式
			let minSkuPrice, maxSkuPrice;
			if (val.memberDiscount && parseFloat(val.memberDiscount.discount) > 0) {
				//会员折扣
				minSkuPrice = parseFloat(parseFloat(val.minSkuPrice) * (1 - parseFloat(val.memberDiscount.discount) / 100)).toFixed(2);
				maxSkuPrice = val.maxSkuPrice ? parseFloat(parseFloat(val.maxSkuPrice) * (1 - parseFloat(val.memberDiscount.discount / 100))).toFixed(2) : 0;
			} else {
				minSkuPrice = parseFloat(val.minSkuPrice).toFixed(2);
				maxSkuPrice = val.maxSkuPrice ? parseFloat(val.maxSkuPrice).toFixed(2) : 0;
			}
			currentProductPrice.value = maxSkuPrice && minSkuPrice !== maxSkuPrice ? minSkuPrice + ' ~ ' + maxSkuPrice : minSkuPrice;
		} else {
			//营销模式
			let price;
			if (val.marketing_type === 'haggle') {
				//砍价
				marketingPrice.value = val.price;
				price = marketingPrice.value ? marketingPrice.value : val.price;
			}
			if (val.marketing_type === 'discount') {
				//限时折扣
				const decimal = val.marketing && val.marketing.decimal_reservation_number;
				const discount = val.marketing && val.marketing.discount;
				price = val.minSkuPrice;
				//限时折扣价格保留方式
				switch (parseInt(decimal)) {
					case -1:
						//保留角和分
						price = uni.$api.toFixed((price * discount) / 100, 2);
						break;
					case 0:
						//抹去角和分
						price = Math.floor((price * discount) / 100) * 10;
						price = (Math.round(price * 10) / 100).toFixed(0);
						break;
					case 1:
						//抹去分
						price = uni.$api.helper.toFixed((price * discount) / 100, 1);
						break;
					default:
						price = uni.$api.helper.toFixed((price * discount) / 100, 2);
				}
			}
			if (val.marketing_type === 'limited_buy') {
				//限量购
				price = val.marketing.min_price;
			}
			if (val.marketing_type === 'join_buy') {
				//拼团
				price = val.join_buy_price;
				marketingProductPrice.value = val.minSkuPrice;
			}
			if (val.memberDiscount && val.memberDiscount.discount > 0) {
				price = price * (1 - val.memberDiscount.discount / 100);
			}
			marketingMarketPrice.value = val.market_price;
			currentProductPrice.value = parseFloat(price || '0').toFixed(2);
		}

		//初始化商品属性
		//这里要做deepclone，否则会触发多次watch
		specList.value = uni.$api.deepClone(val.base_attribute_format);
		specChildList.value = [];
		specList.value.forEach((item) => {
			specChildList.value = [...specChildList.value, ...item.value];
		});
		specList.value.map((item) => {
			selectArr.value.push('');
			subIndex.value.push(-1);
		});
		currentSkuStock.value = val.stock;
		const skus = uni.$api.deepClone(val.sku);
		warehouseDistribution.value = val.warehouseCommissionRate && val.warehouseCommissionRate.is_distribution == 1 && !val.marketing_type;
		let level_id =
			(userInfo.value &&
				userInfo.value.promoter &&
				userInfo.value.promoter.promoterWarehouse &&
				userInfo.value.promoter.promoterWarehouse.state == 1 &&
				userInfo.value.promoter.promoterWarehouse.level_id) ||
			'';

		// 云仓进货价格
		if (warehouseDistribution.value && level_id) {
			const commissionRate = val.warehouseCommissionRate.commission_rate;
			skus.forEach((item) => {
				for (let key in commissionRate) {
					if (item.id == key && commissionRate[key][level_id]) {
						item.price = commissionRate[key][level_id].brokerage > 0 ? commissionRate[key][level_id].brokerage : item.price;
					}
				}
			});
			currentSkuPrice.value = get_min(skus).toFixed(2);
			let minWarehouse = get_min(skus).toFixed(2);
			let maxWarehouse = get_max(skus).toFixed(2);

			if (val.memberDiscount && parseFloat(val.memberDiscount.discount) > 0) {
				//会员折扣
				minWarehouse = parseFloat(parseFloat(minWarehouse) * (1 - parseFloat(val.memberDiscount.discount) / 100)).toFixed(2);
				maxWarehouse = parseFloat(parseFloat(maxWarehouse) * (1 - parseFloat(val.memberDiscount.discount) / 100)).toFixed(2);
			}

			if (skus.length == 1) {
				currentProductPrice.value = minWarehouse;
			} else {
				currentProductPrice.value = minWarehouse + ' ~ ' + maxWarehouse;
			}
		}
		difference.value = skus;
		if (difference.value.length == 1) {
			currentSkuPicture.value = difference.value[0].picture;
			currentSkuPrice.value = difference.value[0].price;
			currentSkuId.value = difference.value[0].id;
			currentSkuName.value = difference.value[0].name;
			currentSkuStock.value = parseInt(difference.value[0].stock);
		}

		difference.value.forEach((item) => {
			item.difference = [];
			item.difference = specIdsFormat(item.data, specChildList.value);
		});
		init();
		val.sku_data = val.sku.length ? val.sku[0].data : '';
		if (val.sku_data) {
			selectSku(specIdsFormat(val.sku_data, specChildList.value));
		}

		setTimeout(async () => {
			const evaluateEl = await getSize('evaluate');
			const productDetailEl = await getSize('dz-product-detail');
			tabList.value[1].top = evaluateEl.top - systemInfo.statusBarHeight - 20;
			tabList.value[2].top = productDetailEl.top - systemInfo.statusBarHeight - 10;
			// #ifndef H5
			tabList.value[1].top = tabList.value[1].top - 38;
			tabList.value[2].top = tabList.value[2].top - 50;
			// #endif
		}, 500);
	},
	{
		immediate: true,
	}
);

onMounted(async () => {
	await uni.$onLaunched;
	let obj = {};
	// #ifdef MP-WEIXIN
	obj = wx.getMenuButtonBoundingClientRect();
	// #endif
	// #ifdef MP-BAIDU
	obj = swan.getMenuButtonBoundingClientRect();
	// #endif
	// #ifdef MP-ALIPAY
	my.hideAddToDesktopMenu();
	// #endif

	// this.width = obj.left || systemInfo.windowWidth;
	height.value = obj.top ? obj.top + obj.height + 8 : systemInfo.statusBarHeight + 48;
	top.value = obj.top ? obj.top + (obj.height - 36) / 2 : systemInfo.statusBarHeight + (systemInfo.statusBarHeight > 0 ? 10 : 0);
	scrollH.value = systemInfo.windowWidth;
	if (userStore.hasLogin) {
		getMemberInfo();
	}
	data.videoContext = uni.createVideoContext('productVedio');
	if (uni.$api.h5IsWechat()) {
		const video = document.querySelectorAll('video')[0];
		uni.$api.wxHelper.wxVideoPlay(window.location.href, video);
	}
});

// 初始化
function init() {
	// 清空之前的数据
	selectArr.value = [];
	subIndex.value = [];
	data.selectShop = {};
	data.shopItemInfo = {};
	specList.value.map(() => {
		selectArr.value.push('');
		subIndex.value.push(-1);
	});
	checkItem(); //计算sku里面规格形成路径
	checkInpath(-1); //传-1是为了不跳过循环
}

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

//后退按钮点击事件
function backClick(type) {
	let pages = getCurrentPages();
	if (pages.length == 1 || type == 2) {
		let indexPath = props.backRelaunchUrl ? props.backRelaunchUrl : uni.$api.appConfig.indexPath;
		uni.reLaunch({
			url: indexPath,
		});
	} else {
		uni.navigateBack();
	}
}

//分享按钮点击事件
function shareClick() {
	// #ifdef H5
	if (shopSetting.value.product_poster_is_open != 1) {
		h5Share();
		return;
	}
	// #endif
	appShareShow.value = true;
}

function h5Share() {
	let url = props.shareData.shareUrl;

	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		uni.$api.toast(uni.$api.language.application.wxshareTip);
	} else {
		if (url) {
			uni.$api.copy(url);
			uni.$api.toast(uni.$api.language.application.shareUrlCopySuccess);
		}
	}
}

function tabChange(e: any) {
	uni.pageScrollTo({
		scrollTop: e.value == 0 ? e.top : e.top + 1,
	});
}

//产品图片轮播事件
function bannerChange(e) {
	bannerIndex.value = e.detail.current;
}

function videoEnded(e) {
	data.videoContext.seek(0);
}

//预览产品图片
function previewBanner(e) {
	let index = e.currentTarget.dataset.index;
	uni.previewImage({
		current: data.product.covers[index],
		urls: data.product.covers,
	});
}

//新窗口播放产品视频
function vedioPlay() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.vedio,
		query: {
			url: encodeURIComponent(JSON.stringify(data.product.video_url)),
		},
	});
}

//需要登录
function login() {
	uni.navigateTo({
		url: uni.$api.routesConfig.login.path,
		animationType: 'slide-in-bottom',
	});
}

//收藏
function collectClick() {
	if (!data.product.id) return;
	if (!userStore.hasLogin) {
		login();
	} else {
		//节流防抖
		uni.$api.throttle(() => {
			collected.value ? handleCollectDel() : handleCollectCreate();
		}, 500);
	}
}

// 收藏商品
async function handleCollectCreate() {
	await uni.$api.http
		.post(uni.$api.apiMember.collectCreate, {
			topic_id: data.product.id,
			topic_type: 'product',
		})
		.then((res) => {
			uni.$api.toast(uni.$api.language.product.collectSuccess);
			data.product.myCollect = res.data;
			collected.value = true;
		});
}
// 取消收藏商品
async function handleCollectDel() {
	await uni.$api.http
		.delete(
			uni.$api.apiMember.collectDelete,
			{},
			{
				params: {
					id: data.product.myCollect.id,
				},
			}
		)
		.then(() => {
			uni.$api.toast(uni.$api.language.product.collectCancel);
			collected.value = false;
		});
}

function posterClick() {
	posterShow.value = true;
}

//弹出优惠券
function coupon() {
	couponShow.value = true;
}

//组合商品
function combinationClick(id: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.combinationList,
		query: {
			id,
		},
	});
}

//获取优惠券
async function getCoupon(item: any, index: number) {
	if (!userStore.hasLogin) {
		login();
		return;
	}

	await uni.$api.http
		.post(uni.$api.apiShop.couponCreate, {
			id: item.id,
		})
		.then((res) => {
			if (data.product.canReceiveCoupon[index]) {
				if (!item.myGet) {
					data.product.canReceiveCoupon[index].myGet = {
						count: 1,
					};
				} else {
					data.product.canReceiveCoupon[index].myGet.count = parseInt(item.myGet.count) + 1;
				}
				if (
					parseInt(data.product.canReceiveCoupon[index].max_fetch) > 0 &&
					data.product.canReceiveCoupon[index].myGet &&
					data.product.canReceiveCoupon[index].myGet.count == parseInt(data.product.canReceiveCoupon[index].max_fetch)
				) {
					data.product.canReceiveCoupon[index].is_get = 0;
				} else {
					data.product.canReceiveCoupon[index].is_get = 1;
				}
			}
			uni.$api.toast(uni.$api.language.product.couponGetSuccess);
		});
}

//加入购物车
async function addToCart() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	await uni.$api.http
		.post(uni.$api.apiMember.cartItemCreate, {
			sku_id: currentSkuId.value,
			num: currentSkuNumber.value,
		})
		.then(() => {
			uni.$api.toast(uni.$api.language.product.addToCartSuccess);
			skuPopupShow.value = false;
			//购物车页面打开的情况下发送事件
			if (userStore.cartPageListen) {
				uni.$emit('cartNumChange', {});
			} else {
				getCartCount();
			}
		});
}

//获取购物车数量
async function getCartCount() {
	await uni.$api.http.get(uni.$api.apiMember.cartItemCount).then((res) => {
		userStore.setCartNum(res.data.count);
	});
}

//预售
async function preSell() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	let params = {};
	params.type = 'presell_buy';
	params.data = JSON.stringify({ sku_id: currentSkuId.value, num: currentSkuNumber.value });
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	skuPopupShow.value = false;
}

//评价
function evaluationClick() {
	if (!data.product.evaluateStat || (data.product.comment_num && parseInt(data.product.comment_num) === 0)) {
		return;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig.evaluationList,
		query: {
			ratio: data.product.match_ratio,
			...data.product.evaluateStat,
		},
	});
}

function showPopup() {
	if (parseInt(data.product.stock) === 0) {
		return;
	}
	skuPopupShow.value = true;
}

//客服
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
		if (userStore.hasLogin) {
			let params = {
				source: encodeURIComponent(data.product.name),
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
			corpId: corpId,
			showMessageCard: true,
			sendMessageTitle: data.product.name,
			sendMessageImg: data.product.picture,
			sendMessagePath: props.wxCustomerServicePath,
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

//积分换购
function pointExchange() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	let params = {};
	params.type = 'point_exchange';
	params.point_exchange_type = data.product.point_exchange_type;
	params.data = JSON.stringify({
		sku_id: currentSkuId.value,
		num: currentSkuNumber.value,
	});
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	skuPopupShow.value = false;
}

//直接购买
function buy() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	let params = {};
	params.type = 'buy_now';
	params.data = JSON.stringify({
		sku_id: currentSkuId.value,
		num: currentSkuNumber.value,
	});
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	skuPopupShow.value = false;
}

//开团/入团购买
async function joinBuy() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	let params = {};
	params.type = 'join_buy';
	params.join_buy_product_id = data.product.marketing.id;
	params.join_buy_id = joinBuyId.value; //入团ID
	params.data = JSON.stringify({ sku_id: currentSkuId.value, num: currentSkuNumber.value });
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	skuPopupShow.value = false;
}
//加入拼团
async function joinBuyClick(id) {
	joinBuyId.value = id;
	showPopup();
}

function joinBuyShowPopup() {
	joinBuyId.value = '';
	showPopup();
}

//发起砍价
async function haggleBuy() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	let params = {};
	params.type = 'haggle';
	params.data = JSON.stringify({ sku_id: currentSkuId.value });
	//选择物流方式和物流地址
	uni.$api.router.push({
		route: uni.$api.routesConfig.haggleAddress,
		query: {
			data: JSON.stringify(params),
			shipping_type: data.product.shipping_type,
			product: JSON.stringify(data.product.marketing),
		},
	});
	skuPopupShow.value = false;
}

//限量购
async function limitedBuy() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	let params = {};
	params.type = 'limited_buy';
	params.limited_buy_id = data.product.marketing.id;
	params.data = JSON.stringify({ sku_id: currentSkuId.value, num: currentSkuNumber.value });
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	skuPopupShow.value = false;
}

//限时折扣/秒杀购买
async function discountBuy() {
	if (!userStore.hasLogin) {
		login();
		return;
	}
	if (!currentSkuId.value) {
		uni.$api.toast(uni.$api.language.product.choiceProductAttribute);
		return;
	}
	let params = {};
	params.type = 'discount';
	params.data = JSON.stringify({ sku_id: currentSkuId.value, num: currentSkuNumber.value });
	uni.$api.router.push({
		route: uni.$api.routesConfig.orderCreate,
		query: {
			data: encodeURIComponent(JSON.stringify(params)),
		},
	});
	skuPopupShow.value = false;
}

// 营销商品跳转
function marketingTab() {
	const url = uni.$api.dataConfig.marketingType[data.product.marketing_type].path;
	const params = {
		id: data.product.id,
	};
	if (url == 'discountProduct') {
		params.marketing_id = data.product.marketing.discount_id;
	}
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
		query: params,
	});
}

function get_min(list: []): string {
	return Math.min.apply(
		Math,
		list.map((item) => {
			return parseFloat(item.price);
		})
	);
}

function get_max(list: []): string {
	return Math.max.apply(
		Math,
		list.map((item) => {
			return parseFloat(item.price);
		})
	);
}

/* 主动方法 - 设置sku */
function selectSku(arr = []) {
	let skuArr = arr;
	let specListArr = specList.value;
	if (skuArr && specListArr.length === skuArr.length) {
		// 先清空
		let skuClickArr = [];
		let clickKey = true;
		for (let index = 0; index < skuArr.length; index++) {
			let skuName = skuArr[index];
			let specList = specChildList.value;
			let index1 = index;
			let index2 = getListIndex(specList, 'title', skuName);
			if (index2 == -1) {
				clickKey = false;
				break;
			}
			skuClickArr.push({
				spec: specList[index2],
				index1: index1,
				index2: index2,
			});
		}
		if (clickKey) {
			init();
			skuClickArr.map((item) => {
				skuClick(item.spec, item.index1, item.index2);
			});
		}
	}
}

function getListIndex(list: [], key: string, value: string): number {
	let index = -1;
	for (let i = 0; i < list.length; i++) {
		if (list[i][key] === value) {
			index = i;
			break;
		}
	}
	return index;
}

function specIdsFormat(sku: array, list: array): array {
	let arr = [];
	let sotr = [];
	let skuIds = sku.split('-');
	sotr = list.filter((item) => skuIds.indexOf(item.id + '') > -1);
	if (sotr.length > 0) {
		sotr.forEach((item) => {
			arr.push(item.title);
		});
	}
	return arr;
}

function skuClick(value, index1, index2, type) {
	let list = specChildList.value;
	data.selectshop = {};
	currentSkuId.value = '';
	currentSkuName.value = '';
	if (value.ishow) {
		if (selectArr.value[index1] != value.title) {
			selectArr.value[index1] = value.title;
			subIndex.value[index1] = index2;
		} else {
			selectArr.value[index1] = '';
			subIndex.value[index1] = -1;
		}
		checkInpath(index1);
		//如果全部选完
		if (selectArr.value.every((item) => item != '')) {
			data.selectshop = data.shopItemInfo[selectArr.value];
			currentSkuPicture.value = data.selectshop.picture;
			currentSkuStock.value = parseInt(data.selectshop.stock);
			currentSkuPrice.value = data.selectshop.join_buy_price;

			if (!props.isBuyMode && data.product.marketing_type === 'join_buy') {
				//拼团
				marketingPrice.value = data.product.commission_price ? data.product.commission_price : data.selectshop.join_buy_price;
				marketingProductPrice.value = data.selectshop.price;
			} else if (!props.isBuyMode && data.product.marketing_type === 'haggle') {
				marketingPrice.value = data.selectshop.price;
				marketingMarketPrice.value = data.selectshop.market_price;
			} else if (!props.isBuyMode && data.product.marketing_type === 'limited_buy') {
				marketingPrice.value = data.selectshop.limited_buy_price;
				marketingMarketPrice.value = data.selectshop.limited_buy_price;
			} else {
				currentSkuPrice.value = data.product.commission_price ? data.product.commission_price : data.selectshop.price;
			}
			currentSkuId.value = data.selectshop.id;
			currentSkuName.value = data.selectshop.name;
		} else {
			if (!props.isBuyMode && data.product.marketing_type === 'join_buy') {
				marketingPrice.value = data.product.commission_price;
				marketingProductPrice.value = data.product.minSkuPrice;
				currentSkuStock.value = data.product.stock;
			} else if (!props.isBuyMode && data.product.marketing_type === 'haggle') {
				marketingPrice.value = data.product.commission_price ? data.product.commission_price : data.product.price;
				marketingMarketPrice.value = data.product.market_price;
				currentSkuStock.value = data.product.stock;
			} else if (!props.isBuyMode && data.product.marketing_type === 'limited_buy') {
				marketingPrice.value = data.product.commission_price ? data.product.commission_price : data.product.price;
				marketingMarketPrice.value = data.product.limited_buy_price;
				currentSkuStock.value = data.product.stock;
			} else {
				currentSkuPrice.value = warehouseDistribution.value ? get_min(difference.value) : data.product.commission_price;
				currentSkuStock.value = data.product.stock;
			}
		}
	}
}

function checkInpath(clickIndex: string) {
	//循环所有属性判断哪些属性可选
	//当前选中的兄弟节点和已选中属性不需要循环
	for (let i = 0, len = specList.value.length; i < len; i++) {
		if (i == clickIndex) {
			continue;
		}
		let len2 = specList.value[i].value.length;
		for (let j = 0; j < len2; j++) {
			if (subIndex.value[i] != -1 && j == subIndex.value[i]) {
				continue;
			}
			let choosed_copy = [...selectArr.value];
			choosed_copy[i] = specList.value[i].value[j].title;
			let choosed_copy2 = choosed_copy.filter((item) => item !== '' && typeof item !== 'undefined');
			if (data.shopItemInfo.hasOwnProperty(choosed_copy2)) {
				specList.value[i].value[j].ishow = true;
			} else {
				specList.value[i].value[j].ishow = false;
			}
		}
	}
}

function checkItem() {
	//计算有多小种可选路径
	difference.value.reduce(
		(arrs, items) => {
			return arrs.concat(
				items.difference.reduce(
					(arr, item) => {
						return arr.concat(
							arr.map((item2) => {
								//利用对象属性的唯一性实现二维数组去重
								if (!data.shopItemInfo.hasOwnProperty([...item2, item])) {
									data.shopItemInfo[[...item2, item]] = items;
								}
								return [...item2, item];
							})
						);
					},
					[[]]
				)
			);
		},
		[[]]
	);
}

function previewImgs(img: string, imgList: array) {
	// 预览图片
	uni.previewImage({
		current: img,
		urls: imgList,
	});
}

//购物车
function cartTap() {
	uni.$api.router.push({
		route: uni.$api.routesConfig.cart,
	});
}

//营销活动开始
function marketingStart() {
	data.product.marketing.state = 1;
}
//营销活动结束
function marketingEnd() {
	data.product.marketing.state = 2;
}

//预售规则说明
function presellRuleClick() {
	// presellRuleShow = true;
}
function hidePresellRule() {
	// presellRuleShow = false;
}
//拼团规则说明
function joinBuyRuleClick() {
	joinBuyRuleShow.value = true;
}
function hideJoinBuyRule() {
	joinBuyRuleShow.value = false;
}

const { product, initialTime } = { ...toRefs(data) };
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 110rpx;
}

.dz-header-box {
	width: 100%;
	position: fixed;
	left: 0;
	top: 0;
	z-index: 977;
}

.dz-bar-line::after {
	content: '';
	position: absolute;
	// border-bottom: 1rpx solid $dz-border-color;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	bottom: 0;
	right: 0;
	left: 0;
}

.dz-header {
	width: 100%;
	/* #ifdef H5 */
	height: 48px;
	/* #endif */
	/* #ifndef H5 */
	height: 64px;
	/* #endif */
	display: flex;
	align-items: center;
	justify-content: center;
}

.dz-title {
	width: 45%;
	// margin-top: -18rpx;
	margin-left: 20rpx;
	// font-size: 32rpx;
	/* #ifdef H5 */
	// line-height: 44px;
	/* #endif */
	/* #ifndef H5 */
	// line-height: 64px;
	/* #endif */
	// text-align: center;
	// font-weight: 500;
	// align-items: center;
	// justify-content: center;
}

.dz-header-icon {
	position: fixed;
	top: 0;
	left: 10px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	/* #ifdef H5 */
	height: 48px;
	/* #endif */
	/* #ifndef H5 */
	height: 64px;
	/* #endif */
	transform: translateZ(0);
	z-index: 978;
}

.dz-header-icon .dz-badge {
	// background: $dz-type-error !important;
	position: absolute;
	right: -4px;
}

.dz-icon-ml {
	margin-left: 20rpx;
}

.dz-icon-box {
	position: relative;
	height: 32px !important;
	width: 32px !important;
	padding: 8px !important;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dz-banner-swiper {
	position: relative;
}

.dz-banner-tag {
	position: absolute;
	color: #fff;
	bottom: 30rpx;
	right: 20rpx;
}

.dz-video__box {
	width: 180rpx;
	height: 60rpx;
	position: absolute;
	left: 50%;
	bottom: 50rpx;
	transform: translateX(-50%);
	z-index: 2;
}

.dz-video__box image {
	width: 180rpx;
	height: 60rpx;
}
.dz-video__box view {
	width: 100%;
	height: 100%;
	font-size: 22rpx;
	position: absolute;
	left: 0;
	top: 0;
	display: flex;
	align-items: center;
	padding-left: 66rpx;
	box-sizing: border-box;
}

.dz-slide-image {
	width: 100%;
	display: block;
}

/*顶部菜单*/

.dz-menu-box {
	box-sizing: border-box;
}

.dz-menu-header {
	font-size: 34rpx;
	color: #fff;
	height: 32px;
	display: flex;
	align-items: center;
}

.dz-menu-itembox {
	color: #fff;
	padding: 40rpx 10rpx 0 10rpx;
	box-sizing: border-box;
	display: flex;
	flex-wrap: wrap;
	font-size: 26rpx;
}

.dz-menu-item {
	width: 22%;
	height: 160rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	background: rgba(0, 0, 0, 0.4);
	margin-right: 4%;
	margin-bottom: 4%;
}

.dz-menu-item:nth-of-type(4n) {
	margin-right: 0;
}

.dz-badge-box {
	position: relative;
}

.dz-badge-box .dz-badge-class {
	position: absolute;
	top: -8px;
	right: -8px;
}

.dz-msg-badge {
	top: -10px;
}

.dz-icon-up_box {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dz-menu-text {
	padding-top: 12rpx;
}

.dz-opcity .dz-menu-text,
.dz-opcity .dz-badge-box {
	opacity: 0.5;
	transition: opacity 0.2s ease-in-out;
}

/*顶部菜单*/

/*内容 部分*/

.dz-padding {
	padding: 0 30rpx;
	box-sizing: border-box;
}

.dz-ml-auto {
	margin-left: auto;
}

/* #ifdef H5 */
.dz-ptop {
	padding-top: 44px;
}

/* #endif */

.dz-size {
	font-size: 24rpx;
	line-height: 24rpx;
}

.dz-gray {
	color: $dz-tips-color;
}

.dz-icon-dark {
}

.dz-border-radius {
	border-bottom-left-radius: 24rpx;
	border-bottom-right-radius: 24rpx;
	overflow: hidden;
}

.dz-radius-all {
	border-radius: 24rpx;
	overflow: hidden;
}

.dz-mtop {
	margin-top: 20rpx;
}

.dz-pro-detail {
	box-sizing: border-box;
	color: $dz-main-color;
}

.dz-product-title {
	background: #fff;
}

.dz-product-detail {
	margin-top: 20rpx;
	padding: 10rpx 0 20rpx 0;
	background: #fff;
}

.dz-marketing-title {
	padding: 0;
}

.dz-marketing-price {
	width: 100%;
	display: flex;
}

.dz-marketing-pricebox {
	padding: 30rpx 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	font-size: 26rpx;
	line-height: 26rpx;
	flex-shrink: 0;
}

.dz-marketing-presale {
	width: 100%;
}

.dz-marketing-left {
	width: 540rpx;
}

.dz-marketing-right {
	flex: 1;
	font-size: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.dz-marketing-right text {
	text-align: center;
	padding-bottom: 12rpx;
}

.dz-marketing-pro-price {
	display: flex;
	align-items: flex-end;
}

.dz-marketing-original-price {
	font-size: 26rpx;
	line-height: 26rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
	text-decoration: line-through;
}

.dz-marketing-sold {
	margin-top: 10rpx;
	width: 100%;
	padding-left: 4rpx;
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
}

.dz-marketing-sold text {
	width: 70%;
}

.dz-marketing-tag {
	display: flex;
}

.dz-pro-pricebox {
	padding-top: 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 36rpx;
	line-height: 44rpx;
}

.dz-pro-price {
	display: flex;
	align-items: center;
}

.dz-price {
	font-size: 52rpx;
	font-weight: 500;
}

.dz-original-price {
	font-size: 26rpx;
	line-height: 26rpx;
	padding: 10rpx 30rpx;
	box-sizing: border-box;
}

.dz-line-through {
	text-decoration: line-through;
}

.dz-collection {
	color: $dz-main-color;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: center;
	height: 44rpx;
}

.dz-scale-collection {
	transform: scale(0.7);
	transform-origin: center 90%;
	line-height: 24rpx;
	font-weight: normal;
	margin-top: 4rpx;
}

.dz-pro-titbox {
	font-size: 32rpx;
	font-weight: 500;
	position: relative;
	padding: 0 30rpx;
	box-sizing: border-box;
}

.dz-pro-title {
	padding-top: 20rpx;
	.dz-tag {
		vertical-align: middle;
	}
}
.product-name {
	font-size: 32rpx;
	font-weight: 700;
}

.dz-marketing-type {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10rpx 20rpx;
	background: #fdf9ed;
	border-radius: 10rpx;
}

.dz-transparent-btn {
	display: block;
	background: transparent;
	margin: 0;
	padding: 0;
	border-radius: 0;
	border: 0;
	width: 90rpx !important;
}

.dz-transparent-btn::after {
	border: 0;
}

.dz-poster-box {
	padding: 15rpx;
}

.dz-poster-position {
	position: absolute;
	right: 0;
	top: 0rpx;
}

.dz-poster-text {
	padding-left: 8rpx;
}

.dz-sub-title {
	padding: 20rpx 0;
	line-height: 32rpx;
}

.dz-sale-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-top: 30rpx;
}

.dz-discount-box {
	background: #fff;
}

.dz-list-cell {
	width: 100%;
	position: relative;
	display: flex;
	align-items: center;
	font-size: 26rpx;
	line-height: 26rpx;
	padding: 36rpx 30rpx;
	box-sizing: border-box;
}

.dz-right {
	position: absolute;
	right: 30rpx;
	top: 30rpx;
}

.dz-top40 {
	top: 40rpx !important;
}

.dz-bold {
	font-weight: bold;
}

.dz-list-cell::after {
	content: '';
	position: absolute;
	// border-bottom: 1rpx solid $dz-border-color;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
	bottom: 0;
	right: 0;
	left: 126rpx;
}

.dz-list-cell:last-child::after {
	border-bottom: 0 !important;
}

.dz-flex-center {
	display: flex;
	align-items: center;
}

.dz-cell-title {
	width: 90rpx;
	padding-right: 30rpx;
	flex-shrink: 0;
	color: $dz-tips-color;
}

.dz-list-cell-attributes {
	padding: 0rpx;
}

.dz-cell-title-attributes {
	width: 170rpx;
}

.dz-promotion-box {
	display: flex;
	align-items: center;
	padding: 10rpx 0;
	width: 90%;
}

.dz-promotion-box text {
	line-height: 30rpx;
}

.dz-basic-info {
	background: #fff;
}

.dz-addr-box {
	width: 76%;
}

.dz-addr-item {
	padding: 10rpx;
	line-height: 34rpx;
}

.dz-guarantee {
	display: flex;
	flex-wrap: wrap;
	padding: 20rpx 30rpx 30rpx 30rpx;
	font-size: 24rpx;
}

.dz-guarantee-item {
	color: $dz-tips-color;
	padding-right: 30rpx;
	padding-top: 10rpx;
}

.dz-pl {
	padding-left: 4rpx;
}

.dz-cmt-box {
	background: #fff;
}

.dz-between {
	justify-content: space-between !important;
}

.dz-cmt-all {
	padding-right: 8rpx;
}

.dz-evaluate-box {
	display: flex;
	padding: 20rpx 30rpx;
	.portrait {
		flex-shrink: 0;
		width: 80rpx;
		height: 80rpx;
		border-radius: 80rpx;
	}
	.right {
		flex: 1;
		display: flex;
		flex-direction: column;
		font-size: 28rpx;
		color: $dz-content-color;
		padding-left: 26rpx;
		.con {
			font-size: 28rpx;
			color: $dz-main-color;
		}
		.bot {
			display: flex;
			justify-content: space-between;
			font-size: 24rpx;
			// color: $dz-light-color;
		}
		.name {
			align-items: center;
			display: flex;
			justify-content: space-between;
		}
	}
}

.dz-cmt-content {
	padding: 20rpx 20rpx;
	font-size: 26rpx;
}

.dz-cmt-user {
	display: flex;
	align-items: center;
}

.dz-acatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 30rpx;
	display: block;
	margin-right: 16rpx;
}

.dz-cmt {
	padding: 14rpx 0;
}

.dz-attr {
	font-size: 24rpx;
	color: $dz-tips-color;
	padding: 6rpx 0;
}

.dz-cmt-btn {
	padding: 30rpx 0 30rpx 0;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dz-nomore-box {
	padding-top: 10rpx;
}

.dz-product-img,
._block {
	display: flex;
	flex-direction: column;
	transform: translateZ(0);
	/* #ifdef APP-PLUS || MP  */
	font-size: 0;
	/* #endif */
}

.dz-product-img image {
	width: 100%;
	display: block;
	float: left;
	vertical-align: bottom;
	font-size: 0;
	overflow: hidden;
	display: flex;
}

.dz-product-img ._img img,
._img,
img {
	font-size: 0;
	width: 100%;
	display: block !important;
	float: left;
	vertical-align: bottom;
	overflow: hidden;
	display: flex;
}
::v-deep ._img {
	display: block !important;
	width: 100%;
}

/*底部操作栏*/

.dz-col-7 {
	width: 70%;
}

.dz-col-3 {
	width: 30%;
}

.dz-col-1-5 {
	width: 15%;
}

.dz-col-8-5 {
	width: 85%;
}

.dz-operation-ios {
	width: 100%;
	position: fixed;
	z-index: 10;
	bottom: 0;
	left: 0;
	background: #fff;
}

.dz-operation {
	width: 100%;
	height: 108rpx;
	background: #fff;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: env(safe-area-inset-bottom);
}

.dz-safearea-bottom {
	width: 100%;
	height: env(safe-area-inset-bottom);
}

.dz-operation::before {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	border-top: 1rpx solid $dz-border-color;
	-webkit-transform: scaleY(0.5);
	transform: scaleY(0.5);
}

.dz-operation-left {
	display: flex;
	align-items: center;
}

.dz-operation-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	position: relative;
}

.dz-operation-text {
	font-size: 22rpx;
	color: $dz-main-color;
}

.dz-opacity {
	opacity: 0.5;
}

.dz-scale-small {
	transform: scale(0.9);
	transform-origin: center center;
}

.dz-operation-right {
	height: 100rpx;
	padding: 7rpx 24rpx 7rpx 0;
}

.dz-right-flex {
	display: flex;
	align-items: center;
	justify-content: center;
}

.dz-flex-1 {
	flex: 1;
}

.dz-btn__box {
	height: 98rpx;
	font-size: 26rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-direction: column;
	line-height: 28rpx;
	padding: 18rpx 0 14rpx 0;
	box-sizing: border-box;
}

.dz-size-26 {
	font-size: 24rpx;
	line-height: 24rpx;
	padding-top: 4rpx;
}

.dz-size-32 {
	font-size: 32rpx;
	line-height: 28rpx;
	// font-weight: 300;
}

.dz-size-36 {
	font-size: 36rpx;
	line-height: 34rpx;
	font-weight: 500;
}

.dz-flex-end {
	display: flex;
	align-items: flex-end;
}

/*底部操作栏*/

/*底部选择弹层*/

.dz-popup-class {
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	padding-bottom: env(safe-area-inset-bottom);
}

.dz-popup-box {
	position: relative;
	padding: 30rpx 0 100rpx 0;
}

.dz-popup-btn {
	width: 100%;
	position: absolute;
	left: 0;
	bottom: 0;
}

.dz-product-box {
	display: flex;
	align-items: flex-start;
	font-size: 24rpx;
	padding-bottom: 30rpx;
}

.dz-popup-img {
	height: 200rpx;
	width: 200rpx;
	flex-shrink: 0;
	border-radius: 20rpx;
	display: block;
	background-color: $dz-bg-color;
}

.dz-popup-price {
	padding-left: 20rpx;
	padding-bottom: 8rpx;
}

.dz-popup-title {
	line-height: 1.4;
	font-size: 28rpx;
	width: 430rpx;
	color: $dz-main-color;
}

.dz-amount {
	font-size: 36rpx;
}

.dz-number {
	font-size: 24rpx;
	line-height: 24rpx;
	padding-top: 16rpx;
	color: $dz-tips-color;
}

.dz-popup-scroll {
	max-height: calc(60vh - 220rpx);
	font-size: 26rpx;
}

.dz-scrollview-box {
	padding: 0 30rpx 60rpx 30rpx;
	box-sizing: border-box;
}

.dz-attr-title {
	padding: 10rpx 0;
	color: $dz-main-color;
}

.dz-attr-box {
	font-size: 0;
	padding: 20rpx 0;
}

.dz-attr-item {
	max-width: 100%;
	min-width: 64rpx;
	height: 64rpx;
	display: -webkit-inline-flex;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: #f7f7f7;
	padding: 0 26rpx;
	box-sizing: border-box;
	border-radius: 10rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;
	font-size: 26rpx;
}
.attr-color {
	width: 35rpx;
	height: 35rpx;
	margin-right: 10rpx;
	border-radius: 6rpx;
}

.dz-attr-active {
	background: #fff !important;
	font-weight: bold;
	position: relative;
}

.dz-attr-active::after {
	content: '';
	position: absolute;
	border-width: 1rpx;
	border-style: solid;
	width: 100%;
	height: 100%;
	border-radius: 10rpx;
	left: 0;
	top: 0;
}

.dz-disabled {
	color: #d1d1d1 !important;
	background: #f8f8f8 !important;
}

.dz-sku {
	position: relative;
	width: 194rpx;
	background: #f7f7f7;
	border-radius: 20rpx;
	border: 1px solid #f7f7f7;
	.sku-name {
		text-align: center;
		margin: 15rpx 10rpx;
		font-size: 24rpx;
	}
	.icon {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 16rpx;
		right: 16rpx;
		width: 46rpx;
		height: 46rpx;
		border-radius: 23rpx;
		background: rgba(17, 17, 17, 0.7);
	}
}

.dz-pic-disabled {
	position: relative;
}
.dz-pic-disabled::after {
	content: '';
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 10rpx;
	background: rgba(243, 244, 246, 0.6);
	left: 0;
	top: 0;
}

.dz-attr-image-item {
	width: 90rpx;
	height: 90rpx;
	display: -webkit-inline-flex;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	// background: $dz-bg-color;
	padding: 0 26rpx;
	box-sizing: border-box;
	border-radius: 10rpx;
	margin-right: 20rpx;
	margin-bottom: 20rpx;

	.image {
		width: 90rpx;
		height: 90rpx;
	}
}

.dz-number-content {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx 30rpx 30rpx;
	box-sizing: border-box;
	margin-bottom: env(safe-area-inset-bottom);
}
/*底部选择弹层*/

/*拼团*/
.dz-group-swiper {
	width: 100%;
	background-color: #fff;
}

.dz-group-swiper-sigle {
	height: 156rpx;
}

.dz-group-swiper-multi {
	height: 312rpx;
}

.dz-group-user {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 35rpx 40rpx;
	box-sizing: border-box;
}

.dz-user-left {
	font-size: 30rpx;
	display: flex;
	align-items: center;
}

.dz-user-left image {
	height: 80rpx;
	width: 80rpx;
	flex-shrink: 0;
	border-radius: 50%;
	margin-right: 16rpx;
}

.dz-user-right {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.dz-user-anme {
	max-width: 160rpx;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.dz-group-num {
	font-size: 26rpx;
	line-height: 26rpx;
	padding-bottom: 12rpx;
}

.dz-user-countdown {
	padding-right: 18rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.dz-sub-title {
	font-size: 28rpx;
	padding-right: 30rpx;
}
.dz-group-countdown {
	display: flex;
	align-items: center;
	font-size: 24rpx;
	// color: $dz-content-color;
	white-space: nowrap;
}

.dz-countdown-right {
	padding-right: 6rpx;
}

.dz-countdown-left {
	padding-left: 6rpx;
}

.dz-step__box {
	width: 100%;
	height: 210rpx;
	background: #fff;
	padding: 0 60rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-sizing: border-box;
}

.dz-step-item {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	font-size: 26rpx;
	color: $dz-content-color;
}

.dz-step-item image {
	width: 64rpx;
	height: 55rpx;
	flex-shrink: 0;
}

.dz-step-item image:first-child {
	width: 60rpx !important;
}

.dz-step-arrow {
	height: 90rpx;
}

.dz-step-arrow image {
	width: 11rpx;
	height: 20rpx;
	flex-shrink: 0;
}

.dz-step-text {
	line-height: 26rpx;
	padding-top: 24rpx;
}

.dz-modal__title {
	text-align: center;
	font-weight: bold;
	font-size: 36rpx;
	padding-bottom: 8rpx;
}
.dz-modal__p {
	font-size: 26rpx;
	color: $dz-tips-color;
	padding-top: 20rpx;
}
.dz-modal__btn {
	width: 100%;
	padding: 60rpx 0 20rpx;
	display: flex;
	justify-content: center;
}
/*拼团*/

/*组合套餐*/
.combination-list {
	white-space: nowrap;
	margin: 20rpx;
	.combination-item {
		display: inline-block;
		font-size: 24rpx;
		margin-right: 20rpx;
		// border-right: 1rpx solid rgba(0, 0, 0, 0.1);
		.combination-product-item {
			display: inline-block;
			margin-right: 20rpx;
			position: relative;
			border-radius: 15rpx;
			overflow: hidden;
			.combination-product-img {
				width: 180rpx;
				height: 180rpx;
				border-radius: 15rpx;
				overflow: hidden;
			}
			.combination-product-price {
				width: 100%;
				text-align: center;
				background-color: rgba(0, 0, 0, 0.4);
				position: absolute;
				border-bottom-left-radius: 6rpx;
				bottom: 0;
				padding: 3rpx 8rpx;
				right: 0;
				color: #fff;
				font-size: 24rpx;
			}
		}
		.combination-product-title {
			margin-top: 10rpx;
			text-align: center;
		}
	}
}
/*组合套餐*/

/*优惠券列表*/
.dz-coupon-list {
	background-color: #f9f9f9;
	width: 100%;
	padding: 0 25rpx 25rpx;
	box-sizing: border-box;
}

.dz-coupon-title {
	width: 100%;
	padding: 20rpx;
	text-align: center;
	font-size: 32rpx;
	color: $dz-main-color;
	font-weight: bold;
}

/*优惠券列表*/

.hideCanvas {
	position: fixed;
	top: -99999rpx;
	left: -99999rpx;
	z-index: -99999;
}
</style>

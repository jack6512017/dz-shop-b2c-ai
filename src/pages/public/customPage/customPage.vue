<template>
	<view
		class="custom-page"
		:style="{
			background:
				config.pageColorMode == 'default'
					? config.pageColor
					: config.pageLinearColor && config.pageLinearColor.color
					? config.pageLinearColor.color
					: '#f3f4f6',
		}"
	>
		<dz-navbar-immersive
			v-if="!pageType && config.isNavColor == 1"
			splitLine
			scrollRatio="0.3"
			:isCustom="true"
			@change="opacityChange"
			:scrollTop="scrollTop"
			backgroundColor="#fff"
			:style="[navbarStyle]"
		>
			<dz-navbar :title="customTitle"></dz-navbar>
		</dz-navbar-immersive>
		<view v-if="authsType" class="dz-flex dz-flex-column dz-row-center" style="height: 100%; margin-top: -20%">
			<view class="dz-m-b-10"><dz-icon :name="auths[authsType].icon" :size="auths[authsType].size" color="#dedfe6"></dz-icon></view>
			<text v-if="authsType == 'auths'">{{ auths[authsType].tip }}</text>
			<view class="dz-m-t-30">
				<dz-button
					size="medium"
					hoverClass="none"
					:border="false"
					shape="circle"
					:custom-style="{ background: theme.dzBaseColor, color: theme.dzBaseFontColor }"
					@click="toBack(authsType)"
				>
					{{ auths[authsType].btnText }}
				</dz-button>
			</view>
			<view v-if="authsType == 'login'" class="dz-m-t-20 dz-font-24 dz-color-9" @tap="toBack('auths')"> {{ auths[authsType].tip }}</view>
		</view>
		<view
			v-else
			class="dz-relative"
			:style="{
				background:
					config.pageColorMode == 'default'
						? config.pageColor
						: config.pageLinearColor && config.pageLinearColor.color
						? config.pageLinearColor.color
						: '#f3f4f6',
			}"
		>
			<view v-if="!pageType" class="dz-relative" style="z-index: 991">
				<dz-navbar
					:title="customTitle"
					:is-fixed="config.isNavColor == 0"
					:background="{ background: config.isNavColor == 0 ? '#fff' : config.navBgColor }"
					:border-bottom="false"
					:back-icon-color="config.isNavColor == 0 ? '#303133' : config.navColor"
					:title-color="config.isNavColor == 0 ? '#303133' : config.navColor"
				></dz-navbar>
			</view>
			<view v-if="config.backgroundPicture" class="custom-bg-img">
				<image
					:src="config.backgroundPicture"
					:style="{
						width: '100%',
						height: config.isHeight == 0 ? parseInt(config.pictureHeight) * 2 + 'rpx' : parseInt(config.pictureHeight) + 'px',
					}"
				>
				</image>
			</view>
			<view class="dz-relative">
				<view v-for="(item, index) in componentDiy" :key="index">
					<view
						v-if="item.component == 'dz-gap'"
						class="dz-relative"
						:style="{
							margin: `${parseInt(item.props.marginTop) * 2}rpx 0 ${parseInt(item.props.marginBottom) * 2}rpx 0`,
						}"
						><dz-gap :height="parseInt(item.props.height) * 2" :bg-color="item.props.bgColor"></dz-gap
					></view>
					<view
						v-if="item.component == 'dz-search'"
						:style="{ position: item.props.isImmersive == 1 ? 'fixed' : 'static', zIndex: item.props.isImmersive == 1 ? '999' : '1' }"
					>
						<dz-navbar-immersive
							v-if="item.props.isImmersive == 1 && item.props.immersive"
							splitLine
							scrollRatio="0.3"
							:isCustom="true"
							:scrollTop="scrollTop"
							:height="getNavbarHeight(item.props)"
							:backgroundColor="item.props.immersive.bgColor"
						>
							<dz-navbar
								:is-fixed="true"
								:is-back="false"
								input-align="center"
								:borderBottom="false"
								:background="{ background: item.props.immersive.bgColor }"
								:height="getNavbarHeight(item.props)"
							>
								<view
									:style="{
										width: '100%',
										padding: `${parseInt(item.props.paddingTopBottom) * 2}rpx ${parseInt(item.props.paddingLeftRight) * 2}rpx`,
									}"
									class="dz-flex"
								>
									<view v-if="item.props.isDiy == 1 && item.props.immersive.isLeft == 1" class="dz-m-r-20">
										<view
											v-if="item.props.leftType == 1"
											:style="{
												fontSize: `${item.props.leftStyle.fontSize}px`,
												color: item.props.immersive.leftColor,
												fontWeight: item.props.leftStyle.isBold == 1 ? 'bold' : '500',
											}"
											@tap="linkJumpTab(item.props.leftLink)"
										>
											{{ item.props.leftText }}
										</view>
										<view v-if="item.props.leftType == 2">
											<dz-image
												:src="item.props.leftCover"
												:height="parseInt(item.props.leftStyle.coverSize) * 2"
												:width="parseInt(item.props.leftStyle.coverSize) * 2"
												:borderRadius="parseInt(item.props.leftStyle.radius) * 2"
												@click="linkJumpTab(item.props.leftLink)"
											></dz-image>
										</view>
										<view v-if="item.props.leftType == 3">
											<dz-icon
												name="scan"
												:color="item.props.immersive.leftColor"
												:size="parseInt(item.props.leftStyle.fontSize) * 2"
												@tap="scanTap()"
											></dz-icon>
										</view>
										<view v-if="item.props.leftType == 4">
											<dz-icon
												name="notification-line"
												:color="item.props.immersive.leftColor"
												:size="parseInt(item.props.rightStyle.fontSize) * 2"
												@tap="toPage('notifyIndex')"
											></dz-icon>
											<dz-badge :count="notifyCount" :offset="[10, 10]"></dz-badge>
										</view>
									</view>
								</view>
								<dz-search
									:disabled="true"
									:shape="item.props.shape"
									:modelValue="item.props.placeholder"
									:input-align="item.props.inputAlign"
									:bg-color="item.props.immersive.inputBgColor"
									:borderColor="item.props.immersive.borderColor"
									:show-action="item.props.showAction == 1 ? true : false"
									@tap="handelTabSearch(item.props.placeholder)"
								></dz-search>
								<view v-if="item.props.isDiy == 1 && item.props.immersive.isRight == 1" class="dz-m-l-20">
									<view v-if="item.props.rightType == 1">
										<dz-icon
											name="scan"
											:color="item.props.immersive.rightColor"
											:size="parseInt(item.props.rightStyle.fontSize) * 2"
											@tap="scanTap()"
										></dz-icon>
									</view>
									<view v-if="item.props.rightType == 2">
										<dz-icon
											name="notification-line"
											:color="item.props.immersive.rightColor"
											:size="parseInt(item.props.rightStyle.fontSize) * 2"
											@tap="toPage('notifyIndex')"
										></dz-icon>
										<dz-badge :count="notifyCount" :offset="[10, 10]"></dz-badge>
									</view>
									<view
										v-if="item.props.rightType == 3"
										:style="{
											fontSize: `${item.props.rightStyle.fontSize}px`,
											color: item.props.immersive.rightColor,
											fontWeight: item.props.rightStyle.isBold == 1 ? 'bold' : '500',
										}"
										@tap="linkJumpTab(item.props.rightLink)"
									>
										{{ item.props.rightText }}
									</view>
									<view v-if="item.props.rightType == 4">
										<dz-image
											:src="item.props.rightCover"
											:height="parseInt(item.props.rightStyle.coverSize) * 2"
											:width="parseInt(item.props.rightStyle.coverSize) * 2"
											:borderRadius="parseInt(item.props.rightStyle.radius) * 2"
											@click="linkJumpTab(item.props.rightLink)"
										></dz-image>
									</view>
								</view>
							</dz-navbar>
						</dz-navbar-immersive>
						<dz-navbar
							:is-fixed="true"
							:is-back="false"
							input-align="center"
							:borderBottom="false"
							:background="{ background: item.props.bgColor }"
							:height="getNavbarHeight(item.props)"
						>
							<view
								:style="{
									width: '100%',
									padding: `${parseInt(item.props.paddingTopBottom) * 2}rpx ${parseInt(item.props.paddingLeftRight) * 2}rpx`,
								}"
								class="dz-flex"
							>
								<view v-if="item.props.isDiy == 1 && item.props.isLeft == 1" class="dz-m-r-20">
									<view
										v-if="item.props.leftType == 1"
										:style="{
											fontSize: `${item.props.leftStyle.fontSize}px`,
											color: item.props.leftStyle.color,
											fontWeight: item.props.leftStyle.isBold == 1 ? 'bold' : '500',
										}"
										@tap="linkJumpTab(item.props.leftLink)"
									>
										{{ item.props.leftText }}
									</view>
									<view v-if="item.props.leftType == 2">
										<dz-image
											:src="item.props.leftCover"
											:height="parseInt(item.props.leftStyle.coverSize) * 2"
											:width="parseInt(item.props.leftStyle.coverSize) * 2"
											:borderRadius="parseInt(item.props.leftStyle.radius) * 2"
											@click="linkJumpTab(item.props.leftLink)"
										></dz-image>
									</view>
									<view v-if="item.props.leftType == 3">
										<dz-icon
											name="scan"
											:color="item.props.immersive.leftColor"
											:size="parseInt(item.props.leftStyle.fontSize) * 2"
											@tap="scanTap()"
										></dz-icon>
									</view>
									<view v-if="item.props.leftType == 4">
										<dz-icon
											name="notification-line"
											:color="item.props.immersive.leftColor"
											:size="parseInt(item.props.rightStyle.fontSize) * 2"
											@tap="toPage('notifyIndex')"
										></dz-icon>
										<dz-badge :count="notifyCount" :offset="[10, 10]"></dz-badge>
									</view>
								</view>
								<dz-search
									:disabled="true"
									:shape="item.props.shape"
									:modelValue="item.props.placeholder"
									:input-align="item.props.inputAlign"
									:bg-color="item.props.inputBgColor"
									:borderColor="item.props.borderColor"
									:show-action="item.props.showAction == 1 ? true : false"
									@tap="handelTabSearch(item.props.placeholder)"
								></dz-search>
								<view v-if="item.props.isDiy == 1 && item.props.isRight == 1" class="dz-m-l-20">
									<view v-if="item.props.rightType == 1">
										<dz-icon
											name="scan"
											:color="item.props.rightStyle.color"
											:size="parseInt(item.props.rightStyle.fontSize) * 2"
											@tap="scanTap()"
										></dz-icon>
									</view>
									<view v-if="item.props.rightType == 2">
										<dz-icon
											name="notification-line"
											:color="item.props.rightStyle.color"
											:size="parseInt(item.props.rightStyle.fontSize) * 2"
											@tap="toPage('notifyIndex')"
										></dz-icon>
										<dz-badge :count="notifyCount" :offset="[10, 10]"></dz-badge>
									</view>
									<view
										v-if="item.props.rightType == 3"
										:style="{
											fontSize: `${item.props.rightStyle.fontSize}px`,
											color: item.props.rightStyle.color,
											fontWeight: item.props.rightStyle.isBold == 1 ? 'bold' : '500',
										}"
										@tap="linkJumpTab(item.props.rightLink)"
									>
										{{ item.props.rightText }}
									</view>
									<view v-if="item.props.rightType == 4">
										<dz-image
											:src="item.props.rightCover"
											:height="parseInt(item.props.rightStyle.coverSize) * 2"
											:width="parseInt(item.props.rightStyle.coverSize) * 2"
											:borderRadius="parseInt(item.props.rightStyle.radius) * 2"
											@click="linkJumpTab(item.props.rightLink)"
										></dz-image>
									</view>
								</view>
							</view>
						</dz-navbar>
					</view>
					<!-- 公告 -->
					<view
						v-if="item.component == 'dz-notice-bar'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
						@tap="handelMore"
					>
						<dz-notice-bar
							:list="notifyAnnounce"
							:mode="item.props.mode"
							:bg-color="item.props.bgColor"
							duration="5000"
							:volumeIcon="item.props.volumeIcon"
							:moreIcon="item.props.moreIcon == 1 ? true : false"
							:title="item.props.title"
							:title-style="item.props.titleStyle"
							:cover="item.props.cover"
							:widthHeight="parseInt(item.props.coverSize) * 2"
							:leftIconColor="item.props.leftIconColor"
							:rightIconColor="item.props.rightIconColor"
							:color="item.props.color"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
						></dz-notice-bar>
					</view>
					<!-- 轮播图 -->
					<view
						v-if="item.component == 'dz-swiper'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-swiper
							name="cover"
							:list="item.props.list"
							:border-radius="parseInt(item.props.borderRadius) * 2"
							:mode="item.props.mode"
							:height="parseInt(item.props.height) * 2"
							:indicator-pos="item.props.indicatorPos"
							:effect3d="item.props.effect3d == 1 ? true : false"
							:title="item.props.isTitle == 1 ? true : false"
							:bgColor="item.props.bgColor"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							@click="linkJumpIndexTab(index, $event)"
						></dz-swiper>
					</view>
					<!-- 分类 -->
					<view
						v-if="item.component == 'dz-grid-menu'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-grid-menu
							:list="item.props.list"
							name="cover"
							:height="parseInt(item.props.widthHeight) * 2 + 74"
							title="cate_title"
							:col="parseInt(item.props.col)"
							:isPage="item.props.isPage == 1 ? true : false"
							:is-name="item.props.isName == 1 ? true : false"
							:width-height="parseInt(item.props.size) * 2"
							:border-radius="parseInt(item.props.borderRadius) * 2"
							:itemBorderRadius="parseInt(item.props.itemBorderRadius) * 2"
							:bgColor="item.props.bgColor"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:border="false"
							:dot-color="item.props.dotColor"
							:mode="item.props.mode"
							:colNum="item.props.colNum"
							@click="linkJumpIndexTab(index, $event)"
						></dz-grid-menu>
					</view>
					<!-- 优惠劵 -->
					<view
						v-if="item.component == 'dz-coupon' && item.data.length"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-coupon
							:bg-color="item.props.bgColor"
							:price-color="item.props.priceColor"
							:price-size="parseInt(item.props.priceSize) * 2"
							:tip-color="item.props.tipColor"
							:tip-size="parseInt(item.props.tipSize) * 2"
							:mode="item.props.mode"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:btn-bg-color="item.props.btnBgColor"
							:btn-color="item.props.btnColor"
							:deputy-color="item.props.deputyColor"
							:data-source="item.props.dataSource"
							:list="item.data"
						></dz-coupon>
					</view>
					<!-- 标题导航 -->
					<view
						v-if="item.component == 'dz-section'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-section
							:title="item.props.title"
							:arrow="item.props.isRight == 1 ? true : false"
							:right="item.props.isRight == 1 ? true : false"
							:showLine="item.props.showLine == 1 ? true : false"
							:line-color="item.props.lineColor"
							:bgColor="item.props.bgColor"
							:sub-color="item.props.subColor"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:bold="item.props.bold == 1 ? true : false"
							@click="linkJumpTab(item.props.link)"
						></dz-section>
					</view>
					<!-- 商品列表 -->
					<view v-if="item.component == 'dz-product-list'" class="dz-relative">
						<block v-if="item.isList == 1 || item.isList == 2">
							<dz-product-list
								:list="item.data"
								:isList="item.isList == 1 ? true : false"
								:borderRadius="parseInt(item.props.borderRadius) * 2"
								:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
								:margin-top="parseInt(item.props.marginTop) * 2"
								:margin-bottom="parseInt(item.props.marginBottom) * 2"
								:cart="item.props.cart"
								:market-price-show="item.props.marketPriceShow"
							></dz-product-list>
						</block>
						<block v-if="item.isList == 3">
							<dz-product-max
								:list="item.data"
								:defaultList="item.props.list"
								:dataSource="item.props.dataSource"
								:borderRadius="parseInt(item.props.borderRadius) * 2"
								:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
								:margin-top="parseInt(item.props.marginTop) * 2"
								:margin-bottom="parseInt(item.props.marginBottom) * 2"
								:max-height="parseInt(item.props.maxHeight ? item.props.maxHeight : 160) * 2"
								:cart="item.props.cart"
								:market-price-show="item.props.marketPriceShow"
							></dz-product-max>
						</block>
						<block v-if="item.isList == 4">
							<dz-product-three
								:list="item.data"
								:defaultList="item.props.list"
								:dataSource="item.props.dataSource"
								:borderRadius="parseInt(item.props.borderRadius) * 2"
								:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
								:margin-top="parseInt(item.props.marginTop) * 2"
								:margin-bottom="parseInt(item.props.marginBottom) * 2"
								:market-price-show="item.props.marketPriceShow"
								:clearance="parseInt(item.props.clearance) * 2"
							></dz-product-three>
						</block>
					</view>
					<!-- 瀑布流商品 -->
					<view v-if="item.component == 'dz-falls-flow-product' && productList.length" class="dz-relative">
						<block v-if="item.isList == 1 || item.isList == 2">
							<dz-product-list
								:list="productList"
								:isList="item.isList == 1 ? true : false"
								:borderRadius="parseInt(item.props.borderRadius) * 2"
								:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
								:margin-top="parseInt(item.props.marginTop) * 2"
								:margin-bottom="parseInt(item.props.marginBottom) * 2"
								:cart="item.props.cart"
								:market-price-show="item.props.marketPriceShow"
							></dz-product-list>
						</block>
						<block v-if="item.isList == 3">
							<dz-product-max
								:list="productList"
								:defaultList="item.props.list"
								:dataSource="item.props.dataSource"
								:borderRadius="parseInt(item.props.borderRadius) * 2"
								:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
								:margin-top="parseInt(item.props.marginTop) * 2"
								:margin-bottom="parseInt(item.props.marginBottom) * 2"
								:max-height="parseInt(item.props.maxHeight ? item.props.maxHeight : 160) * 2"
								:cart="item.props.cart"
								:market-price-show="item.props.marketPriceShow"
							></dz-product-max>
						</block>
						<block v-if="item.isList == 4">
							<dz-product-three
								:list="productList"
								:defaultList="item.props.list"
								:dataSource="item.props.dataSource"
								:borderRadius="parseInt(item.props.borderRadius) * 2"
								:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
								:margin-top="parseInt(item.props.marginTop) * 2"
								:margin-bottom="parseInt(item.props.marginBottom) * 2"
								:market-price-show="item.props.marketPriceShow"
								:clearance="parseInt(item.props.clearance) * 2"
							></dz-product-three>
						</block>
						<block v-if="index == componentDiy.length - 1">
							<dz-empty v-if="loadingStatus == 'nodata'" margin-top="60" :src="empty" text="暂无数据" iconSize="360"></dz-empty>
							<dz-loadmore v-if="loadingStatus == 'loading'" :status="loadingStatus" margin-top="20" margin-bottom="20"></dz-loadmore>
						</block>
					</view>
					<view
						v-if="item.component == 'dz-swiper-product' && item.data.length"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-swiper-product
							:list="item.data"
							:defaultList="item.props.list"
							:autoplay="swiperAutoplay && item.props.autoplay == 1 ? true : false"
							:interval="item.props.interval * 1000"
							:col="item.props.col"
							:config="item.props.config"
							:margin-left-right="item.props.marginLeftRight"
							:margin-top="item.props.marginTop"
							:margin-bottom="item.props.marginBottom"
							:data-source="item.props.dataSource"
						/>
					</view>

					<view
						v-if="item.component == 'dz-swiper-card'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-swiper-card
							:list="item.props.list"
							:mode="item.props.mode"
							:autoplay="swiperAutoplay && item.props.autoplay == 1 ? true : false"
							:interval="item.props.interval * 1000"
							:height="parseInt(item.props.height) * 2"
							:col="item.props.col"
							:config="item.props.config"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							@click="linkJumpTab"
						/>
					</view>
					<!-- 广告 -->
					<view
						v-if="item.component == 'dz-banner'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<view
							class="dz-relative dz-banner"
							:style="{
								overflow: 'hidden',
								height: parseInt(item.props.height) * 2 + 'rpx',
								margin: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
									parseInt(item.props.marginBottom) * 2
								}rpx`,
							}"
						>
							<dz-image
								:src="item.props.cover"
								:borderRadius="parseInt(item.props.borderRadius) * 2"
								:height="parseInt(item.props.height) * 2"
								@click="linkJumpTab(item.props.link)"
							></dz-image>
							<block v-for="(area, areaIndex) in item.props.area" :key="areaIndex">
								<view
									class="dz-absolute"
									:style="{
										boxSizing: 'border-box',
										width: parseInt(area.width) * 2 + 'rpx',
										height: parseInt(area.height) * 2 + 'rpx',
										top: parseInt(area.top) * 2 + 'rpx',
										left: parseInt(area.left) * 2 + 'rpx',
									}"
									@tap.stop="linkJumpTab(area.link)"
								>
									<dz-image
										v-if="area.cover"
										:src="area.cover"
										:width="parseInt(area.width) * 2"
										:height="parseInt(area.height) * 2"
									></dz-image>
								</view>
							</block>
						</view>
					</view>
					<!-- 魔方 -->
					<view
						v-if="item.component == 'dz-rubiks-cube'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-rubiks-cube
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:clearance="parseInt(item.props.clearance) * 2"
							:list="item.props.list"
							:mode="item.props.mode"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:heightConfig="item.props.heightConfig"
							@click="linkJumpTab"
						></dz-rubiks-cube>
					</view>
					<!-- 辅助线 -->
					<view
						v-if="item.component == 'dz-divider'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-divider
							:half-width="parseInt(item.props.halfWidth) * 2"
							:bg-color="item.props.bgColor"
							:font-size="parseInt(item.props.fontSize) * 2"
							:color="item.props.color"
							:border-color="item.props.borderColor"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
						>
							{{ item.props.title }}
						</dz-divider>
					</view>
					<!-- 标题 -->
					<view
						v-if="item.component == 'dz-title'"
						class="dz-relative"
						:style="{
							margin: `${parseInt(item.props.marginTop) * 2}rpx ${parseInt(item.props.marginLeftRight) * 2}rpx ${
								parseInt(item.props.marginBottom) * 2
							}rpx`,
						}"
					>
						<dz-title
							:title="item.props.title"
							:mode="item.props.mode"
							:bar-color="item.props.barColor"
							:bar-bokeh-color="item.props.barBokehColor"
							:coverLeft="item.props.coverLeft"
							:coverRight="item.props.coverRight"
							:font-size="parseInt(item.props.fontSize) * 2"
							:barWidth="parseInt(item.props.barWidth) * 2"
							:barHeight="parseInt(item.props.barHeight) * 2"
							:title-color="item.props.titleColor"
							:tip-config="item.props.tipConfig"
							:icon-width="parseInt(item.props.iconWidth) * 2"
							:icon-height="parseInt(item.props.iconHeight) * 2"
							:text-align="item.props.textAlign"
							:bg-color="item.props.bgColor"
							:bold="item.props.bold == 1 ? true : false"
						></dz-title>
					</view>
					<!-- 客服 -->
					<view v-if="item.component == 'dz-customer-service' && customerService">
						<dz-customer-service
							:customerServiceUnread="customerServiceUnread"
							:sessionFrom="sessionFrom"
							:serviceType="serviceType"
							:mode="item.props.mode"
							:bottom="parseInt(item.props.bottom) * 2"
							:right="parseInt(item.props.right) * 2"
							icon="customer-service"
							:cover="item.props.cover"
							:coverWidth="parseInt(item.props.coverWidth) * 2"
							:coverHeight="parseInt(item.props.coverHeight) * 2"
							:customStyle="{
								borderRadius: parseInt(item.props.borderRadius) * 2 + 'rpx',
								background: item.props.bgColor,
								boxShadow: item.props.bgColor ? '0 2px 12px 0 rgba(0, 0, 0, 0.1)' : '',
							}"
							:icon-style="{
								fontSize: parseInt(item.props.size) * 2 + 'rpx',
								color: item.props.iconColor,
							}"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:zIndex="777"
							@click="serviceTap"
						></dz-customer-service>
					</view>
					<!-- 悬浮按钮 -->
					<view v-if="item.component == 'dz-fab'">
						<dz-fab
							:mode="item.props.mode"
							:bottom="parseInt(item.props.bottom) * 2"
							:right="parseInt(item.props.right) * 2"
							:width="parseInt(item.props.width) * 2"
							:height="parseInt(item.props.height) * 2"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:btnRadius="parseInt(item.props.btnRadius) * 2"
							:btnList="item.props.list"
							:bgColor="item.props.bgColor"
							:color="item.props.color"
							:maskClosable="false"
							@click="fabClick($event, index)"
						></dz-fab>
					</view>
					<view
						v-if="item.component == 'dz-article-tabs' && item.data.length"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.cateConfig.pushTop) * 2}rpx`,
							zIndex: 2,
						}"
					>
						<dz-button-tabs
							v-if="item.props.cateConfig.mode == 'button'"
							:list="item.data"
							name="title"
							:height="parseInt(item.props.cateConfig.height) * 2"
							:padding="parseInt(item.props.cateConfig.padding) * 2"
							:margin-left-right="parseInt(item.props.cateConfig.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.cateConfig.marginTop)"
							:margin-bottom="parseInt(item.props.cateConfig.marginBottom)"
							:radius="parseInt(item.props.cateConfig.buttonRadius) * 2"
							:button-radius="parseInt(item.props.cateConfig.tabsRadius) * 2"
							:font-size="parseInt(item.props.cateConfig.fontSize) * 2"
							:bg-color="item.props.cateConfig.bgColor"
							:active-color="item.props.cateConfig.activeColor"
							:inactive-color="item.props.cateConfig.inactiveColor"
							:active-bg-color="item.props.cateConfig.activeBgColor"
							:inactive-bg-color="item.props.cateConfig.inactiveBgColor"
							:bold="item.props.cateConfig.bold == 1 ? true : false"
							:current="item.props.cateConfig.activeCurrent"
							@change="tabsChange($event, index)"
						></dz-button-tabs>

						<dz-tabs
							v-else
							:list="item.data"
							:itemStyle="{
								height: parseInt(item.props.cateConfig.height) * 2 + 'rpx',
							}"
							keyName="title"
							:activeStyle="{
								fontSize: `${parseInt(item.props.cateConfig.fontSize) * 2}rpx`,
								fontWeight: item.props.cateConfig.bold == 1 ? 'bold' : 400,
								color: item.props.cateConfig.activeColor,
							}"
							:inactiveStyle="{
								fontSize: `${parseInt(item.props.cateConfig.fontSize) * 2}rpx`,
								color: item.props.cateConfig.inactiveColor,
							}"
							:lineColor="item.props.cateConfig.activeColor"
							:bg-color="item.props.cateConfig.bgColor"
							:padding="parseInt(item.props.cateConfig.padding) * 2"
							:margin-left-right="parseInt(item.props.cateConfig.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.cateConfig.marginTop)"
							:margin-bottom="parseInt(item.props.cateConfig.marginBottom)"
							:radius="parseInt(item.props.cateConfig.tabsRadius) * 2"
							:showLine="item.props.cateConfig.showBar == 1 ? true : false"
							:line-width="parseInt(item.props.cateConfig.barWidth)"
							:line-height="parseInt(item.props.cateConfig.barHeight)"
							:current="item.props.cateConfig.activeCurrent"
							@change="tabsChange($event, index)"
						></dz-tabs>

						<view
							v-if="isLoading && activeCurrent == index"
							:style="{
								height: (parseInt(item.props.artcleConfig.height) + parseInt(item.props.artcleConfig.cardPadding)) * 2 + 'rpx',
								borderRadius: parseInt(item.props.artcleConfig.radius) * 2 + 'rpx',
								margin: `${parseInt(item.props.artcleConfig.topBottom) * 2}rpx ${parseInt(item.props.artcleConfig.leftRight) * 2}rpx`,
								background: '#fff',
							}"
							class="dz-p-20"
						>
							<dz-loadmore status="loading"></dz-loadmore>
						</view>
						<dz-article
							:list="item.props.list[item.props.cateConfig.activeCurrent].data"
							:mode="item.props.artcleConfig.mode"
							:data-source="item.props.artcleConfig.dataSource"
							:margin-left-right="parseInt(item.props.artcleConfig.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.artcleConfig.marginTop)"
							:margin-bottom="parseInt(item.props.artcleConfig.marginBottom)"
							:card-margin="parseInt(item.props.artcleConfig.cardMargin) * 2"
							:card-padding="parseInt(item.props.artcleConfig.cardPadding) * 2"
							:content-padding="parseInt(item.props.artcleConfig.contentPadding) * 2"
							:borderRadius="parseInt(item.props.artcleConfig.borderRadius) * 2"
							:radius1="parseInt(item.props.artcleConfig.radius1) * 2"
							:radius2="parseInt(item.props.artcleConfig.radius2) * 2"
							:width="parseInt(item.props.artcleConfig.width) * 2"
							:height="parseInt(item.props.artcleConfig.height) * 2"
							:is-description="item.props.artcleConfig.isDescription"
							:is-time="item.props.artcleConfig.isTime"
							:is-view-count="item.props.artcleConfig.isViewCount"
						></dz-article>
					</view>
					<!-- 文章列表 -->
					<view
						v-if="item.component == 'dz-article'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-article
							:list="item.data"
							:mode="item.props.mode"
							:defaultList="item.props.list"
							:data-source="item.props.dataSource"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom)"
							:card-margin="parseInt(item.props.cardMargin) * 2"
							:card-padding="parseInt(item.props.cardPadding) * 2"
							:content-padding="parseInt(item.props.contentPadding) * 2"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:radius1="parseInt(item.props.radius1) * 2"
							:radius2="parseInt(item.props.radius2) * 2"
							:width="parseInt(item.props.width) * 2"
							:height="parseInt(item.props.height) * 2"
							:is-description="item.props.isDescription"
							:is-time="item.props.isTime"
							:is-view-count="item.props.isViewCount"
						></dz-article>
					</view>
					<!-- 营销模块 -->
					<view
						v-if="marketingType.includes(item.component) && item.data.length"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-marketing
							:props-config="item.props"
							:title="item.props.title"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:cover="item.props.cover"
							:list="item.data"
							:marketingType="item.component"
						></dz-marketing>
					</view>
					<!-- 小程序直播 -->
					<!-- #ifdef MP-WEIXIN -->
					<view
						v-if="item.component == 'dz-mplive' && item.data.length > 0"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-mplive
							:list="item.data"
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:borderRadius="parseInt(item.props.borderRadius) * 2"
							:propsConfig="item.props"
						></dz-mplive>
					</view>
					<!-- #endif -->
					<view
						v-if="item.component == 'dz-download-app'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-download-app
							:margin-left-right="parseInt(item.props.marginLeftRight) * 2"
							:margin-top="parseInt(item.props.marginTop) * 2"
							:margin-bottom="parseInt(item.props.marginBottom) * 2"
							:isLogo="item.props.isLogo == 1 ? true : false"
							:logo="item.props.logo"
							:logoSize="parseInt(item.props.logoSize) * 2"
							:logoRadius-="parseInt(item.props.logoRadius) * 2"
							:isName="item.props.isName == 1 ? true : false"
							:name="item.props.name"
							:nameColor="item.props.nameColor"
							:nameFontSize="parseInt(item.props.nameFontSize) * 2"
							:nameBold="item.props.nameBold == 1 ? true : false"
							:appBtnHeight="parseInt(item.props.appBtnHeight) * 2"
							:appBtnLeftRight="parseInt(item.props.appBtnLeftRight) * 2"
							:appBtnRadius="parseInt(item.props.appBtnRadius) * 2"
							:appFontSize="parseInt(item.props.appFontSize) * 2"
							:isAndroid="item.props.isAndroid == 1 ? true : false"
							:androidBgColor="item.props.androidBgColor"
							:androidColor="item.props.androidColor"
							:androidBorderColor="item.props.androidBorderColor"
							:androidTop="parseInt(item.props.androidTop) * 2"
							:isIos="item.props.isIos == 1 ? true : false"
							:iosBgColor="item.props.iosBgColor"
							:iosColor="item.props.iosColor"
							:iosBorderColor="item.props.iosBorderColor"
							:iosTop="parseInt(item.props.iosTop) * 2"
							@copy="copyDownloadAppUrl"
						/>
					</view>
					<view
						v-if="item.component == 'dz-cell'"
						class="dz-relative"
						:style="{
							marginTop: `-${parseInt(item.props.pushTop) * 2}rpx`,
						}"
					>
						<dz-cell :config="item" @click="linkJumpTab" />
					</view>
				</view>
				<view style="height: 2rpx"></view>
			</view>
		</view>
		<!-- 返回顶部 -->
		<dz-back-top
			:scroll-top="scrollTop"
			:customStyle="{ background: '#fff', boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)' }"
			:icon-style="{ fontSize: '36rpx' }"
		></dz-back-top>
		<!-- 页面加载 -->
		<dz-page-loading :show="pageLoadingShow" :status="pageLoadingStatus" zIndex="981" @click="pageLoadingClick"></dz-page-loading>
	</view>
</template>

<script lang="ts" setup>
import { reactive, computed, watch, toRefs } from 'vue';
import { onLoad, onShow, onHide, onShareAppMessage, onShareTimeline, onPullDownRefresh, onReachBottom, onPageScroll } from '@dcloudio/uni-app';
import { useUserStore } from '@/state/modules/user';

let systemInfo = uni.getSystemInfoSync();
const userStore = useUserStore();
const userInfo = computed(() => {
	return userStore.getUserInfo;
});

const hasLogin = computed(() => {
	return userStore.hasLogin;
});
const shopSetting = computed(() => {
	return userStore.getShopSetting;
});

const theme = computed(() => {
	return userStore.getTheme;
});

const customerServiceUnread = computed(() => {
	return userStore.getCustomerServiceUnread;
});

const marketingType = ['dz-limited', 'dz-join-buy', 'dz-haggle', 'dz-discount', 'dz-presale'];
const auths = {
	login: {
		tip: '返回',
		icon: 'user_name',
		btnText: '登录',
		size: 160,
	},
	auths: {
		tip: '暂无权限访问',
		icon: 'authfill',
		btnText: '返回',
		size: 200,
	},
};
const empty = uni.$api.assetsConfig.empty;
const data = reactive({
	serviceType: shopSetting.value.app_service_type,
	scrollTop: 0,
	opacity: 0,
	componentDiy: [],
	navbarHeight: 0,
	pageLoadingShow: false,
	pageLoadingStatus: 'loading',
	notifyAnnounce: [],
	notifyCount: 0,
	customId: '',
	customTitle: '',
	config: {},
	authsType: '',
	customerService: false,
	sessionFrom: '',
	isLoading: false,
	activeCurrent: '',
	pageType: '',
	isLoadingProduct: false,
	mpShare: {
		title: '', // 默认为小程序名称
		path: '', // 默认为当前页面路径
		imageUrl: '', // 默认为当前页面的截图
	},
	shareData: {},
	productConfig: {},
	page: 1,
	productList: [],
	loadingStatus: 'loading',
	swiperAutoplay: true,
});

onLoad(async (options) => {
	await uni.$onLaunched;
	data.customId = options.code;
	if (options.type) {
		data.pageType = options.type;
	}
	// #ifdef APP-PLUS || H5
	data.navbarHeight = 44;
	// #endif
	// #ifdef MP
	// 小程序特别处理，让导航栏高度 = 胶囊高度 + 两倍胶囊顶部与状态栏底部的距离之差(相当于同时获得了导航栏底部与胶囊底部的距离)
	// 此方法有缺陷，暂不用(会导致少了几个px)，采用直接固定值的方式
	data.navbarHeight = uni.$api.systemInfo.osName == 'ios' ? 44 : 48;
	// #endif
	if (options.promo_code) {
		userStore.setPromoCode(options.promo_code);
	}
	//保存经销商
	if (options.dealer_code) {
		userStore.setDealerCode(options.dealer_code);
	}
	//保存实体店
	if (options.store_id) {
		userStore.setStoreId(options.store_id);
	}
	if (userStore.hasLogin) {
		getMemberInfo();
	}
	getInfoData();

	//登录处理
	if (!userStore.hasLogin && parseInt(shopSetting.value.wechat_share_page_auto_login) == 1) {
		//公众号自动登录
		// #ifdef H5
		if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
			if (options.code) {
				uni.$api.wxAutoLoginHelper.wechatCodeLogin(options.code);
			} else {
				uni.$api.wxAutoLoginHelper.login();
			}
		}
		// #endif
	}
});

onShow(() => {
	data.swiperAutoplay = true;
});

onHide(() => {
	data.swiperAutoplay = false;
});

onShareAppMessage(() => {
	return mpShare;
});

// #ifdef MP-WEIXIN
onShareTimeline(() => {
	return mpShare;
});
// #endif

onPullDownRefresh(() => {
	data.page = 1;
	data.productList = [];
	data.loadingStatus = 'loading';
	getInfoData();
});

onReachBottom(() => {
	if (!data.isLoadingProduct || data.loadingStatus == 'nodata' || data.loadingStatus == 'nomore' || JSON.stringify(data.productConfig) == '{}') return;
	data.page++;
	if (data.productConfig.productType != 'like') {
		getProductList();
	} else {
		getGuessYouLikeList();
	}
});

onPageScroll((e) => {
	data.scrollTop = e.scrollTop;
});

watch(
	() => hasLogin.value,
	() => {
		if (userStore.hasLogin) {
			getMemberInfo();
		}
		getInfoData();
	}
);

const navbarStyle = computed(() => {
	const style = {};
	style.opacity = data.opacity;
	return style;
});

const getNavbarHeight = computed(() => (item: any) => {
	let h = data.navbarHeight;
	const paddingTopBottom = parseInt(item.paddingTopBottom);
	let leftSize = 0;
	const leftFontSize = parseInt(item.leftStyle.fontSize);
	const leftCoverSize = parseInt(item.leftStyle.coverSize);
	let rightSize = 0;
	const rightFontSize = parseInt(item.rightStyle.fontSize);
	const rightCoverSize = parseInt(item.rightStyle.coverSize);
	if (paddingTopBottom > 0) {
		h = paddingTopBottom * 2 + 32;
	}
	if (item.isDiy) {
		const isLeftSize = leftFontSize || leftCoverSize > 32 ? true : false;
		const isRightSize = rightFontSize || rightCoverSize > 32 ? true : false;
		if (item.isLeft && isLeftSize) {
			leftSize = leftCoverSize > leftFontSize && item.leftType == 2 ? leftCoverSize : leftFontSize;
		}
		if (item.isRight && isRightSize) {
			rightSize = rightCoverSize > rightFontSize && item.rightType == 4 ? rightCoverSize : rightFontSize;
		}
		h = leftSize > rightSize ? leftSize : rightSize;
		if (paddingTopBottom > 0) {
			h = paddingTopBottom * 2 + h;
		}
	}
	h = h > data.navbarHeight ? h : data.navbarHeight;
	return h;
});

function opacityChange(e) {
	data.opacity = e.opacity;
}

async function getMemberInfo() {
	await uni.$api.http.get(uni.$api.apiMember.memberIndex).then((res) => {
		userStore.setUserInfo(res.data);
	});
}

async function getInfoData() {
	data.pageLoadingShow = true;
	uni.$api.http
		.get(uni.$api.apiShop.diyCustomPageIndex, {
			params: {
				id: data.customId,
				type: data.pageType,
			},
		})
		.then((res) => {
			data.componentDiy = res.data.decorate.component;
			data.customTitle = res.data.decorate.title;
			data.config = res.data.decorate.params;
			if (data.config && JSON.stringify(data.config) != '{}' && data.config.isHeight == 1) {
				data.config.pictureHeight = systemInfo.windowHeight;
			}
			uni.setNavigationBarTitle({
				title: data.customTitle,
			});
			//初始化公众号分享
			// #ifdef H5
			if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
				uni.$api.wxHelper.wxShare(window.location.href, data.customTitle, data.customTitle, sharePath(), '');
			}
			// #endif
			//初始化小程序分享
			data.mpShare.title = data.customTitle;
			data.mpShare.path = sharePath();
			data.mpShare.imageUrl = '';
			data.shareData = {
				shareUrl: sharePath(),
				shareTitle: data.customTitle,
				shareContent: '',
				shareImg: '',
			};
			initCustomerService();
			if (data.config.auths.length && !data.config.auths.includes('default')) {
				if (!hasLogin.value) {
					data.authsType = 'login';
					data.pageLoadingShow = false;
					return;
				}
				let isPromoter =
					userInfo.value.promoter &&
					(userInfo.value.promoter.promoterRegional || userInfo.value.promoter.promoterStore || userInfo.value.promoter.promoterWarehouse)
						? true
						: false;

				const isStore = data.config.auths.includes('store');

				const isWarehouse = data.config.auths.includes('warehouse');

				if (userInfo.value.promoter.promoterRegional) {
					let regionals = [];
					userInfo.value.promoter.promoterRegional.forEach((item) => {
						if (parseInt(item.province_id)) {
							regionals.push('province');
						}
						if (parseInt(item.province_id) && parseInt(item.city_id)) {
							regionals.push('city');
						}
						if (parseInt(item.province_id) && parseInt(item.city_id) && parseInt(item.area_id)) {
							regionals.push('area');
						}
					});
					const regional = data.config.auths.includes('regional');
					// 区域分销验证
					if (regional && unique(regionals).length) {
						data.authsType = '';
					} else {
						data.authsType = 'auths';
					}
					if (data.config.auths.some((item) => unique(regionals).indexOf(item) > -1)) {
						data.authsType = '';
					} else {
						data.authsType = 'auths';
					}
				}

				// 店铺分销验证
				const storeId = userInfo.value.promoter && userInfo.value.promoter.promoterStore ? userInfo.value.promoter.promoterStore.level_id : '';
				if (storeId && (data.config.auths.includes('store-' + storeId) || isStore)) {
					data.authsType = '';
				} else {
					data.authsType = 'auths';
				}

				// 云仓分销验证
				if (isPromoter && (data.config.auths.includes('warehouse-' + userInfo.value.promoter.promoterWarehouse.level_id) || isWarehouse)) {
					data.authsType = '';
				} else {
					data.authsType = 'auths';
				}
			} else {
				data.authsType = '';
			}
			if (data.componentDiy.length) {
				if (data.componentDiy[data.componentDiy.length - 1].component == 'dz-falls-flow-product') {
					data.productConfig = data.componentDiy[data.componentDiy.length - 1].props;
					data.productList = data.componentDiy[data.componentDiy.length - 1].data;
					data.isLoadingProduct = data.productList.length ? true : false;
					data.loadingStatus = data.productList.length == data.productConfig.pageSize ? 'loadmore' : 'nomore';
				}
				data.componentDiy.forEach((item, idnex) => {
					if (item.component == 'dz-article-tabs' && item.data.length) {
						if (item.props.dataSource == 'manual' && item.props.list.some((item) => item.id == '9999999')) {
							let index = item.props.list.findIndex((item) => item.id == '9999999');
							item.data.splice(index, 0, {
								id: '',
								title: '全部',
							});
						}
						if (item.props.dataSource == 'default') {
							item.data.unshift({
								id: '',
								title: '全部',
							});
						}
						tabsChange({ index: 0 }, idnex);
					}
				});
			}
			data.pageLoadingShow = false;
		})
		.catch(() => {
			data.pageLoadingStatus = 'error';
		});

	uni.$api.http.get(uni.$api.apiBase.announceIndex).then((res) => {
		data.notifyAnnounce = [];
		res.data.forEach((itme) => {
			data.notifyAnnounce.push(itme.title);
		});
	});

	if (userStore.hasLogin) {
		getNotifyUnRead();
	}
	uni.stopPullDownRefresh();
}
async function getProductList() {
	data.loadingStatus = 'loading';
	const params = {};
	if (data.productConfig.cate.cate_id) {
		params.cate_id = data.productConfig.cate.cate_id;
	}
	switch (data.productConfig.productType) {
		case 'is_new':
			params.is_new = data.productConfig.is_new;
			break;
		case 'is_recommend':
			params.is_recommend = data.productConfig.is_recommend;
			break;
		case 'is_hot':
			params.is_hot = data.productConfig.is_hot;
			break;
	}
	await uni.$api.http
		.get(uni.$api.apiShop.productIndex, {
			params: {
				...params,
				page: data.page,
				page_size: data.productConfig.pageSize,
			},
		})
		.then(async (res) => {
			data.loadingStatus = res.data.length == data.productConfig.pageSize ? 'loadmore' : 'nomore';
			data.productList = [...data.productList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}
// 猜你喜欢
async function getGuessYouLikeList() {
	data.loadingStatus = 'loading';
	await uni.$api.http
		.get(uni.$api.apiShop.productGuessYouLike, {
			params: {
				page: data.page,
				page_size: data.productConfig.pageSize,
			},
		})
		.then((res) => {
			data.loadingStatus = res.data.length === data.productConfig.pageSize ? 'loadmore' : 'nomore';
			data.productList = [...data.productList, ...res.data];
			if (data.page == 1 && res.data.length == 0) {
				data.loadingStatus = 'nodata';
			}
		})
		.catch(() => {
			data.loadingStatus = 'loadmore';
		});
	uni.stopPullDownRefresh();
}
function tabsChange(v, index) {
	const e = v.index;
	data.isLoading = true;
	let item = data.componentDiy[index];
	item.props.cateConfig.activeCurrent = e;
	data.activeCurrent = index;
	item.props.artcleData = [];
	let params = {};
	if (item.data[e].id) {
		params.cate_id = item.data[e].id;
	}
	if (item.props.pageSize) {
		params.page_size = item.props.pageSize;
	}
	uni.$api.http
		.get(uni.$api.apiArticle.getArticleIndex, {
			params: {
				...params,
			},
		})
		.then((res) => {
			item.props.artcleData = res.data;
		})
		.finally(() => {
			data.isLoading = false;
		});
}
function unique(arr) {
	return [...new Set(arr)];
}

function initCustomerService() {
	let serviceType = parseInt(shopSetting.value.app_service_type);
	if (serviceType > 0) {
		if (userStore.hasLogin) {
			data.sessionFrom =
				'{"source":"' +
				data.customTitle +
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
			data.customerService = true;
		}
	}
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
				source: data.customTitle,
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
					url: uni.$api.helper.strEncode(customerServiceUrl),
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
			success(res) {},
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

async function scanTap() {
	/*  #ifndef H5  */
	uni.scanCode({
		success: (res) => {
			scan(res.result);
		},
	});
	/*  #endif  */
	/*  #ifdef H5  */
	if (uni.$api.h5IsWechat() && shopSetting.value.wechat_appid != '') {
		//注意公众号jweixin方法仅支持异步
		uni.$api.jweixin.ready(() => {
			uni.$api.jweixin.scanQRCode({
				needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				success(res) {
					scan(res.resultStr);
				},
				fail(err) {
					uni.$api.toast(uni.$api.language.index.scanError + err.errMsg);
				},
			});
		});
	} else {
		uni.$api.toast(uni.$api.language.application.needOprationInWechat);
	}
	/*  #endif  */
}

async function scan(result: string) {
	if (result.startsWith('http')) {
		let h5LoginUrl = uni.$api.appConfig.h5Domain;
		if (h5LoginUrl.endsWith('/')) {
			h5LoginUrl = h5LoginUrl.substr(0, h5LoginUrl.length - 1);
		}
		h5LoginUrl = h5LoginUrl.replace('http://', '');
		h5LoginUrl = h5LoginUrl.replace('https://', '');
		let url = result;
		url = url.replace('http://', '');
		url = url.replace('https://', '');
		//首页
		if (url == h5LoginUrl || url == h5LoginUrl + '/') {
			uni.reLaunch({
				url: uni.$api.appConfig.indexPath,
			});
			return;
		}

		if (url.startsWith(h5LoginUrl + '/')) {
			let pathFull = url.substr(h5LoginUrl.length);
			let path = pathFull.split('?')[0];
			let params = uni.$api.getRequestParameters(pathFull);
			let routesConfig = uni.$api.routesConfig;
			for (let item in routesConfig) {
				if (routesConfig[item].path == path) {
					uni.$api.router.push({
						route: routesConfig[item],
						query: params,
					});
					break;
				}
			}
		} else {
			//跳转到外部网页
			// #ifndef MP
			uni.$api.router.push({
				route: uni.$api.routesConfig.webview,
				query: {
					url: uni.$api.strEncode(result),
				},
			});
			// #endif
			// #ifdef MP
			uni.$api.toast(uni.$api.language.index.scanMpError);
			// #endif
		}
	} else {
		//核销
		await uni.$api.http
			.post(uni.$api.apiShop.orderProductVirtualVerificationCreate, {
				code: result,
			})
			.then((res) => {
				uni.$api.toast(uni.$api.language.index.virtualVerificationVerifySuccess);
			});
	}
}

async function getNotifyUnRead() {
	//通知消息
	await uni.$api.http.get(uni.$api.apiMember.notifyUnReadCount).then((res) => {
		data.notifyCount = res.data.count;
	});
}

function pageLoadingClick() {
	data.pageLoadingStatus = 'loading';
	getInfoData();
}

function handelTabSearch(key: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig.search,
		query: {
			key,
		},
	});
}

// 悬浮按钮 跳转
function fabClick(itemIndex: number, index: number) {
	const item = data.componentDiy[index].props.list[itemIndex].link;
	// 优惠劵
	if (item.activeMenuType == 'coupon') {
		onCoupon(item);
		return;
	}
	uni.$api.shop.linkJump(item);
}

// 分类/轮播图 跳转
function linkJumpIndexTab(index: number, itemIndex: number) {
	const item = data.componentDiy[index].props.list[itemIndex];
	// 优惠劵
	if (item.activeMenuType == 'coupon') {
		onCoupon(item);
		return;
	}
	uni.$api.shop.linkJump(item);
}

// 广告/魔方/标题导航 跳转
function linkJumpTab(val: any) {
	console.log(val);
	if (val.activeMenuType == 'coupon') {
		onCoupon(val);
		return;
	}
	uni.$api.shop.linkJump(val);
}

// 领取优惠劵
function onCoupon(item: any) {
	uni.$api.http
		.post(uni.$api.apiShop.couponReceive, {
			id: item.id,
		})
		.then((res) => {
			uni.$api.toast(uni.$api.language.product.couponGetSuccess);
		});
}

function toBack(type: string) {
	if (type == 'login') {
		uni.$api.router.push({
			route: uni.$api.routesConfig.login,
		});
		return;
	}
	// 获取当前页面栈，如果页面栈为1，则直接跳转到首页
	let pages = getCurrentPages();
	if (pages.length == 1) {
		uni.$api.router.redirectTo({
			route: uni.$api.routesConfig.index,
		});
	} else {
		uni.navigateBack();
	}
}

function copyDownloadAppUrl() {
	uni.$api.copy(sharePath());
	uni.$api.toast('已复制到剪贴板，请用普通浏览器打开，即可安装');
}

function sharePath() {
	let domain = uni.$api.appConfig.h5Domain;
	let url = '';
	if (domain.endsWith('/')) {
		domain = domain.substr(0, domain.length - 1);
	}
	// #ifdef MP
	url = `${uni.$api.routesConfig.customPage.path}?code=${data.customId}&type=${data.pageType}`;
	// #endif
	// #ifndef MP
	url = `${domain}${uni.$api.routesConfig.customPage.path}?code=${data.customId}&type=${data.pageType}`;
	// #endif
	if (userStore.hasLogin) {
		url = url + '&promo_code=' + userInfo.value.promo_code;
		if (userInfo.value.store_id) {
			url = url + '&store_id=' + userInfo.value.store_id;
		}
	}
	return url;
}

function toPage(url: string) {
	uni.$api.router.push({
		route: uni.$api.routesConfig[url],
	});
}

const {
	navbarHeight,
	config,
	pageType,
	scrollTop,
	productList,
	customTitle,
	authsType,
	componentDiy,
	notifyAnnounce,
	notifyCount,
	loadingStatus,
	customerService,
	sessionFrom,
	serviceType,
	isLoading,
	activeCurrent,
	pageLoadingShow,
	pageLoadingStatus,
	swiperAutoplay,
} = { ...toRefs(data) };
</script>
<!-- #ifdef APP-PLUS || MP-->
<style lang="scss">
page,
.custom-page {
	height: 100%;
}

.custom-page {
	position: relative;

	.custom-bg-img {
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 0;

		image {
			width: 100%;
			display: block;
			float: left;
			vertical-align: bottom;
			font-size: 0;
		}

		img {
			font-size: 0;
			width: 100%;
			display: block;
			float: left;
			vertical-align: bottom;
		}
	}
}
</style>
<!-- #endif -->

<!-- #ifdef H5 -->
<style lang="scss" scoped>
page,
.custom-page {
	height: 100%;
}

.custom-page {
	position: relative;

	.custom-bg-img {
		position: absolute;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 0;

		image {
			width: 100%;
			display: block;
			float: left;
			vertical-align: bottom;
			font-size: 0;
		}

		img {
			font-size: 0;
			width: 100%;
			display: block;
			float: left;
			vertical-align: bottom;
		}
	}
}
</style>
<!-- #endif -->

<style lang="scss">
.dz-banner {
	image {
		display: inline-block;
	}
}
</style>

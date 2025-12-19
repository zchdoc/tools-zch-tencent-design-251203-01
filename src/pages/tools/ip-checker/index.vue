<template>
  <div class="ip-checker">
    <!-- 标题区域 -->
    <div class="ip-checker__header">
      <h1 class="ip-checker__title">{{ t('pages.ipChecker.title') }}</h1>
      <p class="ip-checker__description">
        {{ t('pages.ipChecker.description') }}
      </p>
    </div>

    <t-divider />

    <!-- 操作按钮区域 -->
    <div class="ip-checker__actions">
      <t-space>
        <t-button theme="primary" :loading="isLoading" @click="handleRefresh">
          <template #icon><refresh-icon /></template>
          {{ t('pages.ipChecker.refresh') }}
        </t-button>
        <t-button theme="default" variant="outline" @click="handleClearAll">
          <template #icon><clear-icon /></template>
          {{ t('pages.ipChecker.clear') }}
        </t-button>
      </t-space>
    </div>

    <!-- IP 信息展示区域 -->
    <div class="ip-checker__content">
      <!-- 本地 IP 面板 -->
      <div class="ip-checker__panel">
        <div class="ip-checker__panel-header">
          <h3 class="ip-checker__panel-title">
            <laptop-icon class="ip-checker__panel-icon" />
            {{ t('pages.ipChecker.localIp') }}
          </h3>
          <t-tag v-if="localIps.length > 0" size="small" theme="primary" variant="light">
            {{ localIps.length }} {{ t('pages.ipChecker.items') }}
          </t-tag>
        </div>
        <div class="ip-checker__ip-list">
          <div v-if="localIps.length === 0" class="ip-checker__empty">
            <info-circle-icon class="ip-checker__empty-icon" />
            <span>{{ t('pages.ipChecker.noLocalIp') }}</span>
          </div>
          <div v-for="(ip, index) in localIps" :key="index" class="ip-checker__ip-item">
            <span class="ip-checker__ip-value">{{ ip }}</span>
            <t-tag size="small" theme="success" variant="light">{{ t('pages.ipChecker.localNetwork') }}</t-tag>
            <t-button size="small" variant="text" theme="primary" @click="handleCopy(ip)">
              <template #icon><file-copy-icon /></template>
            </t-button>
          </div>
        </div>
      </div>

      <!-- 公网 IP 面板（所有结果） -->
      <div class="ip-checker__panel">
        <div class="ip-checker__panel-header">
          <h3 class="ip-checker__panel-title">
            <internet-icon class="ip-checker__panel-icon" />
            {{ t('pages.ipChecker.publicIpAll') }}
          </h3>
          <t-tag v-if="allPublicIps.length > 0" size="small" theme="primary" variant="light">
            {{ allPublicIps.length }} {{ t('pages.ipChecker.items') }}
          </t-tag>
        </div>
        <div class="ip-checker__ip-list ip-checker__ip-list--scrollable">
          <div v-if="allPublicIps.length === 0 && !isLoading" class="ip-checker__empty">
            <info-circle-icon class="ip-checker__empty-icon" />
            <span>{{ t('pages.ipChecker.noPublicIp') }}</span>
          </div>
          <div v-if="isLoading && allPublicIps.length === 0" class="ip-checker__loading">
            <t-loading size="small" />
            <span>{{ t('pages.ipChecker.loading') }}</span>
          </div>
          <div v-for="(item, index) in allPublicIps" :key="index" class="ip-checker__ip-item">
            <span class="ip-checker__ip-index">{{ index + 1 }}</span>
            <span class="ip-checker__ip-value">{{ item.ip }}</span>
            <t-tag size="small" :theme="item.type === 'ipv6' ? 'warning' : 'primary'" variant="light">
              {{ item.type.toUpperCase() }}
            </t-tag>
            <span class="ip-checker__ip-source">{{ item.source }}</span>
            <t-button size="small" variant="text" theme="primary" @click="handleCopy(item.ip)">
              <template #icon><file-copy-icon /></template>
            </t-button>
          </div>
        </div>
      </div>

      <!-- 去重后的公网 IP 面板 -->
      <div class="ip-checker__panel ip-checker__panel--highlight">
        <div class="ip-checker__panel-header">
          <h3 class="ip-checker__panel-title">
            <check-circle-icon class="ip-checker__panel-icon" />
            {{ t('pages.ipChecker.publicIpUnique') }}
          </h3>
          <t-tag v-if="uniquePublicIps.length > 0" size="small" theme="success" variant="light">
            {{ uniquePublicIps.length }} {{ t('pages.ipChecker.items') }}
          </t-tag>
        </div>
        <div class="ip-checker__ip-list">
          <div v-if="uniquePublicIps.length === 0 && !isLoading" class="ip-checker__empty">
            <info-circle-icon class="ip-checker__empty-icon" />
            <span>{{ t('pages.ipChecker.noPublicIp') }}</span>
          </div>
          <div
            v-for="(ip, index) in uniquePublicIps"
            :key="index"
            class="ip-checker__ip-item ip-checker__ip-item--large"
          >
            <span class="ip-checker__ip-value ip-checker__ip-value--large">{{ ip }}</span>
            <t-button size="small" variant="text" theme="primary" @click="handleCopy(ip)">
              <template #icon><file-copy-icon /></template>
              {{ t('pages.ipChecker.copy') }}
            </t-button>
          </div>
        </div>
        <div v-if="uniquePublicIps.length > 0" class="ip-checker__panel-footer">
          <t-button variant="outline" @click="handleCopyAll">
            <template #icon><file-copy-icon /></template>
            {{ t('pages.ipChecker.copyAll') }}
          </t-button>
        </div>
      </div>
    </div>

    <!-- 检测进度 -->
    <div v-if="isLoading" class="ip-checker__progress">
      <t-progress
        :percentage="Math.round((completedCount / totalCount) * 100)"
        :color="{ from: '#0052D9', to: '#00A870' }"
      />
      <span class="ip-checker__progress-text">
        {{ t('pages.ipChecker.checking') }} {{ completedCount }}/{{ totalCount }}
      </span>
    </div>

    <!-- 相关网站推荐 -->
    <div class="ip-checker__related">
      <t-collapse>
        <t-collapse-panel :header="t('pages.ipChecker.relatedSites')" value="related">
          <div class="ip-checker__sites">
            <t-row :gutter="[16, 16]">
              <t-col v-for="(site, index) in relatedSites" :key="index" :xs="12" :sm="6" :md="4" :lg="3" :xl="2">
                <t-card class="ip-checker__site-card" :title="site.name" hover-shadow @click="handleOpenSite(site.url)">
                  <template #description>
                    <span class="ip-checker__site-desc">{{ site.description }}</span>
                  </template>
                  <template #footer>
                    <t-button size="small" variant="text" theme="primary">
                      <template #icon><jump-icon /></template>
                      {{ t('pages.ipChecker.visit') }}
                    </t-button>
                  </template>
                </t-card>
              </t-col>
            </t-row>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>

    <!-- 使用说明 -->
    <div class="ip-checker__tips">
      <t-collapse>
        <t-collapse-panel :header="t('pages.ipChecker.usageTitle')" value="tips">
          <div class="ip-checker__tips-content">
            <h4>{{ t('pages.ipChecker.whatIsIp') }}</h4>
            <ul>
              <li>{{ t('pages.ipChecker.ipTip1') }}</li>
              <li>{{ t('pages.ipChecker.ipTip2') }}</li>
              <li>{{ t('pages.ipChecker.ipTip3') }}</li>
            </ul>
            <h4>{{ t('pages.ipChecker.howItWorks') }}</h4>
            <ul>
              <li>{{ t('pages.ipChecker.workTip1') }}</li>
              <li>{{ t('pages.ipChecker.workTip2') }}</li>
              <li>{{ t('pages.ipChecker.workTip3') }}</li>
            </ul>
            <h4>{{ t('pages.ipChecker.apiSources') }}</h4>
            <ul>
              <li v-for="url in ipApiUrls" :key="url">
                <code>{{ url }}</code>
              </li>
            </ul>
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  CheckCircleIcon,
  ClearIcon,
  FileCopyIcon,
  InfoCircleIcon,
  InternetIcon,
  JumpIcon,
  LaptopIcon,
  RefreshIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'IpChecker',
});

const { t } = useI18n();

// IP API 列表
const ipApiUrls = [
  'https://checkip.amazonaws.com',
  'https://api.ipify.org',
  'https://ifconfig.me/ip',
  'https://icanhazip.com',
  'https://ipinfo.io/ip',
  'https://ipecho.net/plain',
  'https://checkipv4.dedyn.io',
];

// 相关网站
const relatedSites = computed(() => [
  { name: 'InfoByIP', url: 'https://zh.infobyip.com/', description: t('pages.ipChecker.siteDesc1') },
  { name: 'IP.SB', url: 'https://ip.skk.moe/', description: t('pages.ipChecker.siteDesc2') },
  { name: 'IP33', url: 'http://www.ip33.com/', description: t('pages.ipChecker.siteDesc3') },
  { name: 'IPInfo', url: 'https://ipinfo.io/', description: t('pages.ipChecker.siteDesc4') },
  { name: 'Test-IPv6', url: 'https://www.test-ipv6.com/', description: t('pages.ipChecker.siteDesc5') },
  { name: 'Tool.lu', url: 'https://tool.lu/ip/', description: t('pages.ipChecker.siteDesc6') },
  { name: 'IPW.cn', url: 'https://ipw.cn/', description: t('pages.ipChecker.siteDesc7') },
  { name: 'IP.im', url: 'https://ip.im/', description: t('pages.ipChecker.siteDesc8') },
  { name: 'IP.SB Whois', url: 'https://ip.sb/whois/', description: t('pages.ipChecker.siteDesc9') },
  { name: 'IP111', url: 'http://ip111.cn/', description: t('pages.ipChecker.siteDesc10') },
  { name: 'ChaiPIP', url: 'https://www.chaipip.com/aiwen.html', description: t('pages.ipChecker.siteDesc11') },
  { name: 'Ping0', url: 'https://ping0.cc/', description: t('pages.ipChecker.siteDesc12') },
]);

// 状态
const isLoading = ref(false);
const localIps = ref<string[]>([]);
const allPublicIps = ref<Array<{ ip: string; source: string; type: string }>>([]);
const completedCount = ref(0);
const totalCount = ref(ipApiUrls.length);

// 去重后的公网 IP
const uniquePublicIps = computed(() => {
  const ipSet = new Set<string>();
  allPublicIps.value.forEach((item) => {
    ipSet.add(item.ip);
  });
  return Array.from(ipSet);
});

// 检测本地 IP (WebRTC)
function getLocalIp() {
  return new Promise<void>((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      const localIPSet = new Set<string>();

      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch((err) => {
          console.error('WebRTC offer error:', err);
          resolve();
        });

      const timeout = setTimeout(() => {
        pc.close();
        resolve();
      }, 3000);

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipRegex = /(\d{1,3}(?:\.\d{1,3}){3})/;
          const match = ipRegex.exec(candidate);

          if (match) {
            const ipAddress = match[1];
            // 检查是否是内网 IP
            if (
              ipAddress.startsWith('192.168.') ||
              ipAddress.startsWith('10.') ||
              ipAddress.startsWith('172.16.') ||
              ipAddress.startsWith('172.17.') ||
              ipAddress.startsWith('172.18.') ||
              ipAddress.startsWith('172.19.') ||
              ipAddress.startsWith('172.2') ||
              ipAddress.startsWith('172.30.') ||
              ipAddress.startsWith('172.31.')
            ) {
              if (!localIPSet.has(ipAddress)) {
                localIPSet.add(ipAddress);
                localIps.value.push(ipAddress);
              }
            }
          }
        } else {
          clearTimeout(timeout);
          pc.close();
          resolve();
        }
      };
    } catch (error) {
      console.error('WebRTC not supported:', error);
      resolve();
    }
  });
}

// 检测公网 IP
async function getPublicIp(url: string): Promise<{ ip: string; source: string; type: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const ip = (await response.text()).trim();
      // 验证是否是有效的 IP 地址
      const ipv4Regex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex =
        /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$|^(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4}$/i;

      if (ipv4Regex.test(ip)) {
        return { ip, source: url, type: 'ipv4' };
      }
      if (ipv6Regex.test(ip)) {
        return { ip, source: url, type: 'ipv6' };
      }
      // 有些 API 可能返回带换行的内容
      const firstLine = ip.split('\n')[0].trim();
      if (ipv4Regex.test(firstLine)) {
        return { ip: firstLine, source: url, type: 'ipv4' };
      }
      if (ipv6Regex.test(firstLine)) {
        return { ip: firstLine, source: url, type: 'ipv6' };
      }
    }
    return null;
  } catch (error) {
    console.warn(`Failed to fetch IP from ${url}:`, error);
    return null;
  }
}

// 开始检测
async function startCheck() {
  isLoading.value = true;
  completedCount.value = 0;
  localIps.value = [];
  allPublicIps.value = [];

  // 先检测本地 IP
  await getLocalIp();

  // 并发检测公网 IP
  const promises = ipApiUrls.map(async (url) => {
    const result = await getPublicIp(url);
    completedCount.value++;
    if (result) {
      allPublicIps.value.push(result);
    }
  });

  await Promise.all(promises);
  isLoading.value = false;

  if (uniquePublicIps.value.length > 0) {
    MessagePlugin.success(t('pages.ipChecker.checkSuccess', { count: uniquePublicIps.value.length }));
  } else {
    MessagePlugin.warning(t('pages.ipChecker.checkFailed'));
  }
}

// 刷新
function handleRefresh() {
  startCheck();
}

// 清空
function handleClearAll() {
  localIps.value = [];
  allPublicIps.value = [];
  completedCount.value = 0;
  MessagePlugin.success(t('pages.ipChecker.clearSuccess'));
}

// 复制单个 IP
async function handleCopy(ip: string) {
  try {
    await navigator.clipboard.writeText(ip);
    MessagePlugin.success(t('pages.ipChecker.copySuccess'));
  } catch {
    MessagePlugin.error(t('pages.ipChecker.copyFailed'));
  }
}

// 复制所有去重后的 IP
async function handleCopyAll() {
  try {
    const text = uniquePublicIps.value.join('\n');
    await navigator.clipboard.writeText(text);
    MessagePlugin.success(t('pages.ipChecker.copyAllSuccess', { count: uniquePublicIps.value.length }));
  } catch {
    MessagePlugin.error(t('pages.ipChecker.copyFailed'));
  }
}

// 打开相关网站
function handleOpenSite(url: string) {
  window.open(url, '_blank');
}

// 初始化时自动检测
onMounted(() => {
  startCheck();
});
</script>
<style lang="less" scoped>
.ip-checker {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-large);

  &__header {
    margin-bottom: var(--td-comp-margin-xl);
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 8px;
  }

  &__description {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin: 0;
  }

  &__actions {
    margin-bottom: var(--td-comp-margin-xl);
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-xl);
  }

  &__content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--td-comp-margin-xl);
    margin-bottom: var(--td-comp-margin-xl);
  }

  &__panel {
    background-color: var(--td-bg-color-secondarycontainer);
    border-radius: var(--td-radius-medium);
    padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-l);

    &--highlight {
      background: linear-gradient(135deg, var(--td-brand-color-light) 0%, var(--td-success-color-1) 100%);
      border: 1px solid var(--td-brand-color-3);
    }
  }

  &__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--td-comp-margin-m);
  }

  &__panel-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--td-text-color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__panel-icon {
    font-size: 18px;
    color: var(--td-brand-color);
  }

  &__panel-footer {
    margin-top: var(--td-comp-margin-m);
    display: flex;
    justify-content: center;
  }

  &__ip-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--scrollable {
      max-height: 300px;
      overflow-y: auto;
    }
  }

  &__ip-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: var(--td-bg-color-container);
    border-radius: var(--td-radius-small);
    transition: all 0.2s;

    &:hover {
      background-color: var(--td-bg-color-container-hover);
    }

    &--large {
      padding: 12px 16px;
    }
  }

  &__ip-index {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
    min-width: 20px;
  }

  &__ip-value {
    font-family: Monaco, Menlo, Consolas, monospace;
    font-size: 14px;
    color: var(--td-text-color-primary);
    flex: 1;
    word-break: break-all;

    &--large {
      font-size: 18px;
      font-weight: 600;
    }
  }

  &__ip-source {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: var(--td-text-color-placeholder);

    &-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    color: var(--td-text-color-secondary);
  }

  &__progress {
    margin-bottom: var(--td-comp-margin-xl);
    display: flex;
    align-items: center;
    gap: var(--td-comp-margin-m);

    :deep(.t-progress) {
      flex: 1;
    }

    &-text {
      font-size: 14px;
      color: var(--td-text-color-secondary);
      white-space: nowrap;
    }
  }

  &__related {
    margin-bottom: var(--td-comp-margin-xl);
  }

  &__sites {
    padding: var(--td-comp-paddingTB-m) 0;
  }

  &__site-card {
    cursor: pointer;
    height: 100%;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.t-card__title) {
      font-size: 14px;
    }

    :deep(.t-card__footer) {
      padding-top: 8px;
    }
  }

  &__site-desc {
    font-size: 12px;
    color: var(--td-text-color-secondary);
  }

  &__tips {
    margin-bottom: var(--td-comp-margin-xl);

    &-content {
      h4 {
        margin: 16px 0 8px;
        color: var(--td-text-color-primary);
        font-weight: 500;

        &:first-child {
          margin-top: 0;
        }
      }

      ul {
        margin: 0;
        padding-left: 20px;
        color: var(--td-text-color-secondary);

        li {
          margin-bottom: 4px;
          line-height: 1.6;
        }
      }

      code {
        padding: 2px 6px;
        background-color: var(--td-bg-color-secondarycontainer);
        border-radius: var(--td-radius-small);
        font-family: Monaco, Menlo, Consolas, monospace;
        font-size: 12px;
        color: var(--td-brand-color);
      }
    }
  }
}

// 响应式适配
@media (width <= 768px) {
  .ip-checker {
    padding: var(--td-comp-paddingTB-l) var(--td-comp-paddingLR-l);

    &__content {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column;
      align-items: flex-start;
    }

    &__ip-source {
      display: none;
    }
  }
}
</style>

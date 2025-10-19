# 用户交易行为API - 前端开发指南

## 📋 目录

- [接口概述](#接口概述)
- [快速开始](#快速开始)
- [认证流程](#认证流程)
- [API详细说明](#api详细说明)
- [数据结构](#数据结构)
- [代码示例](#代码示例)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)

---

## 接口概述

### 基本信息

- **接口名称**: 用户交易行为查询
- **接口路径**: `/api/users/<user_id>/trading-behavior`
- **请求方法**: `GET`
- **认证方式**: JWT Bearer Token


### 功能说明

该接口提供用户在悠悠有品(YouPin898)平台的完整交易行为数据,包括:

✅ **用户基本信息**
- 历史昵称记录
- 历史店铺名记录

✅ **当前挂售信息**
- 在售商品列表
- 价格统计分析

✅ **交易统计**
- 发货速度统计
- 订单数量统计

✅ **时间线分析** ⭐ 新功能
- 求购历史时间线
- 挂售历史时间线
- 市场位次跟踪

---

## 快速开始

### 1. 安装依赖

```bash
npm install axios
# 或
yarn add axios
```

### 2. 基础配置

```javascript
// api/config.js


export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  USER_TRADING_BEHAVIOR: '/api/users/:userId/trading-behavior',
};
```

### 3. 最简示例

```javascript
import axios from 'axios';


// 2. 查询用户交易行为
const response = await axios.get(
  '/api/users/8990280/trading-behavior',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

console.log(response.data);
```

---

### 请求示例

```http
GET /api/users/8990280/trading-behavior HTTP/1.1
Host: 127.0.0.1:5002
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 响应数据结构

```typescript
interface TradingBehaviorResponse {
  user_id: number;                    // 用户ID
  timestamp: string;                  // 响应时间戳(ISO格式)
  user_info: UserInfo;                // 用户信息
  sell_commodities: SellCommodity[];  // 当前在售商品
  delivery_statistics: DeliveryStats; // 发货统计
  summary: Summary;                   // 汇总统计
  purchase_timeline: PurchaseItem[];  // 求购时间线 ⭐
  sell_timeline: SellItem[];          // 挂售时间线 ⭐
}
```

---

## 数据结构

### 1. UserInfo - 用户信息

```typescript
interface UserInfo {
  nickname_history: NicknameRecord[];   // 昵称历史
  store_name_history: StoreNameRecord[]; // 店铺名历史
}

interface NicknameRecord {
  nickname: string;      // 昵称
  first_seen: string;    // 首次出现时间
  last_seen: string;     // 最后出现时间
}

interface StoreNameRecord {
  store_name: string;    // 店铺名
  first_seen: string;    // 首次出现时间
  last_seen: string;     // 最后出现时间
}
```

**示例:**
```json
{
  "nickname_history": [
    {
      "nickname": "还不错啊哈哈",
      "first_seen": "2025-10-15T10:30:00",
      "last_seen": "2025-10-19T16:00:00"
    }
  ],
  "store_name_history": [
    {
      "store_name": "嘻嘻哈哈",
      "first_seen": "2025-10-15T10:30:00",
      "last_seen": "2025-10-19T16:00:00"
    }
  ]
}
```

### 2. SellCommodity - 在售商品

```typescript
interface SellCommodity {
  commodityId: number;        // 商品ID
  commodityNo: string;        // 商品编号
  commodityName: string;      // 商品名称
  price: string;              // 价格
  originalPrice?: string;     // 原价
  abrade: string;             // 磨损值
  exteriorName?: string;      // 外观名称
  userId: number;             // 卖家用户ID
  userNickName: string;       // 卖家昵称
  storeName: string;          // 店铺名
  canBargain: boolean;        // 是否可议价
  Stickers?: Sticker[];       // 印花列表
}

interface Sticker {
  Name: string;               // 印花名称
  Abrade: string;             // 印花磨损
  ImgUrl: string;             // 图片URL
  priceV1?: string;           // 印花价格
  StickerDesc: string;        // 印花描述
}
```

**示例:**
```json
{
  "commodityId": 1662676702,
  "commodityName": "AK-47 | 火蛇 (崭新出厂)",
  "price": "36000",
  "abrade": "0.0698197335004806500",
  "userNickName": "还不错啊哈哈",
  "storeName": "嘻嘻哈哈",
  "Stickers": [
    {
      "Name": "皇冠（闪亮）",
      "Abrade": "100%",
      "priceV1": "¥3248.5"
    }
  ]
}
```

### 3. DeliveryStats - 发货统计

```typescript
interface DeliveryStats {
  totalCount: number;         // 总订单数
  fastCount: number;          // 快速发货数
  avgHourCount: number;       // 平均发货时长(小时)
  rateStr: string;            // 快速发货率(百分比)
}
```

**示例:**
```json
{
  "totalCount": 150,
  "fastCount": 140,
  "avgHourCount": 2.5,
  "rateStr": "93.3%"
}
```

### 4. Summary - 汇总统计

```typescript
interface Summary {
  total_sell_commodities: number;  // 在售商品总数
  average_price: number;           // 平均价格
  max_price: number;               // 最高价格
  min_price: number;               // 最低价格
}
```

**示例:**
```json
{
  "total_sell_commodities": 25,
  "average_price": 15000,
  "max_price": 50000,
  "min_price": 500
}
```

### 5. PurchaseItem - 求购时间线项 ⭐

```typescript
interface PurchaseItem {
  crawl_time: string;         // 爬取时间(ISO格式)
  template_id: number;        // 模板ID
  template_name: string;      // 商品名称
  price: string;              // 求购价格
  quantity: number;           // 数量
  position: number;           // 在求购列表中的位次
  order_id?: number;          // 订单ID
  exterior?: string;          // 外观等级
  abrade_min?: string;        // 最小磨损
  abrade_max?: string;        // 最大磨损
}
```

**示例:**
```json
{
  "crawl_time": "2025-10-15T15:49:01.126149",
  "template_id": 49082,
  "template_name": "AK-47 | 火蛇 (崭新出厂)",
  "price": "35000",
  "quantity": 1,
  "position": 5,
  "exterior": "崭新出厂",
  "abrade_min": "0.00",
  "abrade_max": "0.07"
}
```

### 6. SellItem - 挂售时间线项 ⭐

```typescript
interface SellItem {
  crawl_time: string;         // 爬取时间(ISO格式)
  template_id: number;        // 模板ID
  template_name: string;      // 商品名称
  price: string;              // 挂售价格
  original_price?: string;    // 原价
  quantity: number;           // 数量
  position: number;           // 在挂售列表中的位次
  commodity_id: number;       // 商品ID
  commodity_no: string;       // 商品编号
  abrade: string;             // 磨损值
  exterior_name?: string;     // 外观名称
  can_bargain?: boolean;      // 是否可议价
  stickers: Sticker[];        // 印花列表
}
```

**示例:**
```json
{
  "crawl_time": "2025-10-15T15:49:01.126149",
  "template_id": 49082,
  "template_name": "AK-47 | 火蛇 (崭新出厂)",
  "price": "36000",
  "position": 10,
  "abrade": "0.0698197335004806500",
  "commodity_id": 1662676702,
  "stickers": [
    {
      "Name": "皇冠（闪亮）",
      "Abrade": "100%",
      "priceV1": "¥3248.5"
    }
  ]
}
```

---

## 代码示例

### React + Axios

#### 1. API Service封装

```javascript
// services/tradingApi.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5002';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 登录
export const login = async (username, password) => {
  const response = await apiClient.post('/api/auth/login', {
    username,
    password,
  });
  
  // 保存token
  if (response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
  }
  
  return response.data;
};

// 获取用户交易行为
export const getUserTradingBehavior = async (userId) => {
  const response = await apiClient.get(
    `/api/users/${userId}/trading-behavior`
  );
  return response.data;
};

export default apiClient;
```

#### 2. React Hook封装

```javascript
// hooks/useTradingBehavior.js
import { useState, useEffect } from 'react';
import { getUserTradingBehavior } from '../services/tradingApi';

export const useTradingBehavior = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getUserTradingBehavior(userId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  return { data, loading, error };
};
```

#### 3. React组件示例

```jsx
// components/UserTradingDashboard.jsx
import React from 'react';
import { useTradingBehavior } from '../hooks/useTradingBehavior';

const UserTradingDashboard = ({ userId }) => {
  const { data, loading, error } = useTradingBehavior(userId);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!data) return null;

  return (
    <div className="trading-dashboard">
      {/* 用户信息 */}
      <section className="user-info">
        <h2>用户信息</h2>
        <div>用户ID: {data.user_id}</div>
        {data.user_info.nickname_history.length > 0 && (
          <div>
            当前昵称: {data.user_info.nickname_history[0].nickname}
          </div>
        )}
        {data.user_info.store_name_history.length > 0 && (
          <div>
            店铺名: {data.user_info.store_name_history[0].store_name}
          </div>
        )}
      </section>

      {/* 统计信息 */}
      <section className="statistics">
        <h2>交易统计</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">在售商品</div>
            <div className="stat-value">
              {data.summary.total_sell_commodities}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">平均价格</div>
            <div className="stat-value">¥{data.summary.average_price}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">发货订单</div>
            <div className="stat-value">
              {data.delivery_statistics.totalCount}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">快速发货率</div>
            <div className="stat-value">
              {data.delivery_statistics.rateStr}
            </div>
          </div>
        </div>
      </section>

      {/* 挂售时间线 */}
      <section className="sell-timeline">
        <h2>挂售时间线 ({data.sell_timeline.length}条记录)</h2>
        <div className="timeline-list">
          {data.sell_timeline.slice(0, 10).map((item, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-time">
                {new Date(item.crawl_time).toLocaleString('zh-CN')}
              </div>
              <div className="timeline-content">
                <div className="item-name">{item.template_name}</div>
                <div className="item-details">
                  <span className="price">¥{item.price}</span>
                  <span className="position">位次: #{item.position}</span>
                  <span className="abrade">磨损: {item.abrade}</span>
                </div>
                {item.stickers.length > 0 && (
                  <div className="stickers">
                    印花: {item.stickers.map(s => s.Name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 求购时间线 */}
      {data.purchase_timeline.length > 0 && (
        <section className="purchase-timeline">
          <h2>求购时间线 ({data.purchase_timeline.length}条记录)</h2>
          <div className="timeline-list">
            {data.purchase_timeline.slice(0, 10).map((item, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-time">
                  {new Date(item.crawl_time).toLocaleString('zh-CN')}
                </div>
                <div className="timeline-content">
                  <div className="item-name">{item.template_name}</div>
                  <div className="item-details">
                    <span className="price">¥{item.price}</span>
                    <span className="position">位次: #{item.position}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default UserTradingDashboard;
```

### Vue 3 + Composition API

```vue
<!-- components/UserTradingDashboard.vue -->
<template>
  <div class="trading-dashboard">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error }}</div>
    <div v-else-if="data">
      <!-- 用户信息 -->
      <section class="user-info">
        <h2>用户信息</h2>
        <div>用户ID: {{ data.user_id }}</div>
        <div v-if="data.user_info.nickname_history.length">
          当前昵称: {{ data.user_info.nickname_history[0].nickname }}
        </div>
      </section>

      <!-- 统计卡片 -->
      <section class="statistics">
        <h2>交易统计</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">在售商品</div>
            <div class="stat-value">{{ data.summary.total_sell_commodities }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">平均价格</div>
            <div class="stat-value">¥{{ data.summary.average_price }}</div>
          </div>
        </div>
      </section>

      <!-- 挂售时间线 -->
      <section class="sell-timeline">
        <h2>挂售时间线 ({{ data.sell_timeline.length }}条)</h2>
        <div 
          v-for="(item, index) in data.sell_timeline.slice(0, 10)" 
          :key="index"
          class="timeline-item"
        >
          <div class="timeline-time">
            {{ formatDate(item.crawl_time) }}
          </div>
          <div class="timeline-content">
            <div class="item-name">{{ item.template_name }}</div>
            <div class="item-details">
              <span class="price">¥{{ item.price }}</span>
              <span class="position">位次: #{{ item.position }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const props = defineProps({
  userId: {
    type: Number,
    required: true
  }
});

const data = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchData = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `http://127.0.0.1:5002/api/users/${props.userId}/trading-behavior`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    data.value = response.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchData();
});
</script>
```

### 原生JavaScript / Fetch API

```javascript
// 登录并获取数据
async function getUserTradingData(userId) {
  try {
    // 1. 登录
    const loginResponse = await fetch('http://127.0.0.1:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Aldno',
        password: 'your_password'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // 2. 获取交易行为
    const response = await fetch(
      `http://127.0.0.1:5002/api/users/${userId}/trading-behavior`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 使用示例
getUserTradingData(8990280).then(data => {
  console.log('用户ID:', data.user_id);
  console.log('在售商品数:', data.summary.total_sell_commodities);
  console.log('挂售时间线:', data.sell_timeline.length, '条记录');
  console.log('求购时间线:', data.purchase_timeline.length, '条记录');
});
```

---

## 错误处理

### 常见错误码

| HTTP状态码 | 错误说明 | 处理方式 |
|-----------|---------|---------|
| 400 | 请求参数错误 | 检查user_id格式 |
| 401 | 未授权/Token无效 | 重新登录获取token |
| 404 | 用户不存在 | 提示用户ID不存在 |
| 500 | 服务器内部错误 | 稍后重试或联系管理员 |

### 错误处理示例

```javascript
// 统一错误处理
const handleApiError = (error) => {
  if (error.response) {
    // 服务器返回了错误响应
    switch (error.response.status) {
      case 400:
        return '请求参数错误,请检查用户ID';
      case 401:
        // Token过期,清除并跳转登录
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        return '登录已过期,请重新登录';
      case 404:
        return '用户不存在';
      case 500:
        return '服务器错误,请稍后重试';
      default:
        return '请求失败,请重试';
    }
  } else if (error.request) {
    // 请求已发送但没有收到响应
    return '网络错误,请检查连接';
  } else {
    // 其他错误
    return error.message;
  }
};

// 在API调用中使用
try {
  const data = await getUserTradingBehavior(userId);
  // 处理数据...
} catch (error) {
  const errorMessage = handleApiError(error);
  alert(errorMessage);
}
```

---

## 最佳实践

### 1. Token管理

```javascript
// utils/auth.js
class AuthManager {
  static setToken(token) {
    localStorage.setItem('auth_token', token);
  }
  
  static getToken() {
    return localStorage.getItem('auth_token');
  }
  
  static removeToken() {
    localStorage.removeItem('auth_token');
  }
  
  static isAuthenticated() {
    return !!this.getToken();
  }
}

export default AuthManager;
```

### 2. 请求缓存

```javascript
// 简单的缓存实现
class ApiCache {
  constructor(ttl = 60000) { // 默认1分钟过期
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}

const cache = new ApiCache(60000); // 1分钟缓存

export const getUserTradingBehaviorCached = async (userId) => {
  const cacheKey = `trading_${userId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await getUserTradingBehavior(userId);
  cache.set(cacheKey, data);
  return data;
};
```

### 3. 加载状态管理

```javascript
// hooks/useAsyncData.js
import { useState, useCallback } from 'react';

export const useAsyncData = (asyncFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};
```

### 4. 数据格式化工具

```javascript
// utils/formatters.js

// 格式化价格
export const formatPrice = (price) => {
  return `¥${Number(price).toLocaleString('zh-CN')}`;
};

// 格式化日期
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化相对时间
export const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return formatDate(dateString);
};

// 格式化磨损值
export const formatAbrade = (abrade) => {
  const value = parseFloat(abrade);
  if (isNaN(value)) return abrade;
  return value.toFixed(4);
};
```

### 5. TypeScript类型定义

```typescript
// types/trading.ts

export interface TradingBehaviorResponse {
  user_id: number;
  timestamp: string;
  user_info: UserInfo;
  sell_commodities: SellCommodity[];
  delivery_statistics: DeliveryStats;
  summary: Summary;
  purchase_timeline: PurchaseItem[];
  sell_timeline: SellItem[];
}

export interface UserInfo {
  nickname_history: NicknameRecord[];
  store_name_history: StoreNameRecord[];
}

export interface NicknameRecord {
  nickname: string;
  first_seen: string;
  last_seen: string;
}

export interface StoreNameRecord {
  store_name: string;
  first_seen: string;
  last_seen: string;
}

export interface SellCommodity {
  commodityId: number;
  commodityNo: string;
  commodityName: string;
  price: string;
  originalPrice?: string;
  abrade: string;
  exteriorName?: string;
  userId: number;
  userNickName: string;
  storeName: string;
  canBargain: boolean;
  Stickers?: Sticker[];
}

export interface Sticker {
  Name: string;
  Abrade: string;
  ImgUrl: string;
  priceV1?: string;
  StickerDesc: string;
}

export interface DeliveryStats {
  totalCount: number;
  fastCount: number;
  avgHourCount: number;
  rateStr: string;
}

export interface Summary {
  total_sell_commodities: number;
  average_price: number;
  max_price: number;
  min_price: number;
}

export interface PurchaseItem {
  crawl_time: string;
  template_id: number;
  template_name: string;
  price: string;
  quantity: number;
  position: number;
  order_id?: number;
  exterior?: string;
  abrade_min?: string;
  abrade_max?: string;
}

export interface SellItem {
  crawl_time: string;
  template_id: number;
  template_name: string;
  price: string;
  original_price?: string;
  quantity: number;
  position: number;
  commodity_id: number;
  commodity_no: string;
  abrade: string;
  exterior_name?: string;
  can_bargain?: boolean;
  stickers: Sticker[];
}
```

---

## UI设计建议

### 1. 数据展示布局

```
┌─────────────────────────────────────────────┐
│          用户交易行为分析                      │
├─────────────────────────────────────────────┤
│                                             │
│  【用户信息卡片】                             │
│  ┌──────────┬──────────┬──────────┐        │
│  │ 用户ID   │ 当前昵称  │ 店铺名   │        │
│  └──────────┴──────────┴──────────┘        │
│                                             │
│  【统计卡片组】                               │
│  ┌─────────┬─────────┬─────────┬─────────┐│
│  │在售商品  │平均价格  │订单数   │发货率   ││
│  │   25    │ ¥15000  │  150   │ 93.3%  ││
│  └─────────┴─────────┴─────────┴─────────┘│
│                                             │
│  【挂售时间线】                              │
│  ┌─────────────────────────────────────┐  │
│  │ 📅 2025-10-15 15:49                │  │
│  │ AK-47 | 火蛇 (崭新出厂)              │  │
│  │ ¥36,000  |  位次: #10  |  磨损: 0.07 │  │
│  │ 印花: 皇冠x3                         │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  【求购时间线】                              │
│  ┌─────────────────────────────────────┐  │
│  │ 📅 2025-10-14 10:20                │  │
│  │ M4A4 | 龙王 (崭新出厂)               │  │
│  │ ¥28,000  |  位次: #3                │  │
│  └─────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. 颜色方案建议

```css
/* 主题色 */
--primary-color: #1890ff;      /* 主色调 */
--success-color: #52c41a;      /* 成功/上涨 */
--warning-color: #faad14;      /* 警告 */
--danger-color: #f5222d;       /* 危险/下跌 */
--info-color: #13c2c2;         /* 信息 */

/* 背景色 */
--bg-primary: #ffffff;         /* 主背景 */
--bg-secondary: #f0f2f5;       /* 次背景 */
--bg-card: #ffffff;            /* 卡片背景 */

/* 文字色 */
--text-primary: #262626;       /* 主文字 */
--text-secondary: #8c8c8c;     /* 次要文字 */
--text-disabled: #bfbfbf;      /* 禁用文字 */
```

### 3. 响应式设计

```css
/* 移动端适配 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr); /* 2列布局 */
  }
  
  .timeline-item {
    font-size: 14px;
    padding: 12px;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面端 */
@media (min-width: 1025px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr); /* 4列布局 */
  }
}
```

---

## 性能优化建议

### 1. 虚拟滚动(大数据量时)

```javascript
// 使用react-window实现虚拟滚动
import { FixedSizeList } from 'react-window';

const TimelineList = ({ items }) => {
  const Row = ({ index, style }) => (
    <div style={style} className="timeline-item">
      <TimelineItem item={items[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

### 2. 分页加载

```javascript
const [page, setPage] = useState(1);
const pageSize = 20;

const visibleItems = useMemo(() => {
  const start = 0;
  const end = page * pageSize;
  return data.sell_timeline.slice(start, end);
}, [data, page]);

const loadMore = () => {
  setPage(prev => prev + 1);
};
```

### 3. 图片懒加载

```jsx
// 使用Intersection Observer
const LazyImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState('');
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={imageSrc} alt={alt} />;
};
```

---

## 常见问题(FAQ)

### Q1: Token过期怎么处理?

**A:** 实现自动刷新token机制:

```javascript
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token过期,重新登录
      const token = await refreshToken();
      if (token) {
        error.config.headers.Authorization = `Bearer ${token}`;
        return apiClient.request(error.config);
      }
      // 跳转登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Q2: 如何处理时间线数据为空的情况?

**A:** 友好的空状态提示:

```jsx
{data.sell_timeline.length === 0 ? (
  <div className="empty-state">
    <img src="/empty.svg" alt="暂无数据" />
    <p>暂无挂售记录</p>
  </div>
) : (
  <TimelineList items={data.sell_timeline} />
)}
```

### Q3: 如何优化大量数据的渲染性能?

**A:** 使用以下策略:
- 虚拟滚动(react-window, react-virtualized)
- 分页加载
- 懒加载
- memo化组件
- 防抖/节流

### Q4: 跨域问题如何解决?

**A:** 后端已配置CORS,前端无需额外处理。如有问题,可在开发环境使用代理:

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true
      }
    }
  }
}
```

---

## 测试建议

### 单元测试示例(Jest + React Testing Library)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import UserTradingDashboard from './UserTradingDashboard';
import * as api from '../services/tradingApi';

jest.mock('../services/tradingApi');

describe('UserTradingDashboard', () => {
  const mockData = {
    user_id: 8990280,
    sell_timeline: [
      {
        crawl_time: '2025-10-15T15:49:01',
        template_name: 'AK-47 | 火蛇',
        price: '36000',
        position: 10
      }
    ],
    purchase_timeline: []
  };

  it('应该正确显示用户ID', async () => {
    api.getUserTradingBehavior.mockResolvedValue(mockData);
    
    render(<UserTradingDashboard userId={8990280} />);
    
    await waitFor(() => {
      expect(screen.getByText('用户ID: 8990280')).toBeInTheDocument();
    });
  });

  it('应该显示挂售时间线', async () => {
    api.getUserTradingBehavior.mockResolvedValue(mockData);
    
    render(<UserTradingDashboard userId={8990280} />);
    
    await waitFor(() => {
      expect(screen.getByText('AK-47 | 火蛇')).toBeInTheDocument();
      expect(screen.getByText(/¥36000/)).toBeInTheDocument();
    });
  });
});
```

---

## 更新日志

### v1.0.0 (2025-10-19)
- ✅ 初始版本发布
- ✅ 支持用户信息查询
- ✅ 支持在售商品列表
- ✅ 支持发货统计
- ✅ **新增** 求购时间线功能
- ✅ **新增** 挂售时间线功能
- ✅ **新增** 市场位次追踪

---

## 联系与支持

- **API文档**: [trading-behavior-api.md](./trading-behavior-api.md)
- **功能总结**: [timeline-feature-summary.md](./timeline-feature-summary.md)
- **开发环境**: macOS, Python 3.13, Flask

---

**文档版本**: 1.0.0  
**最后更新**: 2025-10-19  
**维护者**: Development Team

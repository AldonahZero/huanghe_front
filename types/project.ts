// 项目详情页面的数据类型定义

// 用户基础信息
export interface UserProfile {
    userId: string;          // 用户ID (不变)
    userName: string;        // 用户名称 (可变)
    avatarUrl?: string;      // 头像URL
}

// 求购数据
export interface BuyOrder {
    userId: string;
    userName: string;
    avatarUrl?: string;
    orderCount: number;      // 求购数量
    timestamp: number;       // 时间戳
    position?: number;       // 求购位次
}

// 求购位次分布数据
export interface PositionDistribution {
    userId: string;
    userName: string;
    positions: {
        position: number;      // 位次 (1-30)
        count: number;         // 出现次数
    }[];
    totalOrders: number;     // 总求购次数
}

// 在售数据
export interface SellListing {
    userId: string;
    userName: string;        // 店铺名
    userNickName?: string;   // 用户昵称
    avatarUrl?: string;
    listingCount: number;    // 挂售数量
    timestamp: number;
}

// 成交记录
export interface Transaction {
    transactionId: string;
    buyerId: string;         // 买家ID
    sellerId: string;        // 卖家ID
    price: number;
    timestamp: number;
}

// 用户交易统计
export interface UserTransactionStats {
    userId: string;
    userName: string;
    avatarUrl?: string;
    buyCount: number;        // 买入次数
    sellCount: number;       // 卖出次数
    totalCount: number;      // 总交易次数
}

// 用户间交易关系
export interface UserPairTransaction {
    user1Id: string;
    user1Name: string;
    user2Id: string;
    user2Name: string;
    user1BoughtFromUser2: number;  // user1从user2买入次数
    user2BoughtFromUser1: number;  // user2从user1买入次数
    totalTransactions: number;     // 总交易次数
}

// 项目详情数据 (按小时聚合)
export interface ProjectDetailData {
    projectId: string;
    projectName: string;
    itemImage?: string;
    hourlyData: HourlyData[];
}

// 每小时的数据快照
export interface HourlyData {
    timestamp: number;        // 小时时间戳
    buyOrders: BuyOrder[];    // 求购列表 (前30名)
    sellListings: SellListing[]; // 在售列表 (前30名)
    transactions: Transaction[];  // 该小时的成交记录
}

// 分析结果数据
export interface AnalysisResult {
    // 求购分析
    topBuyers: BuyOrder[];                    // 前30名求购者
    buyerPositionDistribution: PositionDistribution[]; // 频繁求购者的位次分布

    // 在售分析
    topSellers: SellListing[];                // 前30名挂售者

    // 成交分析
    topBuyers_transactions: UserTransactionStats[];  // 买的最多的用户
    topSellers_transactions: UserTransactionStats[]; // 卖的最多的用户
    activePairs: UserPairTransaction[];       // 活跃交易对
}

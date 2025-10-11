import {
    ProjectDetailData,
    HourlyData,
    BuyOrder,
    SellListing,
    Transaction,
    AnalysisResult,
    UserTransactionStats,
    UserPairTransaction,
    PositionDistribution,
} from "@/types/project";

// 生成模拟用户数据
const generateMockUsers = (count: number) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push({
            userId: `user_${1000 + i}`,
            userName: `玩家${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ""}`,
            avatarUrl: `/logo.ico`,
        });
    }
    return users;
};

const mockUsers = generateMockUsers(100);

// 生成模拟的每小时数据
const generateHourlyData = (hoursBack: number): HourlyData[] => {
    const hourlyData: HourlyData[] = [];
    const now = Date.now();

    for (let h = hoursBack; h >= 0; h--) {
        const timestamp = now - h * 3600 * 1000;

        // 生成求购订单 (前30名)
        const buyOrders: BuyOrder[] = [];
        for (let i = 0; i < 30; i++) {
            const user = mockUsers[Math.floor(Math.random() * 60)]; // 从前60个用户中随机
            buyOrders.push({
                userId: user.userId,
                userName: user.userName,
                avatarUrl: user.avatarUrl,
                orderCount: Math.floor(Math.random() * 20) + 1,
                timestamp,
                position: i + 1,
            });
        }

        // 生成在售列表 (前30名)
        const sellListings: SellListing[] = [];
        for (let i = 0; i < 30; i++) {
            const user = mockUsers[Math.floor(Math.random() * 60) + 20]; // 从另一部分用户中随机
            sellListings.push({
                userId: user.userId,
                userName: user.userName,
                avatarUrl: user.avatarUrl,
                listingCount: Math.floor(Math.random() * 15) + 1,
                timestamp,
            });
        }

        // 生成成交记录
        const transactions: Transaction[] = [];
        const transactionCount = Math.floor(Math.random() * 50) + 20;
        for (let i = 0; i < transactionCount; i++) {
            const buyer = mockUsers[Math.floor(Math.random() * 80)];
            const seller = mockUsers[Math.floor(Math.random() * 80)];
            if (buyer.userId !== seller.userId) {
                transactions.push({
                    transactionId: `tx_${timestamp}_${i}`,
                    buyerId: buyer.userId,
                    sellerId: seller.userId,
                    price: Math.random() * 1000 + 50,
                    timestamp: timestamp + Math.floor(Math.random() * 3600000),
                });
            }
        }

        hourlyData.push({
            timestamp,
            buyOrders,
            sellListings,
            transactions,
        });
    }

    return hourlyData.reverse();
};

// 分析数据函数
export const analyzeProjectData = (
    hourlyData: HourlyData[],
    timeRangeHours: number = 24
): AnalysisResult => {
    // 选择时间范围内的数据
    const now = Date.now();
    const cutoffTime = now - timeRangeHours * 3600 * 1000;
    const filteredData = hourlyData.filter((d) => d.timestamp >= cutoffTime);

    // 1. 分析求购数据
    const buyOrderMap = new Map<string, BuyOrder>();
    const positionMap = new Map<string, number[]>();

    filteredData.forEach((hourData) => {
        hourData.buyOrders.forEach((order) => {
            const existing = buyOrderMap.get(order.userId);
            if (existing) {
                existing.orderCount += order.orderCount;
            } else {
                buyOrderMap.set(order.userId, { ...order });
            }

            // 记录位次分布
            if (!positionMap.has(order.userId)) {
                positionMap.set(order.userId, []);
            }
            if (order.position) {
                positionMap.get(order.userId)!.push(order.position);
            }
        });
    });

    const topBuyers = Array.from(buyOrderMap.values())
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 30);

    // 生成位次分布 (选择前10个最活跃的求购者)
    const buyerPositionDistribution: PositionDistribution[] = topBuyers
        .slice(0, 10)
        .map((buyer) => {
            const positions = positionMap.get(buyer.userId) || [];
            const positionCounts = new Map<number, number>();

            positions.forEach((pos) => {
                positionCounts.set(pos, (positionCounts.get(pos) || 0) + 1);
            });

            return {
                userId: buyer.userId,
                userName: buyer.userName,
                positions: Array.from(positionCounts.entries())
                    .map(([position, count]) => ({ position, count }))
                    .sort((a, b) => a.position - b.position),
                totalOrders: positions.length,
            };
        });

    // 2. 分析在售数据
    const sellListingMap = new Map<string, SellListing>();

    filteredData.forEach((hourData) => {
        hourData.sellListings.forEach((listing) => {
            const existing = sellListingMap.get(listing.userId);
            if (existing) {
                existing.listingCount += listing.listingCount;
            } else {
                sellListingMap.set(listing.userId, { ...listing });
            }
        });
    });

    const topSellers = Array.from(sellListingMap.values())
        .sort((a, b) => b.listingCount - a.listingCount)
        .slice(0, 30);

    // 3. 分析成交数据
    const buyStatsMap = new Map<string, number>();
    const sellStatsMap = new Map<string, number>();
    const pairTransactionMap = new Map<string, { buyer: string; seller: string; count: number }[]>();

    filteredData.forEach((hourData) => {
        hourData.transactions.forEach((tx) => {
            // 统计买入
            buyStatsMap.set(tx.buyerId, (buyStatsMap.get(tx.buyerId) || 0) + 1);
            // 统计卖出
            sellStatsMap.set(tx.sellerId, (sellStatsMap.get(tx.sellerId) || 0) + 1);

            // 统计交易对
            const pairKey = [tx.buyerId, tx.sellerId].sort().join(":");
            if (!pairTransactionMap.has(pairKey)) {
                pairTransactionMap.set(pairKey, []);
            }
            pairTransactionMap.get(pairKey)!.push({
                buyer: tx.buyerId,
                seller: tx.sellerId,
                count: 1,
            });
        });
    });

    // 生成买家统计
    const topBuyers_transactions: UserTransactionStats[] = Array.from(
        buyStatsMap.entries()
    )
        .map(([userId, buyCount]) => {
            const user = mockUsers.find((u) => u.userId === userId) || {
                userId,
                userName: userId,
                avatarUrl: "/logo.ico",
            };
            return {
                userId,
                userName: user.userName,
                avatarUrl: user.avatarUrl,
                buyCount,
                sellCount: sellStatsMap.get(userId) || 0,
                totalCount: buyCount + (sellStatsMap.get(userId) || 0),
            };
        })
        .sort((a, b) => b.buyCount - a.buyCount)
        .slice(0, 20);

    // 生成卖家统计
    const topSellers_transactions: UserTransactionStats[] = Array.from(
        sellStatsMap.entries()
    )
        .map(([userId, sellCount]) => {
            const user = mockUsers.find((u) => u.userId === userId) || {
                userId,
                userName: userId,
                avatarUrl: "/logo.ico",
            };
            return {
                userId,
                userName: user.userName,
                avatarUrl: user.avatarUrl,
                buyCount: buyStatsMap.get(userId) || 0,
                sellCount,
                totalCount: sellCount + (buyStatsMap.get(userId) || 0),
            };
        })
        .sort((a, b) => b.sellCount - a.sellCount)
        .slice(0, 20);

    // 生成活跃交易对
    const activePairs: UserPairTransaction[] = [];
    pairTransactionMap.forEach((transactions, pairKey) => {
        const [userId1, userId2] = pairKey.split(":");
        const user1 = mockUsers.find((u) => u.userId === userId1);
        const user2 = mockUsers.find((u) => u.userId === userId2);

        let user1BoughtFromUser2 = 0;
        let user2BoughtFromUser1 = 0;

        transactions.forEach((tx) => {
            if (tx.buyer === userId1 && tx.seller === userId2) {
                user1BoughtFromUser2++;
            } else if (tx.buyer === userId2 && tx.seller === userId1) {
                user2BoughtFromUser1++;
            }
        });

        if (transactions.length >= 3) {
            // 至少3次交易才算活跃
            activePairs.push({
                user1Id: userId1,
                user1Name: user1?.userName || userId1,
                user2Id: userId2,
                user2Name: user2?.userName || userId2,
                user1BoughtFromUser2,
                user2BoughtFromUser1,
                totalTransactions: transactions.length,
            });
        }
    });

    activePairs.sort((a, b) => b.totalTransactions - a.totalTransactions);

    return {
        topBuyers,
        buyerPositionDistribution,
        topSellers,
        topBuyers_transactions,
        topSellers_transactions,
        activePairs: activePairs.slice(0, 20),
    };
};

// 生成模拟项目数据
export const generateMockProjectData = (
    projectId: string
): ProjectDetailData => {
    return {
        projectId,
        projectName: "AK-47 | Redline (Field-Tested)",
        itemImage: "/file.svg",
        hourlyData: generateHourlyData(72), // 过去72小时的数据
    };
};

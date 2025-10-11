export type Item = {
    id: string;
    name: string;
    wear: string;
    price: number;
    change24h: number;
    image?: string;
    tags?: string[];
};

export const dashboardItems: Item[] = [
    {
        id: 'ak_redline',
        name: 'AK-47 | Redline',
        wear: 'Field-Tested',
        price: 24.5,
        change24h: -2.3,
        image: '/file.svg',
        tags: ['Rifle', 'Popular']
    },
    {
        id: 'knife_bayonet',
        name: 'Bayonet | Doppler',
        wear: 'Factory New',
        price: 450.0,
        change24h: 4.2,
        image: '/globe.svg',
        tags: ['Knife', 'High Value']
    },
    {
        id: 'awp_dragon',
        name: 'AWP | Dragon Lore',
        wear: 'Well-Worn',
        price: 1200.0,
        change24h: 1.1,
        image: '/window.svg',
        tags: ['Sniper', 'Legendary']
    },
    {
        id: 'm4a1_neon',
        name: 'M4A1-S | Neon Rider',
        wear: 'Minimal Wear',
        price: 85.0,
        change24h: -0.7,
        image: '/next.svg',
        tags: ['Rifle']
    }
];

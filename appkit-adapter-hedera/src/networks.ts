import type { CustomCaipNetwork } from '@reown/appkit-common'

export const hederaMainnet: CustomCaipNetwork<'hedera'> = {
    id: 295,
    name: 'Hedera Mainnet',
    chainNamespace: 'hedera',
    caipNetworkId: 'hedera:mainnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
    rpcUrls: {
        default: { http: ['https://mainnet.hashio.io/api'] },
    },
    blockExplorers: {
        default: { name: 'Hashscan', url: 'https://hashscan.io/mainnet' },
    },
}

export const hederaTestnet: CustomCaipNetwork<'hedera'> = {
    id: 296,
    name: 'Hedera Testnet',
    chainNamespace: 'hedera',
    caipNetworkId: 'hedera:testnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
    rpcUrls: {
        default: { http: ['https://testnet.hashio.io/api'] },
    },
    blockExplorers: {
        default: { name: 'Hashscan', url: 'https://hashscan.io/testnet' },
    },
    testnet: true,
}

export const hederaPreviewnet: CustomCaipNetwork<'hedera'> = {
    id: 297,
    name: 'Hedera Previewnet',
    chainNamespace: 'hedera',
    caipNetworkId: 'hedera:previewnet',
    nativeCurrency: { name: 'HBAR', symbol: 'HBAR', decimals: 8 },
    rpcUrls: {
        default: { http: ['https://previewnet.hashio.io/api'] },
    },
    blockExplorers: {
        default: { name: 'Hashscan', url: 'https://hashscan.io/previewnet' },
    },
    testnet: true,
}

export const HEDERA_MIRROR_NODES: Record<string, string> = {
    'hedera:mainnet': 'https://mainnet.mirrornode.hedera.com',
    'hedera:testnet': 'https://testnet.mirrornode.hedera.com',
    'hedera:previewnet': 'https://previewnet.mirrornode.hedera.com',
}

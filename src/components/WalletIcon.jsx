import {
    IoWalletOutline,
    IoCardOutline,
    IoCashOutline,
    IoPhonePortraitOutline,
    IoBusinessOutline,
    IoStorefrontOutline,
    IoGiftOutline,
    IoRocketOutline,
    IoShieldCheckmarkOutline,
    IoLogoUsd,
    IoStar,
    IoHeartOutline,
    IoDiamondOutline,
    IoFlashOutline,
    IoTrendingUpOutline,
} from 'react-icons/io5';

// Map icon key → React component
export const WALLET_ICON_MAP = {
    'wallet': { component: IoWalletOutline, label: 'Dompet' },
    'cash': { component: IoCashOutline, label: 'Tunai' },
    'card': { component: IoCardOutline, label: 'Kartu' },
    'phone': { component: IoPhonePortraitOutline, label: 'E-Wallet' },
    'bank': { component: IoBusinessOutline, label: 'Bank' },
    'store': { component: IoStorefrontOutline, label: 'Toko' },
    'gift': { component: IoGiftOutline, label: 'Hadiah' },
    'rocket': { component: IoRocketOutline, label: 'Investasi' },
    'shield': { component: IoShieldCheckmarkOutline, label: 'Asuransi' },
    'dollar': { component: IoLogoUsd, label: 'Dollar' },
    'star': { component: IoStar, label: 'Bintang' },
    'heart': { component: IoHeartOutline, label: 'Favorit' },
    'diamond': { component: IoDiamondOutline, label: 'Premium' },
    'flash': { component: IoFlashOutline, label: 'Cepat' },
    'trending': { component: IoTrendingUpOutline, label: 'Saham' },
};

// All icon keys for pickers
export const WALLET_ICON_KEYS = Object.keys(WALLET_ICON_MAP);

/**
 * Render a wallet icon. Handles both old emoji strings and new icon keys.
 * @param {string} icon - The icon key or emoji string
 * @param {object} props - Additional props to pass to the icon component (e.g. style, className)
 * @returns {JSX.Element}
 */
export function WalletIcon({ icon, size = 20, ...props }) {
    const entry = WALLET_ICON_MAP[icon];
    if (entry) {
        const IconComponent = entry.component;
        return <IconComponent size={size} {...props} />;
    }
    // Fallback: render as emoji text (backwards compatible with old data)
    return <span style={{ fontSize: size * 0.9, lineHeight: 1 }} {...props}>{icon}</span>;
}

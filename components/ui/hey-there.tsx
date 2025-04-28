'use client';

import { useEffect } from 'react';

interface HeyThereProps {
    message?: string;
}

export default function HeyThere({ message = "👋 Welcome to PaletteLab! 🎨\nThanks for using my tool! If you enjoy it, please share with others or consider contributing to make it even better!\nhttps://github.com/marcelytumy/palettelab" }: HeyThereProps) {
    useEffect(() => {
        console.log(
            `%c${message}`, 
            'padding: 10px; font-weight: bold; font-size: 14px;'
        );
    }, [message]);

    return null; // This component doesn't render anything visually
}
import dynamic from 'next/dynamic';

// Lazily load the color wheel component
const LazyColorWheel = dynamic(() => import('@uiw/react-color-wheel'), {
  ssr: false, // Disable server-side rendering since this is a client-side only component
  loading: () => <div className="w-[160px] h-[160px] rounded-full bg-muted animate-pulse" />
});

export default LazyColorWheel;
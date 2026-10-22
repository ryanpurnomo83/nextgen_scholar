import { useRef, useEffect } from 'preact/hooks'

// Kotak video 16:9. Video lokal dibisukan supaya suara sendiri tidak terdengar kembali (echo).
export default function VideoTile({ stream, muted = false, label, class: className = '' }) {
    const ref = useRef(null)

    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream ?? null
    }, [stream])

    return (
        <figure class={`relative aspect-video overflow-hidden rounded-lg bg-slate-900 shadow-lg ${className}`}>
            <video ref={ref} autoplay playsInline muted={muted} class="h-full w-full object-cover" />
            {!stream && (
                <div class="absolute inset-0 flex items-center justify-center text-sm text-slate-300">
                    Kamera mati
                </div>
            )}
            {label && (
                <figcaption class="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                    {label}
                </figcaption>
            )}
        </figure>
    )
}
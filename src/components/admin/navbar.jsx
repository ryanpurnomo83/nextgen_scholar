import { useState, useEffect, useRef } from 'preact/hooks'

const images = import.meta.glob('../../assets/*.{png,jpg,jpeg,svg,webp}', {
    eager: true,
    import: 'default',
})

// Widget Google Translate membuat elemen sendiri di dalam div ini, jadi class Tailwind
// tidak bisa dipasang langsung ke elemen tersebut. Solusinya: arbitrary variant
// [&_selector]:utilitas di wrapper. Tanda "!" dipakai karena CSS dan inline style
// dari Google punya prioritas tinggi. Setiap class ditulis utuh supaya terdeteksi Tailwind.
// Elemen di dalam kotak dipilih lewat nama tag (a, span, img), bukan class turunan Google,
// karena nama class turunannya bisa berubah.
const gtCompact = [
    // Wrapper bawaan Google
    '[&_.goog-te-gadget]:!m-0',
    '[&_.goog-te-gadget]:!font-sans',
    '[&_.goog-te-gadget]:!leading-none',

    // Kotak pilihan bahasa: pil kecil satu baris
    '[&_.goog-te-gadget-simple]:!inline-flex',
    '[&_.goog-te-gadget-simple]:!items-center',
    '[&_.goog-te-gadget-simple]:!whitespace-nowrap',
    '[&_.goog-te-gadget-simple]:!rounded-full',
    '[&_.goog-te-gadget-simple]:!border',
    '[&_.goog-te-gadget-simple]:!border-slate-200',
    '[&_.goog-te-gadget-simple]:!bg-white',
    '[&_.goog-te-gadget-simple]:!px-2.5',
    '[&_.goog-te-gadget-simple]:!py-1',
    '[&_.goog-te-gadget-simple]:!text-xs',
    '[&_.goog-te-gadget-simple:hover]:!border-slate-800',

    // Semua gambar kecil (logo Google, cleardot, dll.) disembunyikan
    '[&_.goog-te-gadget-simple_img]:!hidden',

    // Link "Select Language": teks dan panah dibuat satu baris
    '[&_.goog-te-gadget-simple_a]:!inline-flex',
    '[&_.goog-te-gadget-simple_a]:!items-center',
    '[&_.goog-te-gadget-simple_a]:!gap-1.5',
    '[&_.goog-te-gadget-simple_a]:!text-xs',
    '[&_.goog-te-gadget-simple_a]:!text-slate-700',
    '[&_.goog-te-gadget-simple_a]:!no-underline',

    // Semua span di dalamnya: hilangkan garis pemisah bawaan dan samakan warna/ukuran
    '[&_.goog-te-gadget-simple_span]:!inline',
    '[&_.goog-te-gadget-simple_span]:!border-0',
    '[&_.goog-te-gadget-simple_span]:!p-0',
    '[&_.goog-te-gadget-simple_span]:!text-xs',
    '[&_.goog-te-gadget-simple_span]:!text-slate-700',
].join(' ')

// Membuat (sekali saja) elemen penampung widget dan memuat script Google Translate.
// Elemen "host" disimpan di "stash" tersembunyi sampai dipasang ke Navbar.
function ensureTranslateHost() {
    let stash = document.getElementById('gt-stash')
    if (!stash) {
        stash = document.createElement('div')
        stash.id = 'gt-stash'
        stash.style.display = 'none'
        document.body.appendChild(stash)
    }

    let host = document.getElementById('google_translate_element')
    if (host) return { host, stash }

    host = document.createElement('div')
    host.id = 'google_translate_element'
    stash.appendChild(host)

    const initWidget = () => {
        new window.google.translate.TranslateElement(
            {
                pageLanguage: 'id',
                includedLanguages: 'en,id,zh-CN',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
            },
            'google_translate_element'
        )
    }

    if (window.google?.translate?.TranslateElement) {
        initWidget()
    } else {
        window.googleTranslateElementInit = initWidget
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script')
            script.id = 'google-translate-script'
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
            script.async = true
            document.body.appendChild(script)
        }
    }

    return { host, stash }
}

const links = [
    // { label: 'Tentang Kami', href: '/about' },
    // { label: 'Kelas', href: '/class' },
    // { label: 'Blog/Berita', href: '/news' },
    // { label: 'Partnership', href: '/partnership' },
    { id: 'translate' }, // diisi div translate di dalam render (lihat gtRef)
]

export default function Navbar() {
    const [menu, setMenu] = useState(false)
    const gtRef = useRef(null)

    // Setelah memilih bahasa, Google menyisipkan banner (iframe) di atas halaman dan
    // menggeser body ke bawah lewat inline style. Class Tailwind ini dipasang ke <body>
    // untuk menyembunyikan banner itu dan mengembalikan posisi body ke atas.
    useEffect(() => {
        const bodyClasses = [
            '!top-0',
            '[&>.VIpgJd-ZVi9od-ORHb-OEVmcd]:!hidden',
            '[&>.goog-te-banner-frame]:!hidden',
        ]
        document.body.classList.add(...bodyClasses)
        return () => document.body.classList.remove(...bodyClasses)
    }, [])

    // Widget Google Translate dibuat satu kali per muat halaman (lihat ensureTranslateHost),
    // lalu dipindahkan ke slot Navbar yang sedang tampil. Jadi saat pindah halaman,
    // widget tidak dibuat ulang, hanya dipindah ke Navbar yang baru.
    useEffect(() => {
        const slot = gtRef.current
        if (!slot) return

        const { host, stash } = ensureTranslateHost()
        slot.appendChild(host)

        return () => {
            // Selamatkan widget sebelum Navbar lama dilepas dari halaman
            if (host.parentNode === slot) stash.appendChild(host)
        }
    }, [])

    return (
        <nav class="sticky top-0 z-50 bg-white shadow">
            <div class="flex items-center gap-8 px-4 py-2">
                <a href="/admin/main">
                    <img
                        src={images['../../assets/nextgen_scholar_logo(2).png']}
                        class="h-20 w-auto"
                        alt="NextGen Scholar"
                    />
                </a>

                <ul class="hidden md:flex items-center gap-6">
                    {links.map((l) => (
                        <li key={l.href ?? l.id} class="flex items-center">
                            {l.href ? (
                                <a href={l.href} class="hover:text-blue-600">
                                    {l.label}
                                </a>
                            ) : (
                                <div ref={gtRef} class={gtCompact} />
                            )}
                        </li>
                    ))}
                </ul>

                <div ref={gtRef} class={`${gtCompact} ml-auto md:ml-0`} />
                <button
                    type="button"
                    class="ml-auto md:hidden rounded px-3 py-2 text-xl"
                    aria-label="Buka menu"
                    aria-expanded={menu}
                    onClick={() => setMenu(!menu)}
                >
                    ☰
                </button>
            </div>

            {menu && (
                <ul class="md:hidden px-4 pb-3 text-left">
                    {/* Item translate disaring supaya id google_translate_element tidak ganda */}
                    {links
                        .filter((l) => l.href)
                        .map((l) => (
                            <li key={l.href}>
                                <a href={l.href} class="block py-2" onClick={() => setMenu(false)}>
                                    {l.label}
                                </a>
                            </li>
                        ))}
                </ul>
            )}
        </nav>
    )
}
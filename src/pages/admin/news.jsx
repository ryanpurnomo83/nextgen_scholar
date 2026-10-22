import { useState, useMemo } from 'preact/hooks'
import '../../../src/app.css'
import Navbar from '../../components/admin/navbar.jsx'
import Sidebar from '../../components/admin/sidebar.jsx'
import Footer from '../../components/footer.jsx'

// Data contoh. Ganti dengan data dari API/fetch kalau sudah siap.
const DATA_BERITA = [
    {
        id: 1,
        judul: 'Pendaftaran beasiswa LPDP tahap 2 resmi dibuka',
        ringkasan: 'Pendaftar kini bisa mengunggah berkas melalui portal resmi. Simak jadwal seleksi administrasi dan syarat terbarunya.',
        kategori: 'Beasiswa',
        tanggal: '2026-10-10',
        penulis: 'Redaksi NextGen',
        warna: 'bg-slate-800',
    },
    {
        id: 2,
        judul: 'Tips menulis esai motivasi yang lolos seleksi',
        ringkasan: 'Tiga kesalahan umum yang sering membuat esai pelamar gugur di tahap awal, beserta cara memperbaikinya.',
        kategori: 'Tips',
        tanggal: '2026-10-08',
        penulis: 'Nadia Putri',
        warna: 'bg-teal-700',
    },
    {
        id: 3,
        judul: 'Kampus mitra buka jalur riset untuk mahasiswa tingkat akhir',
        ringkasan: 'Program magang riset enam bulan dengan pembimbing dosen dan akses laboratorium.',
        kategori: 'Kampus',
        tanggal: '2026-10-05',
        penulis: 'Redaksi NextGen',
        warna: 'bg-orange-800',
    },
    {
        id: 4,
        judul: 'Daftar lomba karya tulis ilmiah yang tutup akhir bulan',
        ringkasan: 'Lima lomba nasional dengan hadiah uang pembinaan dan sertifikat, lengkap dengan tenggat pengumpulan.',
        kategori: 'Lomba',
        tanggal: '2026-10-02',
        penulis: 'Raka Pratama',
        warna: 'bg-purple-800',
    },
    {
        id: 5,
        judul: 'Cara menyiapkan surat rekomendasi dari dosen',
        ringkasan: 'Kapan sebaiknya meminta, apa yang perlu disiapkan, dan contoh pesan singkat untuk dosen.',
        kategori: 'Tips',
        tanggal: '2026-09-28',
        penulis: 'Nadia Putri',
        warna: 'bg-teal-700',
    },
]

const KATEGORI = ['Semua', 'Beasiswa', 'Kampus', 'Lomba', 'Tips']

function formatTanggal(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

function Tag({ children }) {
    return (
        <span class="mb-2 inline-block rounded bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
            {children}
        </span>
    )
}

function Meta({ item }) {
    return (
        <p class="text-sm text-slate-500">
            {item.penulis}, {formatTanggal(item.tanggal)}
        </p>
    )
}

function KartuBerita({ item }) {
    return (
        <article>
            <div class={`mb-4 aspect-[16/10] rounded-xl ${item.warna}`} aria-hidden="true" />
            <Tag>{item.kategori}</Tag>
            <h3 class="mb-2 text-lg font-semibold leading-snug">
                <a
                    href={`/news/${item.id}`}
                    class="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                    {item.judul}
                </a>
            </h3>
            <p class="mb-3 text-[0.95rem] leading-relaxed text-slate-600">{item.ringkasan}</p>
            <Meta item={item} />
        </article>
    )
}

export default function News() {
    const [news] = useState(DATA_BERITA)
    const [kategori, setKategori] = useState('Semua')
    const [cari, setCari] = useState('')

    const hasil = useMemo(() => {
        const q = cari.trim().toLowerCase()
        return news.filter((n) => {
            const cocokKategori = kategori === 'Semua' || n.kategori === kategori
            const cocokCari =
                !q || n.judul.toLowerCase().includes(q) || n.ringkasan.toLowerCase().includes(q)
            return cocokKategori && cocokCari
        })
    }, [news, kategori, cari])

    const [utama, ...lainnya] = hasil

    return (
        <>
            <Navbar />

            <main class="mx-auto max-w-6xl px-5 pb-16 pt-10 text-slate-800">
                <header>
                    <h1 class="mb-2 text-4xl font-bold leading-tight md:text-5xl">Berita</h1>
                    <p class="max-w-prose leading-relaxed text-slate-600">
                        Kabar terbaru seputar beasiswa, kampus, dan lomba untuk pelajar dan mahasiswa.
                    </p>
                </header>

                <section
                    class="my-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-slate-200 pb-5"
                    aria-label="Filter berita"
                >
                    <div class="flex flex-wrap gap-2" role="group" aria-label="Kategori">
                        {KATEGORI.map((k) => (
                            <button
                                type="button"
                                key={k}
                                aria-pressed={k === kategori}
                                onClick={() => setKategori(k)}
                                class={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                                    k === kategori
                                        ? 'border-slate-800 bg-slate-800 text-white'
                                        : 'border-slate-200 bg-white hover:border-slate-800'
                                }`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>

                    <input
                        type="search"
                        placeholder="Cari berita"
                        aria-label="Cari berita"
                        value={cari}
                        onInput={(e) => setCari(e.currentTarget.value)}
                        class="w-full max-w-xs rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                    />
                </section>

                {hasil.length === 0 ? (
                    <div class="px-4 py-12 text-center text-slate-500">
                        <p class="mb-4">Tidak ada berita yang cocok dengan pencarianmu.</p>
                        <button
                            type="button"
                            onClick={() => {
                                setKategori('Semua')
                                setCari('')
                            }}
                            class="cursor-pointer rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-800 hover:border-slate-800"
                        >
                            Reset filter
                        </button>
                    </div>
                ) : (
                    <>
                        <article class="mb-12 grid items-center gap-4 md:grid-cols-[1.2fr_1fr] md:gap-8">
                            <div class={`aspect-[16/10] rounded-xl ${utama.warna}`} aria-hidden="true" />
                            <div>
                                <Tag>{utama.kategori}</Tag>
                                <h2 class="mb-3 text-2xl font-bold leading-tight md:text-3xl">
                                    <a
                                        href={`/news/${utama.id}`}
                                        class="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                                    >
                                        {utama.judul}
                                    </a>
                                </h2>
                                <p class="mb-4 leading-relaxed text-slate-600">{utama.ringkasan}</p>
                                <Meta item={utama} />
                            </div>
                        </article>

                        {lainnya.length > 0 && (
                            <div class="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                                {lainnya.map((item) => (
                                    <KartuBerita key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </>
    )
}
import { useState, useRef, useEffect, useMemo } from 'preact/hooks'
import Navbar from '../../components/admin/navbar'
import Footer from '../../components/footer'
import Sidebar from '../../components/admin/sidebar'
// import VideoTile from '../../components/videoTile.jsx'

const DATA_KELAS = [
    {
        id: 1,
        judul: 'Strategi Lolos Seleksi Beasiswa LPDP',
        deskripsi: 'Memahami tahapan seleksi, menyusun berkas, dan latihan wawancara bersama alumni penerima beasiswa.',
        kategori: 'Beasiswa',
        level: 'Pemula',
        mentor: 'Dimas Aryanto',
        jadwal: 'Sabtu, 18 Okt 2026, 09.00 WIB',
        durasi: '4 pertemuan',
        kuota: 30,
        terisi: 24,
        harga: 0,
        warna: 'bg-slate-800',
    },
    {
        id: 2,
        judul: 'Menulis Esai Motivasi yang Meyakinkan',
        deskripsi: 'Dari menemukan cerita pribadi sampai menyunting draf akhir, dengan umpan balik langsung untuk setiap peserta.',
        kategori: 'Penulisan',
        level: 'Menengah',
        mentor: 'Nadia Putri',
        jadwal: 'Selasa, 21 Okt 2026, 19.30 WIB',
        durasi: '3 pertemuan',
        kuota: 20,
        terisi: 20,
        harga: 150000,
        warna: 'bg-teal-700',
    },
    {
        id: 3,
        judul: 'Persiapan IELTS: Writing dan Speaking',
        deskripsi: 'Latihan terstruktur dengan contoh jawaban band 7 dan simulasi tes setiap akhir pekan.',
        kategori: 'Bahasa Inggris',
        level: 'Menengah',
        mentor: 'Rina Kusuma',
        jadwal: 'Kamis, 23 Okt 2026, 19.00 WIB',
        durasi: '8 pertemuan',
        kuota: 25,
        terisi: 11,
        harga: 350000,
        warna: 'bg-orange-800',
    },
    {
        id: 4,
        judul: 'Dasar Metodologi Penelitian untuk Pemula',
        deskripsi: 'Merumuskan pertanyaan penelitian, memilih metode, dan menyusun proposal singkat.',
        kategori: 'Riset',
        level: 'Pemula',
        mentor: 'Dr. Raka Pratama',
        jadwal: 'Minggu, 26 Okt 2026, 10.00 WIB',
        durasi: '5 pertemuan',
        kuota: 40,
        terisi: 17,
        harga: 0,
        warna: 'bg-purple-800',
    },
    {
        id: 5,
        judul: 'Menyusun Proposal Riset untuk Beasiswa Luar Negeri',
        deskripsi: 'Menyusun rencana studi dan proposal riset yang sesuai dengan kriteria universitas tujuan.',
        kategori: 'Riset',
        level: 'Lanjutan',
        mentor: 'Dr. Raka Pratama',
        jadwal: 'Sabtu, 1 Nov 2026, 13.00 WIB',
        durasi: '6 pertemuan',
        kuota: 15,
        terisi: 12,
        harga: 400000,
        warna: 'bg-purple-800',
    },
]

const KATEGORI = ['Semua', 'Beasiswa', 'Penulisan', 'Bahasa Inggris', 'Riset']
const LEVEL = ['Semua level', 'Pemula', 'Menengah', 'Lanjutan']

function formatHarga(harga) {
    if (harga === 0) return 'Gratis'
    return 'Rp' + harga.toLocaleString('id-ID')
}

function KartuKelas({ item, terdaftar, onDaftar }) {
    const terisi = item.terisi + (terdaftar ? 1 : 0)
    const sisa = item.kuota - terisi
    const penuh = sisa <= 0
    const persen = Math.min(100, Math.round((terisi / item.kuota) * 100))

    return (
        <article class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div class={`flex h-28 items-end p-4 ${item.warna}`}>
                <span class="rounded bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                    {item.kategori}
                </span>
            </div>

            <div class="flex flex-1 flex-col p-5">
                <h3 class="mb-1 text-lg font-semibold leading-snug">{item.judul}</h3>
                <p class="mb-3 text-sm text-slate-500">
                    Mentor: {item.mentor}, level {item.level.toLowerCase()}
                </p>
                <p class="mb-4 text-[0.95rem] leading-relaxed text-slate-600">{item.deskripsi}</p>

                <dl class="mb-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt class="text-slate-500">Jadwal</dt>
                    <dd>{item.jadwal}</dd>
                    <dt class="text-slate-500">Durasi</dt>
                    <dd>{item.durasi}</dd>
                </dl>

                <div class="mt-auto">
                    <div class="mb-1 flex justify-between text-sm">
                        <span class="text-slate-500">{penuh ? 'Kelas penuh' : `Sisa ${sisa} kursi`}</span>
                        <span class="text-slate-500">
                            {terisi}/{item.kuota}
                        </span>
                    </div>
                    <div
                        class="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-valuenow={persen}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label="Kuota terisi"
                    >
                        <div
                            class={`h-full rounded-full ${penuh ? 'bg-slate-400' : 'bg-amber-600'}`}
                            style={{ width: `${persen}%` }}
                        />
                    </div>

                    <div class="flex items-center justify-between gap-3">
                        <span class="text-lg font-bold">{formatHarga(item.harga)}</span>
                        <button
                            type="button"
                            disabled={penuh && !terdaftar}
                            onClick={() => onDaftar(item.id)}
                            class={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${
                                terdaftar
                                    ? 'border border-slate-800 bg-white text-slate-800 hover:bg-slate-50'
                                    : 'bg-slate-800 text-white hover:bg-slate-700'
                            }`}
                        >
                            {terdaftar ? 'Batalkan pendaftaran' : penuh ? 'Kelas penuh' : 'Daftar kelas'}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default function AdminClass() {
    const [kelas] = useState(DATA_KELAS)
    const [kategori, setKategori] = useState('Semua')
    const [level, setLevel] = useState('Semua level')
    const [cari, setCari] = useState('')
    const [terdaftar, setTerdaftar] = useState([])

    const hasil = useMemo(() => {
        const q = cari.trim().toLowerCase()
        return kelas.filter((k) => {
            const cocokKategori = kategori === 'Semua' || k.kategori === kategori
            const cocokLevel = level === 'Semua level' || k.level === level
            const cocokCari =
                !q || k.judul.toLowerCase().includes(q) || k.mentor.toLowerCase().includes(q)
            return cocokKategori && cocokLevel && cocokCari
        })
    }, [kelas, kategori, level, cari])

    function toggleDaftar(id) {
        setTerdaftar((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    }

    function resetFilter() {
        setKategori('Semua')
        setLevel('Semua level')
        setCari('')
    }

    return (
            <div class="flex min-h-screen flex-col">
                        <Navbar />
                            <div class="flex flex-1">
                                <Sidebar />
                                <main class="mx-auto max-w-6xl px-5 pb-16 pt-10 text-slate-800">
                                    <header>
                                        <h1 class="mb-2 text-4xl font-bold leading-tight md:text-5xl">Kelas</h1>
                                        <p class="max-w-prose leading-relaxed text-slate-600">
                                            Belajar bersama mentor untuk menyiapkan beasiswa, esai, bahasa, dan riset.
                                        </p>
                                    </header>

                                    <section
                                        class="my-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-slate-200 pb-5"
                                        aria-label="Filter kelas"
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

                                        <div class="flex w-full flex-wrap gap-3 md:w-auto">
                                            <select
                                                aria-label="Level kelas"
                                                value={level}
                                                onChange={(e) => setLevel(e.currentTarget.value)}
                                                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                                            >
                                                {LEVEL.map((l) => (
                                                    <option key={l} value={l}>
                                                        {l}
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="search"
                                                placeholder="Cari kelas atau mentor"
                                                aria-label="Cari kelas atau mentor"
                                                value={cari}
                                                onInput={(e) => setCari(e.currentTarget.value)}
                                                class="min-w-0 flex-1 rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 md:w-64 md:flex-none"
                                            />
                                        </div>
                                    </section>

                                    {terdaftar.length > 0 && (
                                        <p class="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
                                            Kamu terdaftar di {terdaftar.length} kelas.
                                        </p>
                                    )}

                                    {hasil.length === 0 ? (
                                        <div class="px-4 py-12 text-center text-slate-500">
                                            <p class="mb-4">Tidak ada kelas yang cocok dengan filtermu.</p>
                                            <button
                                                type="button"
                                                onClick={resetFilter}
                                                class="cursor-pointer rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-800 hover:border-slate-800"
                                            >
                                                Reset filter
                                            </button>
                                        </div>
                                    ) : (
                                        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {hasil.map((item) => (
                                                <KartuKelas
                                                    key={item.id}
                                                    item={item}
                                                    terdaftar={terdaftar.includes(item.id)}
                                                    onDaftar={toggleDaftar}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </main>
                            </div>
            <Footer />
        </div>
    )
}
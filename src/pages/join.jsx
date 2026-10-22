import { useState, useRef, useEffect } from 'preact/hooks'
import Navbar from '../components/navbar.jsx'
import Footer from '../components/footer.jsx'
import VideoTile from '../components/videoTile.jsx'
import {
    RTC_CONFIG,
    SIGNALING_URL,
    applySignal,
    wsSend,
    mediaErrorMessage,
    serverErrorMessage,
} from '../lib/rtc.js'

export default function Join() {
    const wsRef = useRef(null)
    const pcRef = useRef(null)
    const localRef = useRef(null)

    const [name, setName] = useState('')
    const [room, setRoom] = useState(() => (new URLSearchParams(location.search).get('room') ?? '').toUpperCase())
    const [useMedia, setUseMedia] = useState(true)
    const [status, setStatus] = useState('idle') // idle | connecting | waiting | live | ended
    const [error, setError] = useState('')
    const [local, setLocal] = useState(null)
    const [remote, setRemote] = useState(null)

    const cleanup = () => {
        const ws = wsRef.current
        if (ws) {
            ws.onclose = null
            ws.onerror = null
            ws.close()
            wsRef.current = null
        }
        pcRef.current?.close()
        pcRef.current = null
        localRef.current?.getTracks().forEach((track) => track.stop())
        localRef.current = null
        setLocal(null)
        setRemote(null)
    }

    const leave = (next = 'idle') => {
        cleanup()
        setStatus(next)
    }

    useEffect(() => () => cleanup(), [])

    const createPc = (ws) => {
        const pc = new RTCPeerConnection(RTC_CONFIG)
        const stream = new MediaStream()
        pcRef.current = pc

        pc.onicecandidate = (e) => {
            if (e.candidate) wsSend(ws, { type: 'signal', data: { candidate: e.candidate } })
        }
        pc.ontrack = (e) => {
            stream.addTrack(e.track)
            setRemote(stream)
        }
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') setStatus('live')
            if (pc.connectionState === 'failed') {
                setError('Koneksi video gagal. Coba bergabung lagi.')
                leave()
            }
        }
        return pc
    }

    const handleMessage = async (ws, msg) => {
        switch (msg.type) {
            case 'joined':
                setStatus('waiting')
                break
            case 'signal': {
                const pc = pcRef.current ?? createPc(ws)
                if (msg.data.sdp?.type === 'offer') {
                    await applySignal(pc, msg.data)
                    // Kirim kamera dan mikrofon murid (kalau dinyalakan) lewat jalur yang ditawarkan guru
                    localRef.current?.getTracks().forEach((track) => pc.addTrack(track, localRef.current))
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    wsSend(ws, { type: 'signal', data: { sdp: pc.localDescription } })
                } else {
                    await applySignal(pc, msg.data)
                }
                break
            }
            case 'room-closed':
                leave('ended')
                break
            case 'error':
                setError(serverErrorMessage(msg.code))
                leave()
                break
        }
    }

    const join = async () => {
        setError('')
        if (!name.trim() || !room.trim()) {
            setError('Isi nama dan kode kelas dulu.')
            return
        }

        let stream = null
        if (useMedia) {
            if (!navigator.mediaDevices?.getUserMedia) {
                setError('Browser ini tidak mendukung kamera, atau halaman tidak memakai HTTPS.')
                return
            }
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            } catch (err) {
                setError(mediaErrorMessage(err) + ' Kamu masih bisa bergabung tanpa kamera.')
                return
            }
        }
        localRef.current = stream
        setLocal(stream)
        setStatus('connecting')

        const ws = new WebSocket(SIGNALING_URL)
        wsRef.current = ws
        ws.onopen = () => wsSend(ws, { type: 'join', room: room.trim().toUpperCase(), name: name.trim() })
        ws.onmessage = (e) => handleMessage(ws, JSON.parse(e.data))
        ws.onerror = () => {
            setError('Tidak bisa terhubung ke server kelas.')
            leave()
        }
        ws.onclose = () => {
            setError('Koneksi ke server kelas terputus.')
            leave()
        }
    }

    const inRoom = status === 'connecting' || status === 'waiting' || status === 'live'

    return (
        <>
            <Navbar />
            <main class="mx-auto max-w-4xl px-4 py-8">
                <h1 class="mb-6">Kelas Online</h1>

                {error && (
                    <p class="mb-4 text-red-600" role="alert">
                        {error}
                    </p>
                )}

                {status === 'ended' && (
                    <div class="mb-4">
                        <p class="mb-3">Kelas telah berakhir. Terima kasih sudah bergabung.</p>
                        <button
                            type="button"
                            onClick={() => setStatus('idle')}
                            class="rounded-3xl bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                        >
                            Kembali
                        </button>
                    </div>
                )}

                {status === 'idle' && (
                    <div class="max-w-sm space-y-4">
                        <input
                            type="text"
                            placeholder="Nama kamu"
                            aria-label="Nama"
                            maxLength={30}
                            value={name}
                            onInput={(e) => setName(e.currentTarget.value)}
                            class="w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                        <input
                            type="text"
                            placeholder="Kode kelas"
                            aria-label="Kode kelas"
                            maxLength={6}
                            value={room}
                            onInput={(e) => setRoom(e.currentTarget.value.toUpperCase())}
                            class="w-full rounded-lg border border-slate-300 px-3 py-2 tracking-widest"
                        />
                        <label class="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={useMedia}
                                onChange={(e) => setUseMedia(e.currentTarget.checked)}
                            />
                            Nyalakan kamera dan mikrofon saya
                        </label>
                        <button
                            type="button"
                            onClick={join}
                            class="w-full cursor-pointer rounded-3xl bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                        >
                            Gabung kelas
                        </button>
                    </div>
                )}

                {inRoom && (
                    <>
                        <p class="mb-3 text-sm text-slate-600">
                            {status === 'live' ? `Terhubung ke kelas ${room}` : 'Menghubungkan ke guru...'}
                        </p>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <VideoTile stream={remote} label="Guru" class="sm:col-span-2" />
                            {local && <VideoTile stream={local} muted label={`Kamu (${name})`} />}
                        </div>
                        <button
                            type="button"
                            onClick={() => leave()}
                            class="mt-4 cursor-pointer rounded-3xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-800"
                        >
                            Keluar
                        </button>
                    </>
                )}
            </main>
            <Footer />
        </>
    )
}
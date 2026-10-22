import { useState, useRef, useEffect } from 'preact/hooks'
import Navbar from '../../../components/admin/navbar.jsx'
import Footer from '../../../components/footer.jsx'
import Sidebar from '../../../components/admin/sidebar'
import VideoTile from '../../../components/videoTile.jsx'
import {
    RTC_CONFIG,
    SIGNALING_URL,
    MAX_STUDENTS,
    applySignal,
    wsSend,
    mediaErrorMessage,
    serverErrorMessage,
} from '../../../lib/rtc.js'

export default function AdminClassDetail() {
    const wsRef = useRef(null)
    const localRef = useRef(null)
    const peersRef = useRef(new Map()) // id murid -> { pc, stream }

    const [token, setToken] = useState('')
    const [room, setRoom] = useState('')
    const [starting, setStarting] = useState(false)
    const [local, setLocal] = useState(null)
    const [students, setStudents] = useState([]) // { id, name, stream, state }
    const [micOn, setMicOn] = useState(true)
    const [camOn, setCamOn] = useState(true)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const closePeer = (id) => {
        const peer = peersRef.current.get(id)
        if (peer) {
            peer.pc.close()
            peersRef.current.delete(id)
        }
        setStudents((prev) => prev.filter((s) => s.id !== id))
    }

    const stopClass = () => {
        const ws = wsRef.current
        if (ws) {
            ws.onclose = null
            ws.onerror = null
            ws.close()
            wsRef.current = null
        }
        peersRef.current.forEach((peer) => peer.pc.close())
        peersRef.current.clear()
        localRef.current?.getTracks().forEach((track) => track.stop())
        localRef.current = null
        setLocal(null)
        setStudents([])
        setRoom('')
        setStarting(false)
        setMicOn(true)
        setCamOn(true)
    }

    // Matikan kamera dan tutup kelas saat meninggalkan halaman
    useEffect(() => () => stopClass(), [])

    // Murid baru masuk: buat koneksi khusus untuk murid itu, lalu kirim offer
    const addStudent = async (id, name) => {
        const pc = new RTCPeerConnection(RTC_CONFIG)
        const peer = { pc, stream: null }
        peersRef.current.set(id, peer)
        setStudents((prev) => [...prev, { id, name, stream: null, state: 'connecting' }])

        // Kirim kamera dan mikrofon guru. addTrack membuat jalur dua arah, jadi
        // kamera dan mikrofon murid (kalau dinyalakan) juga bisa diterima.
        localRef.current.getTracks().forEach((track) => pc.addTrack(track, localRef.current))

        pc.onicecandidate = (e) => {
            if (e.candidate) wsSend(wsRef.current, { type: 'signal', to: id, data: { candidate: e.candidate } })
        }
        pc.ontrack = (e) => {
            if (!peer.stream) {
                peer.stream = new MediaStream()
                setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, stream: peer.stream } : s)))
            }
            peer.stream.addTrack(e.track)
        }
        pc.onconnectionstatechange = () => {
            setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, state: pc.connectionState } : s)))
        }

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        wsSend(wsRef.current, { type: 'signal', to: id, data: { sdp: pc.localDescription } })
    }

    const handleMessage = async (msg) => {
        switch (msg.type) {
            case 'created':
                setRoom(msg.room)
                setStarting(false)
                break
            case 'peer-joined':
                await addStudent(msg.id, msg.name)
                break
            case 'signal': {
                const peer = peersRef.current.get(msg.from)
                if (peer) await applySignal(peer.pc, msg.data)
                break
            }
            case 'peer-left':
                closePeer(msg.id)
                break
            case 'error':
                setError(serverErrorMessage(msg.code))
                stopClass()
                break
        }
    }

    const startClass = async () => {
        setError('')
        if (!token.trim()) {
            setError('Isi kunci admin dulu.')
            return
        }
        // getUserMedia hanya tersedia di HTTPS atau localhost
        if (!navigator.mediaDevices?.getUserMedia) {
            setError('Browser ini tidak mendukung kamera, atau halaman tidak memakai HTTPS.')
            return
        }

        setStarting(true)
        let stream
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true,
            })
        } catch (err) {
            setError(mediaErrorMessage(err))
            setStarting(false)
            return
        }
        localRef.current = stream
        setLocal(stream)

        const ws = new WebSocket(SIGNALING_URL)
        wsRef.current = ws
        ws.onopen = () => wsSend(ws, { type: 'create', token: token.trim() })
        ws.onmessage = (e) => handleMessage(JSON.parse(e.data))
        ws.onerror = () => {
            setError('Tidak bisa terhubung ke server kelas.')
            stopClass()
        }
        ws.onclose = () => {
            stopClass()
            setError('Koneksi ke server kelas terputus.')
        }
    }

    const toggleMic = () => {
        const next = !micOn
        localRef.current?.getAudioTracks().forEach((track) => (track.enabled = next))
        setMicOn(next)
    }

    const toggleCam = () => {
        const next = !camOn
        localRef.current?.getVideoTracks().forEach((track) => (track.enabled = next))
        setCamOn(next)
    }

    const joinLink = room ? `${location.origin}/join?room=${room}` : ''

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(joinLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            setError('Gagal menyalin tautan.')
        }
    }

    const btn = 'font-bold py-2 px-4 rounded-3xl cursor-pointer text-white'

    return (
        <div class="flex min-h-screen flex-col">
            <Navbar />
                <div class="flex flex-1">
                    <Sidebar />
                    <main class="mx-auto max-w-5xl px-4 py-8">
                
                        <h1>Class</h1>

                        {!room ? (
                            <div class="mb-6 flex flex-wrap items-center gap-3">
                                <input
                                    type="password"
                                    placeholder="Kunci admin"
                                    aria-label="Kunci admin"
                                    value={token}
                                    onInput={(e) => setToken(e.currentTarget.value)}
                                    class="rounded-lg border border-slate-300 px-3 py-2"
                                />
                                <button
                                    type="button"
                                    disabled={starting}
                                    onClick={startClass}
                                    class={`${btn} bg-blue-500 hover:bg-blue-700 disabled:opacity-60`}
                                >
                                    {starting ? 'Memulai...' : 'Online Learning'}
                                </button>
                            </div>
                        ) : (
                            <div class="mb-6 space-y-3">
                                <p>
                                    Kode kelas: <strong class="text-2xl tracking-widest">{room}</strong>
                                </p>
                                <div class="flex flex-wrap items-center gap-2">
                                    <input
                                        readOnly
                                        value={joinLink}
                                        aria-label="Tautan untuk murid"
                                        class="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    />
                                    <button type="button" onClick={copyLink} class={`${btn} bg-slate-700 hover:bg-slate-900`}>
                                        {copied ? 'Tersalin' : 'Salin tautan'}
                                    </button>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <button type="button" onClick={toggleMic} class={`${btn} bg-slate-600 hover:bg-slate-800`}>
                                        {micOn ? 'Matikan mikrofon' : 'Nyalakan mikrofon'}
                                    </button>
                                    <button type="button" onClick={toggleCam} class={`${btn} bg-slate-600 hover:bg-slate-800`}>
                                        {camOn ? 'Matikan kamera' : 'Nyalakan kamera'}
                                    </button>
                                    <button type="button" onClick={stopClass} class={`${btn} bg-red-600 hover:bg-red-800`}>
                                        Akhiri kelas
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p class="mb-4 text-red-600" role="alert">
                                {error}
                            </p>
                        )}

                        {local && (
                            <>
                                <div class="grid gap-4 sm:grid-cols-2">
                                    <VideoTile stream={local} muted label="Kamu (guru)" />
                                    {students.map((s) => (
                                        <VideoTile
                                            key={s.id}
                                            stream={s.stream}
                                            label={s.state === 'connected' ? s.name : `${s.name} (menghubungkan...)`}
                                        />
                                    ))}
                                </div>
                                <p class="mt-3 text-sm text-slate-600">
                                    Murid: {students.length}/{MAX_STUDENTS}
                                </p>
                            </>
                        )}
                        <br />
                    </main> 
                </div>
            <Footer />
        </div>
    )
}
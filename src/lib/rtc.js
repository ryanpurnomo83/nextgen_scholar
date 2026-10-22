// Konfigurasi dan helper WebRTC yang dipakai halaman admin dan halaman murid.

export const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'ws://localhost:8080'
export const MAX_STUDENTS = 3

// STUN gratis cukup untuk sebagian besar jaringan rumahan. Untuk jaringan yang ketat
// (kantor, sebagian seluler) kamu perlu server TURN, isi lewat variabel .env berikut.
const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]
if (import.meta.env.VITE_TURN_URL) {
    iceServers.push({
        urls: import.meta.env.VITE_TURN_URL,
        username: import.meta.env.VITE_TURN_USER,
        credential: import.meta.env.VITE_TURN_PASS,
    })
}
export const RTC_CONFIG = { iceServers }

export function wsSend(ws, obj) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj))
}

// ICE candidate bisa tiba sebelum remote description terpasang. Simpan dulu, lalu pasang belakangan.
const pendingCandidates = new WeakMap()

export async function applySignal(pc, data) {
    if (data.sdp) {
        await pc.setRemoteDescription(data.sdp)
        const queue = pendingCandidates.get(pc) ?? []
        pendingCandidates.delete(pc)
        for (const candidate of queue) await pc.addIceCandidate(candidate)
    } else if (data.candidate) {
        if (pc.remoteDescription) {
            await pc.addIceCandidate(data.candidate)
        } else {
            const queue = pendingCandidates.get(pc) ?? []
            queue.push(data.candidate)
            pendingCandidates.set(pc, queue)
        }
    }
}

export function mediaErrorMessage(err) {
    if (err.name === 'NotAllowedError') return 'Izin kamera atau mikrofon ditolak.'
    if (err.name === 'NotFoundError') return 'Kamera atau mikrofon tidak ditemukan.'
    return 'Tidak bisa mengakses kamera: ' + err.message
}

export function serverErrorMessage(code) {
    switch (code) {
        case 'unauthorized':
            return 'Kunci admin salah.'
        case 'no-room':
            return 'Kode kelas tidak ditemukan, atau kelas belum dimulai.'
        case 'full':
            return `Kelas sudah penuh (maksimal ${MAX_STUDENTS} murid).`
        default:
            return 'Terjadi kesalahan pada server kelas.'
    }
}
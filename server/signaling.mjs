// Server signaling WebRTC untuk kelas online: 1 guru (admin) + maksimal 3 murid.
// Server ini hanya menukar data koneksi (offer/answer/ICE). Video dan suara
// TIDAK lewat server ini, tetapi langsung antar browser (atau lewat TURN).
//
// Jalankan:  npm i ws   lalu   ADMIN_TOKEN=rahasia-anda node server/signaling.mjs

import { WebSocketServer, WebSocket } from 'ws'
import { randomInt, randomUUID, timingSafeEqual } from 'node:crypto'

const PORT = Number(process.env.PORT) || 8080
const ADMIN_TOKEN = process.env.ADMIN_TOKEN
// Daftar origin yang boleh terhubung, dipisah koma. Kosong = semua boleh (hanya untuk development).
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
const MAX_STUDENTS = 3
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // tanpa karakter yang mirip (0/O, 1/I)

if (!ADMIN_TOKEN) {
    console.error('ADMIN_TOKEN belum diisi. Contoh: ADMIN_TOKEN=rahasia node server/signaling.mjs')
    process.exit(1)
}

// kode kelas -> { admin: ws, students: Map(id -> ws) }
const rooms = new Map()
const wss = new WebSocketServer({ port: PORT, maxPayload: 64 * 1024 })

function send(ws, obj) {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj))
}

function sameSecret(a, b) {
    const x = Buffer.from(String(a))
    const y = Buffer.from(String(b))
    return x.length === y.length && timingSafeEqual(x, y)
}

function newCode() {
    let code
    do {
        code = Array.from({ length: 6 }, () => CODE_CHARS[randomInt(CODE_CHARS.length)]).join('')
    } while (rooms.has(code))
    return code
}

function leave(ws) {
    const room = rooms.get(ws.room)
    if (!room) return

    if (ws.role === 'admin') {
        for (const student of room.students.values()) {
            send(student, { type: 'room-closed' })
            student.close()
        }
        rooms.delete(ws.room)
    } else if (ws.role === 'student') {
        room.students.delete(ws.id)
        send(room.admin, { type: 'peer-left', id: ws.id })
    }
}



wss.on('connection', (ws, req) => {
    if (ALLOWED_ORIGINS.length && !ALLOWED_ORIGINS.includes(req.headers.origin)) {
        ws.close(1008, 'origin tidak diizinkan')
        return
    }

    ws.isAlive = true
    ws.role = null
    ws.room = null
    ws.id = null
    ws.on('pong', () => (ws.isAlive = true))

    ws.on('message', (raw) => {
        let msg
        try {
            msg = JSON.parse(raw)
        } catch {
            return
        }
        if (!msg || typeof msg !== 'object') return

        switch (msg.type) {
            case 'create': {
                if (ws.role) return
                if (!sameSecret(msg.token ?? '', ADMIN_TOKEN)) {
                    send(ws, { type: 'error', code: 'unauthorized' })
                    return
                }
                const code = newCode()
                rooms.set(code, { admin: ws, students: new Map() })
                ws.role = 'admin'
                ws.room = code
                send(ws, { type: 'created', room: code, max: MAX_STUDENTS })
                break
            }

            case 'join': {
                if (ws.role) return
                const room = rooms.get(String(msg.room ?? '').toUpperCase())
                if (!room) {
                    send(ws, { type: 'error', code: 'no-room' })
                    return
                }
                if (room.students.size >= MAX_STUDENTS) {
                    send(ws, { type: 'error', code: 'full' })
                    return
                }
                const name = String(msg.name ?? '').trim().slice(0, 30) || 'Murid'
                ws.role = 'student'
                ws.room = String(msg.room).toUpperCase()
                ws.id = randomUUID().slice(0, 8)
                room.students.set(ws.id, ws)
                send(ws, { type: 'joined', id: ws.id })
                send(room.admin, { type: 'peer-joined', id: ws.id, name })
                break
            }

            case 'signal': {
                const room = rooms.get(ws.room)
                if (!room || !msg.data || typeof msg.data !== 'object') return
                if (ws.role === 'admin') {
                    send(room.students.get(msg.to), { type: 'signal', data: msg.data })
                } else if (ws.role === 'student') {
                    send(room.admin, { type: 'signal', from: ws.id, data: msg.data })
                }
                break
            }
        }
    })

    ws.on('close', () => leave(ws))
})

// Buang koneksi yang sudah mati
const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
        if (!ws.isAlive) {
            ws.terminate()
            continue
        }
        ws.isAlive = false
        ws.ping()
    }
}, 30000)
wss.on('close', () => clearInterval(heartbeat))

console.log(`Server signaling berjalan di ws://localhost:${PORT} (maks ${MAX_STUDENTS} murid per kelas)`)
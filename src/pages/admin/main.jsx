import { useState, useRef, useEffect } from 'preact/hooks'
import Navbar from '../../components/admin/navbar'
import Footer from '../../components/footer'
import Sidebar from '../../components/admin/sidebar'
import VideoTile from '../../components/videoTile.jsx'
import {
    RTC_CONFIG,
    SIGNALING_URL,
    MAX_STUDENTS,
    applySignal,
    wsSend,
    mediaErrorMessage,
    serverErrorMessage,
} from '../../lib/rtc.js'

export default function AdminMain() {
    return (
        <div class="flex min-h-screen flex-col">
            <Navbar />
                <div class="flex flex-1">
                    <Sidebar />
                    <main class="mx-auto max-w-5xl px-4 py-8">                
                        <h1>Dashboard</h1>

                    </main> 
                </div>
            <Footer />
        </div>
    )
}
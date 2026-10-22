import { useState } from 'preact/hooks'
import preactLogo from '../assets/preact.svg'
import viteLogo from '../assets/vite.svg'
import '../../src/app.css'
import Navbar from '../components/navbar.jsx'
import Footer from '../components/footer.jsx'

const images = import.meta.glob('../assets/*.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  import: 'default',
})

export default function Main(){
    const [count, setCount] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState('Sains');
    const programs = ['Sains', 'Matematika', 'Inggris', 'Mandarin']

    const handleClick = () => {
      setAnimate(false);
      requestAnimationFrame(() => {
        setAnimate(true);
      })
    }

    return(
      <>
      <Navbar />
      <main id="center" class="math-grid-bg justify-start">

        <section>
          <div class="hero !w-full !h-auto flex justify-center">
            <img onClick={handleClick} onAnimationEnd={() => setAnimate(false)} src={images['../assets/nextgen_scholar_logo.png']} class={`w-3/4 sm:w-3/5 md:w-1/2 max-w-md h-auto cursor-pointer md:-my-12 ${animate ? 'animate-zoom-shake' : ''}`} style="width: 100%;" alt="" />
          </div>
          <div class="text-center">
            <h1 class="!mt-0">Bimbingan Belajar Yang Tepat Untuk Kamu</h1>
          </div>
        </section>

        {/* Mobile: carousel geser (scroll-snap). Layar sm ke atas: baris biasa di tengah */}
        <section>
          <div class="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center sm:overflow-visible">
            <div class="bg-gray-200 rounded-lg shadow-md p-4 shrink-0 snap-start w-[100%] aspect-[3/4] sm:w-32 lg:w-[260px] h-22"></div>
            <div class="bg-gray-200 rounded-lg shadow-md p-4 shrink-0 snap-start w-[100%] aspect-[3/4] sm:w-32 lg:w-[260px] h-22"></div>
            <div class="bg-gray-200 rounded-lg shadow-md p-4 shrink-0 snap-start w-[100%] aspect-[3/4] sm:w-32 lg:w-[260px] h-22"></div>
          </div>
        </section>

        <section class="mt-15">
          <div class="text-center">
            <h2 class="!mt-0">Program Belajar Tersedia Offline dan Online</h2>
          </div>
          <div class="flex flex-wrap justify-center gap-3 sm:gap-8 mt-8 px-4">
            {programs.map((item) => (
              <div
                key={item}
                onClick={() => setSelectedProgram(item)}
                class={`px-5 py-2 rounded-full cursor-pointer transition duration-200 active:scale-95 ${
                  selectedProgram === item
                    ? 'bg-[#2D6CDE] text-white'
                    : 'hover:bg-[#46C2DA] hover:text-[#F3F16A]'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
          {/* Mobile: tiga kotak 1:1 sejajar. Layar sm ke atas: kembali ke ukuran semula */}
          <div class="flex justify-center gap-4 mt-8 px-4">
            <div class="bg-gray-200 rounded-lg shadow-md p-4 flex-1 aspect-square sm:flex-none sm:aspect-auto sm:w-64 sm:h-30">SD</div>
            <div class="bg-gray-200 rounded-lg shadow-md p-4 flex-1 aspect-square sm:flex-none sm:aspect-auto sm:w-64 sm:h-30">SMP</div>
            <div class="bg-gray-200 rounded-lg shadow-md p-4 flex-1 aspect-square sm:flex-none sm:aspect-auto sm:w-64 sm:h-30">SMA</div>
          </div>
        </section>

        <section class="mt-10">
          <div>
            <h2>Metode Belajar Asik dan Seru</h2>
          </div>
          {/* Mobile: carousel geser. Layar sm ke atas: baris di tengah, turun ke bawah kalau tidak muat */}
          <div class="flex gap-4 px-4 overflow-x-auto snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:overflow-visible">
            <div class="bg-gray-200 rounded-lg shadow-md p-4 shrink-0 snap-start w-[100%] sm:w-64 h-80"></div>
            <div class="bg-gray-200 rounded-lg shadow-md p-4 shrink-0 snap-start w-[100%] sm:w-64 h-80"></div>
            <div class="bg-gray-200 rounded-lg shadow-md p-4 shrink-0 snap-start w-[100%] sm:w-64 h-80"></div>
          </div>
        </section>

        <section class="mt-10">
          <div>
            <h2>Temukan Lokasi Kami</h2>
          </div>
          <div class="flex justify-center gap-4 bg-gray-200 rounded-lg shadow-md p-4 w-64 h-80">
            <div class="bg-gray-200 rounded-lg shadow-md p-4 w-64">
              <div class="rounded-lg shadow-lg overflow-hidden h-40">
                <img class="w-full h-full object-cover" src={images['../assets/nextgen_scholar_place.png']} alt="Location" />
              </div>
              <p>Jln. Gasemsari Selatan 1 Rt07/Rw03 Tlogomulyo, Pedurungan, Semarang</p>
            </div>
          </div>
        </section>
        <br/>
      </main>
      <Footer />
      </>
    );
}
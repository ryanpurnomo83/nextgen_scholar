const images = import.meta.glob('../assets/*.{png,jpg,jpeg,svg,webp}', {
    eager: true,
    import: 'default',
})

export default function Footer(){
    return(
        <>
            <div class="flex justify-between items-center bg-[#2D6CDE] text-white px-4 py-2">
                <div class="flex flex-col gap-2">
                    <img src={images['../assets/nextgen_scholar_logo(2).png']} class="w-40 h-auto" alt="Logo" />
                </div>
                <div class="flex gap-4 justify-between items-center">
                    <span>Quick Links</span>
                    <span>Our Course</span>
                    <span>Partnership</span>
                </div>
            </div>
        </>
    );
}
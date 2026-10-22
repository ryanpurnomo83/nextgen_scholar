import {useState} from "preact/hooks";

const menus = [
    {
        id: "dashboard",
        label: "Dashboard"
    },
    {
        id: "kelas",
        label: "Kelas",
        items: [
            { label: "Daftar Kelas", href: "/admin/class" },
            { label: "Tambah Kelas", href: "/admin/class/create" },
        ],
    },
    {
        id: "blog",
        label: "Blog/Berita",
        items: [
            { label: "Semua Berita", href: "/admin/news" },
            { label: "Buat Berita", href: "/admin/news/create" },
        ],
    }
];

export default function Sidebar(){
    const[openIds, setOpenIds] = useState([]);

    const toggle = (id) => {
        setOpenIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    return(
        <aside class="w-64 shrink-0 min-h-screen bg-gray-800 text-white">
            <ul class="py-2">
                {menus.map((menu) => {
                    const isOpen = openIds.includes(menu.id);
                    return (
                        <li key={menu.id}>
                            <button
                                onClick={() => toggle(menu.id)}
                                aria-expanded={isOpen}
                                class="flex w-full items-center justify-between px-4 py-3 text-left hover:by-gray-700 transition-colors">
                                {menu.label}
                                <span>{isOpen ? "▲" : "▼"}</span>
                            </button>

                            {isOpen && (
                                <ul class="bg-gray-900">
                                {menu.items.map((item) => (
                                    <li key={item.href}>
                                        <a href={item.href}
                                           class="block py-2 pl-8 pr-4 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                                </ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
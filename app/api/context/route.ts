import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil data penting secara paralel
    const [contact, about, services, projects, stats] = await Promise.all([
      // 1. Kontak & Jam Kerja
      prisma.contact.findFirst({
        select: { address: true, phone: true, email: true, hours: true }
      }),
      // 2. Visi Misi
      prisma.about.findFirst({
        select: { mission: true, vision: true, values: true }
      }),
      // 3. Layanan & Sub-Layanan
      prisma.service.findMany({
        select: {
          title: true,
          description: true,
          subServices: { select: { title: true } }
        }
      }),
      // 4. Proyek Terbaru (Limit 20 biar AI tahu banyak)
      prisma.project.findMany({
        take: 20,
        orderBy: { id: 'desc' },
        select: {
          title: true,
          description: true,
          client: true,
          completedDate: true,
          service: { select: { title: true } }
        }
      }),
      // 5. Statistik
      prisma.statistic.findMany({
        select: { label: true, number: true }
      })
    ]);

    // Format JSON agar mudah dibaca AI
    const fullContext = {
      profil_perusahaan: {
        nama: "CV. Reswara Praptama",
        alamat: contact?.address || "Semarang, Jawa Tengah",
        kontak: {
          whatsapp: contact?.phone || "-",
          email: contact?.email || "-",
        },
        jam_operasional: contact?.hours || "09:00 - 17:00 WIB",
      },
      tentang: {
        visi: about?.vision || "-",
        misi: about?.mission || "-",
        nilai: about?.values.join(", ") || "-"
      },
      daftar_layanan: services.map((s) => ({
        kategori: s.title,
        deskripsi: s.description,
        sub_layanan: s.subServices.map((sub) => sub.title).join(", ")
      })),
      portfolio_proyek: projects.map((p) => ({
        nama_proyek: p.title,
        klien: p.client || "Privasi",
        kategori: p.service?.title || "Umum",
        status: p.completedDate ? `Selesai (${p.completedDate})` : "On Going"
      })),
      pencapaian: stats.map((s) => `${s.number} ${s.label}`)
    };

    return NextResponse.json(fullContext);

  } catch (error) {
    console.error("Database Context Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data database" }, { status: 500 });
  }
}
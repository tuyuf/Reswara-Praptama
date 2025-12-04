// lib/ProjectModels.ts

// Interface untuk data mentah dari database/API (sesuai yang ada di komponen sekarang)
export interface RawProjectData {
    title: string;
    category: string;
    description: string;
    image: string;
    client?: string;
    completedDate?: string;
  }
  
  // ==========================================
  // 1. KELAS (CLASS) - Abstract Base Class
  // ==========================================
  export abstract class BaseProject {
    // ==========================================
    // 3. ENCAPSULATION (Enkapsulasi)
    // ==========================================
    // Data mentah disimpan secara protected/private
    protected data: RawProjectData;
  
    constructor(data: RawProjectData) {
      this.data = data;
    }
  
    // Getter public untuk mengakses data
    public getTitle(): string {
      return this.data.title;
    }
  
    public getImage(): string {
      return this.data.image;
    }
  
    public getDescription(): string {
      return this.data.description;
    }
  
    // Logika enkapsulasi: Jika client kosong, tampilkan "Private Client"
    public getClientDisplay(): string {
      return this.data.client || "Private Client";
    }
  
    public getCategory(): string {
      return this.data.category;
    }
  
    // ==========================================
    // 5. POLYMORPHISM (Abstract Method)
    // ==========================================
    // Setiap jenis proyek harus menentukan warna badgenya sendiri
    abstract getCategoryColor(): string;
  
    // Setiap jenis proyek punya cara sendiri menampilkan status tanggalnya
    abstract getDateDisplay(): string;
  }
  
  // ==========================================
  // 4. INHERITANCE (Pewarisan) - Proyek Selesai
  // ==========================================
  export class CompletedProject extends BaseProject {
    // ==========================================
    // 5. POLYMORPHISM (Implementasi A)
    // ==========================================
    public getCategoryColor(): string {
      return this.data.category === 'Perencanaan & Desain' ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-sm';
    }
  
    public getDateDisplay(): string {
      return `Selesai: ${this.data.completedDate}`;
    }
  }
  
  // ==========================================
  // 4. INHERITANCE (Pewarisan) - Proyek Berjalan (On-Going)
  // ==========================================
  export class OngoingProject extends BaseProject {
    // ==========================================
    // 5. POLYMORPHISM (Implementasi B)
    // ==========================================
    public getCategoryColor(): string {
      return 'bg-black/50 backdrop-blur-sm';
    }
  
    public getDateDisplay(): string {
      return "Sedang Berjalan 🚧";
    }
  }
  
  // Factory Pattern (Optional Helper) untuk mempermudah pembuatan Objek
  export class ProjectFactory {
    static createProject(data: RawProjectData): BaseProject {
      // Logika penentuan objek: Jika ada tanggal selesai, maka Completed, jika tidak maka Ongoing
      if (data.completedDate && data.completedDate.trim() !== '') {
        return new CompletedProject(data);
      } else {
        return new OngoingProject(data);
      }
    }
  }
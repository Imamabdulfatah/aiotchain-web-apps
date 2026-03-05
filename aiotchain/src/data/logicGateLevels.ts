export type GateType = "AND" | "OR" | "NOT" | "XOR" | "NAND" | "NOR";

export interface Connection {
  from: string | number; // Input ID (A, B, C) or Slot index (0, 1, 2...)
  to: number | "output"; // Slot index or final output
  pin?: 1 | 2; // Input pin of the target slot
}

export interface Level {
  id: number;
  title: string;
  description: string;
  inputs: { id: string; value: number }[];
  targetOutput: number;
  allowedGates: GateType[];
  gateLimit: number;
  difficulty: "Easy" | "Medium" | "Hard";
  connections?: Connection[];
}

export const LOGIC_GATE_LEVELS: Level[] = [
  {
    id: 1,
    title: "AND Sederhana",
    description: "Hubungkan dua sinyal TINGGI (1) melalui gerbang AND untuk mencapai target.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 1 },
    ],
    targetOutput: 1,
    allowedGates: ["AND"],
    gateLimit: 1,
    difficulty: "Easy",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: "output" }
    ]
  },
  {
    id: 2,
    title: "Lapisan Inversi",
    description: "Kita punya sinyal TINGGI (1), tapi kita butuh output RENDAH (0). Bagaimana cara membaliknya?",
    inputs: [
      { id: "A", value: 1 },
    ],
    targetOutput: 0,
    allowedGates: ["NOT"],
    gateLimit: 1,
    difficulty: "Easy",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: 0, to: "output" }
    ]
  },
  {
    id: 3,
    title: "Misteri XOR",
    description: "Hasilkan sinyal TINGGI (1) dari dua input yang sama (0, 0) menggunakan gerbang NOT dan OR.",
    inputs: [
      { id: "A", value: 0 },
      { id: "B", value: 0 },
    ],
    targetOutput: 1,
    allowedGates: ["NOT", "OR"],
    gateLimit: 3,
    difficulty: "Medium",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 1, pin: 1 },
      { from: 0, to: 2, pin: 1 },
      { from: 1, to: 2, pin: 2 },
      { from: 2, to: "output" }
    ]
  },
  {
    id: 4,
    title: "Protokol Efisiensi",
    description: "Buat output TINGGI (1) dari (1, 0) dengan gerbang minimal. Gunakan XOR untuk efisiensi maksimum!",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 0 },
    ],
    targetOutput: 1,
    allowedGates: ["XOR", "AND", "OR"],
    gateLimit: 1,
    difficulty: "Medium",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: "output" }
    ]
  },
  {
    id: 5,
    title: "Ancaman Tiga Lapis",
    description: "Ketiga input harus dikombinasikan untuk menghasilkan satu output TINGGI (1). Hati-hati dengan aliran logikanya.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 0 },
      { id: "C", value: 1 },
    ],
    targetOutput: 0,
    allowedGates: ["AND", "OR", "NOT", "XOR"],
    gateLimit: 4,
    difficulty: "Hard",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: "C", to: 1, pin: 2 },
      { from: 1, to: "output" }
    ]
  },
  {
    id: 6,
    title: "Logika Terbalik (NAND)",
    description: "Gunakan gerbang NAND untuk menghasilkan output 1 dari dua input TINGGI (1). Ingat, NAND adalah NOT AND.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 1 },
    ],
    targetOutput: 0,
    allowedGates: ["NAND", "AND"],
    gateLimit: 1,
    difficulty: "Medium",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: "output" }
    ]
  },
  {
    id: 7,
    title: "Gerbang Eksklusif Tiga",
    description: "Hasilkan output 1 dari tiga input (1, 1, 1). Gunakan dua gerbang XOR secara berurutan.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 1 },
      { id: "C", value: 1 },
    ],
    targetOutput: 1,
    allowedGates: ["XOR"],
    gateLimit: 2,
    difficulty: "Medium",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: "C", to: 1, pin: 2 },
      { from: 1, to: "output" }
    ]
  },
  {
    id: 8,
    title: "Kombinasi NOR",
    description: "Buat output 1 dari input (1, 0) menggunakan gerbang NOR dan NOT. Tantangan: minimalisir jumlah gerbang.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 0 },
    ],
    targetOutput: 1,
    allowedGates: ["NOR", "NOT", "OR"],
    gateLimit: 2,
    difficulty: "Hard",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: 1, to: "output" }
    ]
  },
  {
    id: 9,
    title: "Sirkuit Selektor",
    description: "Hanya jika A dan B aktif, ATAU C aktif, output menjadi 0. Gunakan kombinasi AND, OR, dan NOT.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 1 },
      { id: "C", value: 0 },
    ],
    targetOutput: 0,
    allowedGates: ["AND", "OR", "NOT"],
    gateLimit: 3,
    difficulty: "Hard",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: "C", to: 1, pin: 2 },
      { from: 1, to: 2, pin: 1 },
      { from: 2, to: "output" }
    ]
  },
  {
    id: 10,
    title: "Master Logika",
    description: "Tantangan Akhir: Ubah (1, 0, 1) menjadi output 1 menggunakan maksimal 3 gerbang apa saja.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 0 },
      { id: "C", value: 1 },
    ],
    targetOutput: 1,
    allowedGates: ["AND", "OR", "NOT", "XOR", "NAND", "NOR"],
    gateLimit: 3,
    difficulty: "Hard",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: "C", to: 1, pin: 2 },
      { from: 1, to: 2, pin: 1 },
      { from: 2, to: "output" }
    ]
  },
  {
    id: 11,
    title: "Enigma NAND Ganda",
    description: "Gunakan dua gerbang NAND untuk menghasilkan output TINGGI (1) dari input (1, 1, 0). Ingat sifat NAND: hanya 0 jika semua input 1.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 1 },
      { id: "C", value: 0 },
    ],
    targetOutput: 1,
    allowedGates: ["NAND"],
    gateLimit: 2,
    difficulty: "Medium",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: "C", to: 1, pin: 2 },
      { from: 1, to: "output" }
    ]
  },
  {
    id: 12,
    title: "Filter Sinyal NOR",
    description: "Hasilkan output 1 dari input (0, 0, 1) menggunakan kombinasi gerbang NOR. Tantangan: minimalisir penggunaan gerbang.",
    inputs: [
      { id: "A", value: 0 },
      { id: "B", value: 0 },
      { id: "C", value: 1 },
    ],
    targetOutput: 1,
    allowedGates: ["NOR", "OR"],
    gateLimit: 2,
    difficulty: "Medium",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: "C", to: 1, pin: 2 },
      { from: 1, to: "output" }
    ]
  },
  {
    id: 13,
    title: "Konvergensi Logika",
    description: "Empat input! Ubah (1, 1, 0, 0) menjadi output 1 menggunakan gerbang apa pun. Waspada terhadap batas maksimal gerbang.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 1 },
      { id: "C", value: 0 },
      { id: "D", value: 0 },
    ],
    targetOutput: 1,
    allowedGates: ["AND", "OR", "XOR", "NAND", "NOR"],
    gateLimit: 3,
    difficulty: "Hard",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: "C", to: 1, pin: 1 },
      { from: "D", to: 1, pin: 2 },
      { from: 0, to: 2, pin: 1 },
      { from: 1, to: 2, pin: 2 },
      { from: 2, to: "output" }
    ]
  },
  {
    id: 14,
    title: "Inversi Strategis",
    description: "Dapatkan output 0 dari input (0, 0, 0) menggunakan paling sedikit 3 gerbang. Bagaimana cara membalikkan kondisi total?",
    inputs: [
      { id: "A", value: 0 },
      { id: "B", value: 0 },
      { id: "C", value: 0 },
    ],
    targetOutput: 0,
    allowedGates: ["NOT", "NAND", "NOR", "AND", "OR"],
    gateLimit: 3,
    difficulty: "Hard",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: 0, to: 1, pin: 1 },
      { from: "C", to: 1, pin: 2 },
      { from: 1, to: 2, pin: 1 },
      { from: 2, to: "output" }
    ]
  },
  {
    id: 15,
    title: "Paradoks Arsitek",
    description: "Level Maksimal: Hasilkan output 1 dari input (1, 0, 1, 0) menggunakan gerbang XOR dan NAND saja dalam struktur yang presisi.",
    inputs: [
      { id: "A", value: 1 },
      { id: "B", value: 0 },
      { id: "C", value: 1 },
      { id: "D", value: 0 },
    ],
    targetOutput: 1,
    allowedGates: ["XOR", "NAND"],
    gateLimit: 3,
    difficulty: "Hard",
    connections: [
      { from: "A", to: 0, pin: 1 },
      { from: "B", to: 0, pin: 2 },
      { from: "C", to: 1, pin: 1 },
      { from: "D", to: 1, pin: 2 },
      { from: 0, to: 2, pin: 1 },
      { from: 1, to: 2, pin: 2 },
      { from: 2, to: "output" }
    ]
  }
];

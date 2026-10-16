import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  BookOpen, 
  Clock, 
  Calendar, 
  User, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Binary, 
  Box, 
  Network, 
  Zap, 
  ArrowUpRight,
  Database,
  Lock,
  GitBranch,
  Activity,
  Code2,
  Atom,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

export interface Breakthrough {
  number: number;
  title: string;
  year: string;
  category: "Systems & Memory" | "Neural & Generative AI" | "Web & Spatial Graphics" | "Decentralized & Cryptography" | "Developer Toolchains & Reactive UI" | "Distributed Systems & Kernels";
  pioneers: string;
  tagline: string;
  description: string;
  architecturalImpact: string;
  keyPrinciple: string;
  modernManifestation: string;
  icon: any;
}

export const BREAKTHROUGHS_DATA: Breakthrough[] = [
  {
    number: 1,
    title: "The Rust Language & The Affine Borrow Checker",
    year: "2015",
    category: "Systems & Memory",
    pioneers: "Graydon Hoare, Mozilla Research & Open-Source Community",
    tagline: "Compile-time affine type systems eliminating memory corruption without a garbage collector",
    description: "Graydon Hoare's creation at Mozilla answered the forty-year systems programming conundrum: how to achieve C/C++ bare-metal performance without memory corruption vulnerabilities. Through compile-time affine type systems, strict ownership semantics, and lifetimes, Rust mathematically eliminated data races, use-after-free, double frees, and dangling pointers without a garbage collector.",
    architecturalImpact: "Adopted as the foundational language for the Linux Kernel, Windows core OS components, Android security layers, high-throughput cloud storage engines, and high-frequency financial settlement networks.",
    keyPrinciple: "Ownership, borrow checking, and zero-cost abstractions guarantee memory safety at compile-time with deterministic runtime destruction.",
    modernManifestation: "Linux Kernel 6.x Rust drivers, Chromium sandbox isolation, Polars columnar engine, Solana validator nodes.",
    icon: ShieldCheck
  },
  {
    number: 2,
    title: "Transformers & Self-Attention",
    year: "2017",
    category: "Neural & Generative AI",
    pioneers: "Vaswani et al. (Google Brain / Research)",
    tagline: "Replacing sequential recurrence with parallelized all-to-all attention matrices across tensor cores",
    description: "The seminal paper 'Attention Is All You Need' discarded recurrence (RNNs, LSTMs) and convolutions in favor of multi-head self-attention mechanisms. By enabling full-sequence parallel training across thousands of GPU tensor cores, self-attention enabled the contemporary generative AI explosion—powering Claude, GPT, Gemini, and modern multi-modal reasoning engines.",
    architecturalImpact: "Shifted compute from O(N) sequential state updates to O(N²) all-to-all attention matrix projections, creating foundation models capable of emergent reasoning across text, code, audio, and vision.",
    keyPrinciple: "Attention(Q, K, V) = softmax(Q Kᵀ / √d_k) V computed with FlashAttention kernel tiling.",
    modernManifestation: "Gemini 2.5/3.0, Claude 3.7 Sonnet, DeepSeek V3, multi-modal vision-language transformers.",
    icon: Sparkles
  },
  {
    number: 3,
    title: "WebGL & WebGPU Evolution",
    year: "2011–2024",
    category: "Web & Spatial Graphics",
    pioneers: "Khronos Group, W3C GPU for the Web Working Group",
    tagline: "Zero-overhead browser access to modern low-level graphics APIs (Vulkan, Metal, DirectX 12)",
    description: "Hardware-accelerated 3D graphics in the browser evolved from WebGL (OpenGL ES bindings) to WebGPU: a modern zero-overhead API mapped directly to native Vulkan, Metal, and DirectX 12 driver pipelines. WebGPU gives web applications direct compute shaders for client-side machine learning inference and hyper-dense particle simulations.",
    architecturalImpact: "Turned the browser into a native-speed graphics workstation, enabling AAA gaming, CAD solid modeling, on-device neural execution (WebLLM), and real-time physical simulations in sandboxed iframes.",
    keyPrinciple: "Command encoders, bind groups, and WGSL compute shaders directly multiplexed over host GPU pipelines without driver overhead.",
    modernManifestation: "WebGPU in Chrome/Safari, WebLLM local client inference, Babylon.js / Three.js WebGPURenderer.",
    icon: Box
  },
  {
    number: 4,
    title: "Three.js: Democratic Spatial Computing on the Web",
    year: "2010–Present",
    category: "Web & Spatial Graphics",
    pioneers: "Ricardo Cabello (Mr.doob) & Global Open-Source Contributors",
    tagline: "Democratizing complex vertex shaders and matrix math into an expressive JavaScript 3D engine",
    description: "Ricardo Cabello (Mr.doob) and contributors abstracted complex vertex shaders, projection matrices, and WebGL state machines into an expressive, modular JavaScript 3D engine. Three.js made interactive spatial design, photorealistic PBR materials, post-processing pipelines, and real-time architectural visualizations universal across the web.",
    architecturalImpact: "Became the de facto 3D canvas of the open web, powering high-end luxury e-commerce, digital twins, spatial data visualization, and Apple Vision Pro WebXR experiences.",
    keyPrinciple: "Declarative scene graph (Scene, Camera, Mesh, Material) coupled with customizable GLSL shaders and modular render passes.",
    modernManifestation: "Three.js r170+, React Three Fiber (R3F), WebXR immersive experiences, Apple product showcases.",
    icon: Box
  },
  {
    number: 5,
    title: "p5.js & Processing Re-imagined",
    year: "2014",
    category: "Web & Spatial Graphics",
    pioneers: "Lauren McCarthy & The Processing Foundation",
    tagline: "Democratizing creative programming and visual computing algorithms for educators and artists",
    description: "Democratized creative programming for educators, generative artists, and researchers. By turning raw HTML5 canvas APIs into accessible, expressive visual algorithms with setup() and draw() paradigms, p5.js bridged visual arts and computer science and inspired millions of new engineers worldwide.",
    architecturalImpact: "Established the gold standard for creative algorithmic code, computational geometry education, and interactive data visualization.",
    keyPrinciple: "Accessible, immediate-mode canvas programming lowering the barrier to computational creativity.",
    modernManifestation: "Generative NFT art protocols, interactive museum installations, data journalism graphics.",
    icon: Code2
  },
  {
    number: 6,
    title: "Blender 2.80+ & The Cycles/Eevee Revolution",
    year: "2019",
    category: "Web & Spatial Graphics",
    pioneers: "Ton Roosendaal & The Blender Foundation",
    tagline: "Real-time physically based viewport engine outperforming proprietary enterprise 3D suites",
    description: "Blender's historic rewrite delivered Eevee (real-time physically based viewport engine) and Cycles X (OptiX-accelerated path tracing), outperforming proprietary enterprise tools like Maya and 3ds Max while remaining 100% free open-source software.",
    architecturalImpact: "Proved that open-source software with community funding can dismantle entrenched proprietary monopolies in VFX, film, architecture, and video game production.",
    keyPrinciple: "Unifying real-time rasterized viewport feedback with hardware-accelerated ray tracing pipelines in a single unified open ecosystem.",
    modernManifestation: "Blender 4.x, Eevee Next, OpenUSD enterprise interoperability.",
    icon: Flame
  },
  {
    number: 7,
    title: "\"Neo-Blender\": Real-Time AI Neural Rendering & Geometry Nodes",
    year: "2023–2026",
    category: "Web & Spatial Graphics",
    pioneers: "Blender Community, 3D Gaussian Splatting & NeRF Pioneers",
    tagline: "Convergence of procedural Geometry Nodes with Gaussian Splatting and depth-conditioned neural rendering",
    description: "The recent convergence of Blender's procedural Geometry Nodes with 3D Gaussian Splatting, NeRFs (Neural Radiance Fields), and AI depth-conditioned rigging—often termed the 'Neo-Blender' paradigm. Artists can now project neural 3D volumes into real-time geometry with procedural parametric controls.",
    architecturalImpact: "Merged mathematical computational geometry with continuous neural representations, eliminating the divide between photogrammetry, AI synthesis, and manual polygonal modeling.",
    keyPrinciple: "Point-cloud Gaussian ellipsoids rasterized at 200+ FPS coupled with procedural nodal graph pipelines.",
    modernManifestation: "Real-time Gaussian Splat viewports, neural radiance volume editing, automated neural rigging.",
    icon: Sparkles
  },
  {
    number: 8,
    title: "Web3, Smart Contracts & Cryptographic Consensus",
    year: "2015",
    category: "Decentralized & Cryptography",
    pioneers: "Vitalik Buterin, Gavin Wood & Ethereum Core Contributors",
    tagline: "Turing-complete decentralized computing and global state execution without central authorities",
    description: "The invention of Turing-complete decentralized computing through Ethereum, the EVM (Ethereum Virtual Machine), and Proof-of-Stake consensus. Smart contracts demonstrated that state execution could be coordinated globally across untrusted nodes with deterministic finality.",
    architecturalImpact: "Created permissionless financial infrastructure (DeFi), programmatic escrow, multi-signature corporate governance, and immutable ledger accounting.",
    keyPrinciple: "State machine replication over cryptographic gossip networks with verifiable gas-metered bytecode execution.",
    modernManifestation: "Ethereum L1/L2 Rollups, ERC-4337 Account Abstraction, Sovereign Treasury Multi-Sig vaults.",
    icon: Binary
  },
  {
    number: 9,
    title: "Zero-Knowledge Proofs (zk-SNARKs & zk-STARKs)",
    year: "2013–2026",
    category: "Decentralized & Cryptography",
    pioneers: "Eli Ben-Sasson, Shafi Goldwasser, Silvio Micali & ZK Pioneers",
    tagline: "Proving computational truth without revealing underlying private inputs or payloads",
    description: "Cryptographic breakthroughs allowing one party to prove the mathematical truth of a computational statement without revealing the underlying data. zk-Rollups enabled hyper-scalable blockchain throughput and privacy-preserving credential authentication.",
    architecturalImpact: "Decoupled verification cost from computation cost: an untrusted server can perform billions of operations and produce a tiny proof verified in milliseconds on a mobile device.",
    keyPrinciple: "Arithmetic circuits, polynomial commitment schemes (KZG, FRI), and interactive oracle proofs made non-interactive.",
    modernManifestation: "zkSync, Starknet, zk-EVMs, privacy-preserving KYC identity credentials.",
    icon: Lock
  },
  {
    number: 10,
    title: "WebAssembly (Wasm)",
    year: "2017",
    category: "Developer Toolchains & Reactive UI",
    pioneers: "W3C WebAssembly Working Group (Mozilla, Google, Apple, Microsoft)",
    tagline: "Compact binary instruction format executing at near-native speed inside secure browser sandboxes",
    description: "A compact binary instruction format running at near-native speed inside browser sandboxes. Enabled porting Photoshop, Figma (C++ rendering engine), Unreal Engine, and complex Rust binaries directly to web runtimes without plugins.",
    architecturalImpact: "Transformed the web into a universal operating system capable of running legacy desktop software, machine learning inference, and high-frequency trading code safely.",
    keyPrinciple: "Stack-based virtual machine with linear memory and structured control flow isolated by memory boundary checks.",
    modernManifestation: "Figma in-browser engine, Adobe Photoshop Web, Cloudflare Workers Wasm runtimes.",
    icon: Terminal
  },
  {
    number: 11,
    title: "GitOps & Container Orchestration (Kubernetes)",
    year: "2014–Present",
    category: "Distributed Systems & Kernels",
    pioneers: "Google Cloud / CNCF, Brendan Burns, Joe Beda, Craig McLuckie",
    tagline: "Declarative infrastructure as code with self-healing reconciliation loops across clusters",
    description: "Declarative infrastructure as code. Decoupled applications from physical host machines via OCI container standards, driving resilient self-healing server clusters with automated rollouts, health probes, and horizontal autoscaling.",
    architecturalImpact: "Eliminated manual server configuration in favor of reproducible Git commits as the single source of truth for global cloud deployments.",
    keyPrinciple: "Continuous reconciliation loop: Current State converges to Desired Declarative State through idempotent controllers.",
    modernManifestation: "K8s 1.30+, ArgoCD, Helm, AWS EKS, Sovereign Cloud clusters.",
    icon: GitBranch
  },
  {
    number: 12,
    title: "Serverless & Edge Compute Runtimes",
    year: "2017–Present",
    category: "Distributed Systems & Kernels",
    pioneers: "Cloudflare (Workers), V8 Engine Team, Fastly",
    tagline: "Replacing bulky virtual machines with microsecond V8 isolates deployed at global points of presence",
    description: "Replaced bulky long-running server VMs with microsecond-spinup V8 isolates deployed in hundreds of edge data centers worldwide, processing API requests closer to user speed-of-light boundaries.",
    architecturalImpact: "Reduced compute cold starts from 10 seconds to under 5 milliseconds while removing server patching, container orchestration overhead, and geographic latency.",
    keyPrinciple: "V8 memory isolates multiplex thousands of customer scripts inside a single process with zero memory leak cross-contamination.",
    modernManifestation: "Cloudflare Workers, Deno Deploy, Vercel Edge Middleware, Supabase Edge Functions.",
    icon: Zap
  },
  {
    number: 13,
    title: "Deep Residual Networks (ResNet)",
    year: "2015",
    category: "Neural & Generative AI",
    pioneers: "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
    tagline: "Skip connections solving the vanishing gradient problem in deep neural networks",
    description: "He et al. introduced identity skip connections that solved the vanishing and exploding gradient problem, allowing deep neural networks to scale past 100+ layers and triggering the modern computer vision and deep learning boom.",
    architecturalImpact: "Foundational architecture for nearly every modern vision model, transformer residual stream, and diffusion UNet backbone.",
    keyPrinciple: "H(x) = F(x) + x: network layers learn residual mapping rather than the unreferenced underlying mapping.",
    modernManifestation: "ResNet-50/152 backbones, Transformer residual streams, Vision Transformers (ViT).",
    icon: Network
  },
  {
    number: 14,
    title: "Diffusion Models & Generative Latent Spaces",
    year: "2020–2026",
    category: "Neural & Generative AI",
    pioneers: "Sohl-Dickstein, Ho et al. (DDPM), Song & Ermon (Score-based)",
    tagline: "Thermodynamic score-matching and iterative denoising unlocking photorealistic visual synthesis",
    description: "Replacing mode-collapse-prone GANs with thermodynamic score-matching and denoising diffusion probabilistic models (DDPMs), unlocking photorealistic visual synthesis, video generation, and audio production from textual prompts.",
    architecturalImpact: "Transformed digital content creation, concept art, 3D asset generation, and video synthesis through continuous probability trajectory inversion.",
    keyPrinciple: "Gradual addition of Gaussian noise in forward pass; neural network trained to predict and subtract noise in reverse pass.",
    modernManifestation: "Stable Diffusion 3.5, Midjourney v6, OpenAI Sora, Runway Gen-3.",
    icon: Sparkles
  },
  {
    number: 15,
    title: "AlphaFold & Deep Learning in Structural Biology",
    year: "2020–2024",
    category: "Neural & Generative AI",
    pioneers: "Demis Hassabis, John Jumper & DeepMind Team (Nobel Prize in Chemistry 2024)",
    tagline: "Solving the 50-year grand challenge of predicting 3D protein structures from 1D amino acid sequences",
    description: "Solved the 50-year grand challenge of predicting 3D protein structures directly from 1D amino acid sequences with atomic accuracy, catapulting modern biochemistry, drug discovery, and molecular design forward by decades.",
    architecturalImpact: "Demonstrated that deep neural networks can solve fundamental physical and biological sciences problems previously deemed intractable through traditional laboratory crystallization.",
    keyPrinciple: "Evoformer attention layers mapping evolutionary covariation matrices to 3D spatial invariant frame representations.",
    modernManifestation: "AlphaFold 3 (DNA/RNA/ligand complexes), automated de novo drug design, synthetic enzyme design.",
    icon: Atom
  },
  {
    number: 16,
    title: "Fast Compilers: SWC, esbuild & The Native Tooling Shift",
    year: "2020–2026",
    category: "Developer Toolchains & Reactive UI",
    pioneers: "Evan Wallace (esbuild), DongYoon Kang (SWC), Biome / Rust Tooling Community",
    tagline: "Swapping interpreted JavaScript build pipelines with compiled Go and Rust native binaries",
    description: "The modernization of frontend developer toolchains by swapping legacy interpreted JavaScript build steps (Babel, Webpack) with Go (esbuild) and Rust (SWC, Turbopack, Biome), cutting bundling and transpilation times from minutes to milliseconds.",
    architecturalImpact: "Returned instant feedback and sub-second Hot Module Replacement (HMR) to large-scale enterprise frontends with 100,000+ modules.",
    keyPrinciple: "Multi-threaded native CPU cache alignment and zero-AST-serialization architectures.",
    modernManifestation: "Vite (backed by esbuild/Rollup), Next.js Turbopack, Biome formatting/linting.",
    icon: Terminal
  },
  {
    number: 17,
    title: "Svelte & Compiler-First Reactive Frontends",
    year: "2019–Present",
    category: "Developer Toolchains & Reactive UI",
    pioneers: "Rich Harris & Svelte Core Team",
    tagline: "Eliminating the virtual DOM runtime tax by shifting reactivity into build-time compiled instructions",
    description: "Pioneered eliminating the virtual DOM runtime tax by shifting reactivity into build-time compiled instructions. Svelte 5 with Signals ('Runes') achieves surgical DOM updates with micro-benchmark speed and minimal bundle overhead.",
    architecturalImpact: "Sparked the cross-framework revolution away from monolithic virtual DOM diffing toward fine-grained signal reactivity (adopted in Solid, Angular, Vue, and Preact).",
    keyPrinciple: "Compile UI components directly into imperatively optimized DOM mutation calls without runtime diffing overhead.",
    modernManifestation: "Svelte 5 Runes ($state, $derived, $effect), high-performance real-time trading dashboards.",
    icon: Layers
  },
  {
    number: 18,
    title: "TailwindCSS & Utility-First Compilation",
    year: "2017–Present",
    category: "Developer Toolchains & Reactive UI",
    pioneers: "Adam Wathan, Steve Schoger & Tailwind Labs",
    tagline: "JIT on-demand CSS compilation delivering sub-15kb production stylesheets with total consistency",
    description: "Revolutionized user interface styling by combining utility classes with JIT (Just-In-Time) tree-shaking compilation, delivering sub-15kb production stylesheets with flawless design consistency and zero class naming fatigue.",
    architecturalImpact: "Became the universal styling language of modern web applications, eliminating dead CSS bloat and enabling seamless design systems.",
    keyPrinciple: "Scanning source files for class strings at build-time and generating only the exact CSS rules needed.",
    modernManifestation: "Tailwind CSS v4 (Lightning CSS engine), Shadcn UI, modern fintech design libraries.",
    icon: Flame
  },
  {
    number: 19,
    title: "CRDTs (Conflict-free Replicated Data Types) & Local-First Software",
    year: "2011–Present",
    category: "Distributed Systems & Kernels",
    pioneers: "Marc Shapiro, Martin Kleppmann (Automerge), Kevin Jahns (Yjs)",
    tagline: "Mathematical data structures synchronizing distributed edits across peers without central coordination",
    description: "Mathematical data structures that synchronize distributed concurrent edits across peers without central lockstep coordination, powering modern real-time collaborative engines like Figma, Notion, and multiplayer applications.",
    architecturalImpact: "Enabled the 'Local-First' software movement: users own their data locally on disk with instantaneous offline edits that seamlessly merge with remote cloud peers upon reconnection.",
    keyPrinciple: "State-based and operation-based algebraic lattices where concurrent operations are mathematically commutative, associative, and idempotent.",
    modernManifestation: "Yjs, Automerge, Linear sync engine, Figma collaborative multiplayer canvas.",
    icon: GitBranch
  },
  {
    number: 20,
    title: "Protocol Buffers & High-Performance gRPC / FlatBuffers",
    year: "2015–Present",
    category: "Distributed Systems & Kernels",
    pioneers: "Google, Cloud Native Computing Foundation (CNCF)",
    tagline: "Zero-copy binary serializations and multiplexed HTTP/2 streaming replacing bulky JSON over HTTP/1.1",
    description: "Binary serializations with zero-copy decoding that replaced bulky JSON over HTTP/1.1 with multiplexed HTTP/2 streaming for microsecond internal service communication across distributed microservices.",
    architecturalImpact: "Reduced network payloads by 70-85% and serialization CPU cycles by up to 10x in high-throughput cloud infrastructure and algorithmic finance.",
    keyPrinciple: "Schema-defined typed fields packed into varints and binary tags with strict backward/forward compatibility.",
    modernManifestation: "gRPC microservices, Envoy proxy mesh, Kubernetes internal communication, Kafka streaming.",
    icon: Binary
  },
  {
    number: 21,
    title: "Apache Arrow & Columnar In-Memory Processing",
    year: "2016–Present",
    category: "Distributed Systems & Kernels",
    pioneers: "Wes McKinney (Pandas creator) & Apache Software Foundation",
    tagline: "Standardized in-memory columnar data representations removing serialization overhead across languages",
    description: "Standardized in-memory columnar data representations, removing serialization overhead between Python, C++, R, and Rust data-science runtimes and enabling SIMD vectorized query execution.",
    architecturalImpact: "United the fragmented data science ecosystem, allowing high-performance analytics to share zero-copy memory buffers across processes.",
    keyPrinciple: "Contiguous columnar memory layout aligned to CPU cache lines and SIMD vector registers.",
    modernManifestation: "Polars, DuckDB, Apache DataFusion, PyArrow, Snowflake query engines.",
    icon: Database
  },
  {
    number: 22,
    title: "NVMe, io_uring & Linux Async I/O",
    year: "2019–Present",
    category: "Distributed Systems & Kernels",
    pioneers: "Jens Axboe (Linux Kernel Storage Lead) & NVMe Consortium",
    tagline: "Eliminating system-call overhead for disk and network I/O via shared memory ring buffers",
    description: "The Linux kernel io_uring interface eliminated system-call overhead for storage and networking, allowing modern backend services to handle millions of IOPS (I/O operations per second) on commodity hardware.",
    architecturalImpact: "Rewrote server architecture by removing the cost of epoll and context switches, enabling single-thread event loops to saturate multi-gigabit network interfaces.",
    keyPrinciple: "Submission and completion ring buffers shared directly in memory between user space and kernel space.",
    modernManifestation: "Linux Kernel 5.1+, Tokio io_uring runtime, high-frequency database engines, Ceph storage.",
    icon: Cpu
  },
  {
    number: 23,
    title: "LLVM as Universal Compiler Infrastructure",
    year: "2011–Present",
    category: "Developer Toolchains & Reactive UI",
    pioneers: "Chris Lattner, Vikram Adve & The LLVM Foundation",
    tagline: "Decoupling front-end language syntax from target machine architecture optimizations",
    description: "Modular compiler backend that decoupled front-end syntax parsing (Clang, Swift, Rust, Julia) from machine architecture optimization (x86_64, ARM64, RISC-V, WebAssembly, GPU PTX).",
    architecturalImpact: "Made creating new high-performance systems languages feasible for small teams by providing industrial-strength optimization and code generation out of the box.",
    keyPrinciple: "Three-phase design with strongly typed Intermediate Representation (LLVM IR) facilitating modular optimization passes.",
    modernManifestation: "Rustc, Clang, Swift, Zig, Julia, Apple Silicon toolchains.",
    icon: Layers
  },
  {
    number: 24,
    title: "RISC-V Open Instruction Set Architecture",
    year: "2010–Present",
    category: "Systems & Memory",
    pioneers: "Krste Asanović, David Patterson & UC Berkeley Architecture Team",
    tagline: "Open standard royalty-free instruction set breaking proprietary silicon monopolies",
    description: "An open standard royalty-free instruction set architecture breaking proprietary silicon monopolies (x86, ARM), accelerating custom AI accelerators, edge microcontrollers, and sovereign space hardware.",
    architecturalImpact: "Democratized processor design, enabling universities, startups, and sovereign nations to build verified silicon without paying exorbitant licensing royalties.",
    keyPrinciple: "Simple, modular base integer instruction set (RV32I/RV64I) with standard extensions (M, A, F, D, C, V) for vector and crypto acceleration.",
    modernManifestation: "Tenstorrent AI processors, Western Digital disk controllers, space probe compute nodes.",
    icon: Cpu
  },
  {
    number: 25,
    title: "Large-Scale Vector Databases & Embeddings (HNSW & Annoy)",
    year: "2018–2026",
    category: "Distributed Systems & Kernels",
    pioneers: "Yury Malkov (HNSW), Erik Bernhardsson (Annoy), Pinecone & Qdrant Teams",
    tagline: "High-dimensional similarity indexing powering retrieval-augmented generation and semantic search",
    description: "High-dimensional similarity indexing (Hierarchical Navigable Small World graphs) that powers retrieval-augmented generation (RAG), semantic real-time search, and long-term memory for AI swarms.",
    architecturalImpact: "Solved the curse of dimensionality for nearest neighbor queries, enabling sub-millisecond retrieval across billions of 1536-dimensional embedding vectors.",
    keyPrinciple: "Multi-layer graph structure with skip-list navigation yielding O(log N) search complexity in metric spaces.",
    modernManifestation: "Qdrant, pgvector in PostgreSQL, Milvus, Sovereign Neural Knowledge Bases.",
    icon: Database
  },
  {
    number: 26,
    title: "Quantum-Resistant Cryptography (NIST Post-Quantum Standards)",
    year: "2024",
    category: "Decentralized & Cryptography",
    pioneers: "NIST (National Institute of Standards and Technology) & Global Cryptographers",
    tagline: "Lattice-based cryptography protecting global financial communication from quantum decryption",
    description: "Lattice-based cryptographic standards (ML-KEM / Kyber for key encapsulation, ML-DSA / Dilithium for digital signatures) engineered to protect global communication from future decryption by quantum computers.",
    architecturalImpact: "The largest cryptographic migration in human history, safeguarding SSL/TLS web traffic, bank settlement rails, and state secrets against 'Harvest Now, Decrypt Later' attacks.",
    keyPrinciple: "Hardness of Learning With Errors (LWE) and Shortest Vector Problems (SVP) in high-dimensional geometric lattices.",
    modernManifestation: "TLS 1.3 post-quantum hybrid key exchange in Chrome/Cloudflare, Sovereign Treasury encrypted ledgers.",
    icon: Lock
  }
];

export function ComputerScienceBreakthroughs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBreakthrough, setSelectedBreakthrough] = useState<Breakthrough | null>(BREAKTHROUGHS_DATA[0]);

  const categories = [
    "All",
    "Systems & Memory",
    "Neural & Generative AI",
    "Web & Spatial Graphics",
    "Decentralized & Cryptography",
    "Developer Toolchains & Reactive UI",
    "Distributed Systems & Kernels"
  ];

  const filtered = BREAKTHROUGHS_DATA.filter((b) => {
    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    const matchesSearch = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pioneers.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.modernManifestation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard!");
    } else {
      toast.info("Published: March 20, 2026 by Asim Aryal");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16">
      {/* Article Hero Banner */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 md:p-12 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl -mb-32 pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Computer Science
            </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Tech Revolution
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 20 min read
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            The 26 Most Remarkable Computer Science & Software Breakthroughs
            <span className="block text-2xl md:text-3xl text-indigo-400 font-semibold mt-2">
              (Past 15 Years: 2011 – 2026)
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 font-mono leading-relaxed max-w-3xl">
            Rust, WebGL/Web3, Three.js, p5.js, Blender 3D, Transformers, Neo-Blender, and the revolution of modern computing architectures.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                AA
              </div>
              <div>
                <div className="font-bold text-white text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" /> By Asim Aryal
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> March 20, 2026 • Published in Sovereign Research Core
                </div>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Share2 className="w-4 h-4" /> Share Article
            </button>
          </div>
        </div>
      </div>

      {/* Preface & Wisdom Block */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            15 Years of Radical Paradigm Shifts (2011–2026)
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Over the past fifteen years, computer science transformed from CPU-bound imperative programming into GPU-accelerated massive parallelism, mathematically verified memory safety, neural representations of 3D reality, and universal web sandboxes. 
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            The 26 breakthrough innovations catalogued below reshaped the fabric of human software: from Graydon Hoare's affine borrow checker in Rust solving memory corruption, to Vaswani et al.'s self-attention matrix projections powering the AI era, to low-overhead WebGPU pipelines and post-quantum lattice cryptography.
          </p>
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
            <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-950">
              <span className="font-bold">Architectural Synthesis:</span> Each breakthrough embodies the principle of <em>eliminating unnecessary runtime friction</em>—whether eliminating garbage collection pauses, eliminating sequential RNN dependencies, eliminating driver overhead, or eliminating trust requirements through cryptographic proofs.
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-md flex flex-col justify-between border border-slate-800">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Sovereign Computational Thesis
            </div>
            <h3 className="text-lg font-black tracking-tight leading-snug">
              Wisdom & Fulfilling the Immense Promise
            </h3>
            <p className="text-slate-300 text-xs mt-3 leading-relaxed">
              "To harness these discoveries is to build software where memory safety is mathematically proven, compute scales across thousands of tensor cores, state synchronizes locally without central bottlenecks, and assets settle with cryptographic finality."
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Author: Asim Aryal</span>
            <span className="text-amber-400 font-bold">26 Innovations</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls: Search & Category Filter */}
      <div className="bg-slate-900/90 backdrop-blur p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search breakthroughs, creators, concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-xs font-mono text-slate-400 whitespace-nowrap">
            Showing <span className="text-white font-bold">{filtered.length}</span> of 26
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
          {categories.map((cat, cIdx) => (
            <button
              key={`cs-cat-${cat}-${cIdx}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Interactive Detail Inspector */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Breakthrough Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {filtered.map((item, fIdx) => {
            const Icon = item.icon;
            const isSelected = selectedBreakthrough?.number === item.number;

            return (
              <div
                key={`cs-item-${item.number}-${fIdx}`}
                onClick={() => setSelectedBreakthrough(item)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? "bg-white border-indigo-500 shadow-xl ring-2 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center text-xs font-black font-mono shadow-sm shrink-0">
                      #{item.number}
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-base md:text-lg group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        {item.year} • <span className="text-indigo-600 font-semibold">{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2 mb-3">
                  {item.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 font-mono">
                  <span className="truncate max-w-[260px]">Pioneers: {item.pioneers}</span>
                  <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Inspect Architecture <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Architectural Focus Panel */}
        <div className="lg:col-span-5 sticky top-24">
          {selectedBreakthrough ? (
            <div className="bg-slate-900 text-white rounded-3xl p-7 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-md font-mono">
                      Breakthrough #{selectedBreakthrough.number}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{selectedBreakthrough.year}</span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight">
                    {selectedBreakthrough.title}
                  </h3>
                </div>
                <div className="p-3 bg-slate-800 text-indigo-400 rounded-2xl shrink-0">
                  <selectedBreakthrough.icon className="w-6 h-6" />
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">
                  Primary Architectural Thesis
                </div>
                <p className="text-xs text-slate-300 font-mono italic leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                  "{selectedBreakthrough.tagline}"
                </p>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Exhaustive Analysis & Context
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {selectedBreakthrough.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Underlying Mathematical & System Principle
                  </div>
                  <div className="text-xs font-mono text-slate-200">
                    {selectedBreakthrough.keyPrinciple}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Global Architectural Impact
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    {selectedBreakthrough.architecturalImpact}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/50">
                  <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Modern 2026 Production Manifestation
                  </div>
                  <div className="text-xs text-indigo-200 font-mono">
                    {selectedBreakthrough.modernManifestation}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Attribution: {selectedBreakthrough.pioneers}</span>
                <span className="text-slate-500 font-mono">Asim Aryal Core</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
              Select a breakthrough to inspect full architectural analysis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

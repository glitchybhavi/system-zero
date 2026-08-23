// Comprehensive OS Curriculum Topics Data

export const TOPIC_CATEGORIES = [
  { id: 'all', label: 'All Topics', count: 19 },
  { id: 'foundations', label: 'OS Foundations', count: 3 },
  { id: 'linux', label: 'Linux & CLI', count: 4 },
  { id: 'process', label: 'Processes & Concurrency', count: 6 },
  { id: 'memory', label: 'Memory & Virtualization', count: 4 },
  { id: 'storage', label: 'Storage & File Systems', count: 2 },
];

export const OS_TOPICS = [
  {
    id: 1,
    title: 'Introduction to Operating Systems',
    category: 'foundations',
    categoryName: 'OS Foundations',
    moduleNumber: '01',
    description: 'Explore the fundamental concepts of operating systems, software layers, hardware interfaces, kernel modes, and system calls.',
    status: 'Interactive Guide',
    badgeType: 'foundation',
    duration: '25 min',
    difficulty: 'Beginner',
    keyConcepts: ['User vs Kernel Mode', 'Interrupt Driven Architecture', 'System Call Interface', 'Dual-Mode Operation'],
    interactiveDemoType: 'mode-switch',
    demoCode: `// User Mode -> Kernel Mode Switch via Trap Vector
int fd = open("/sys/kernel/debug", O_RDONLY);
// 1. Set EAX to sys_open system call number (0x05)
// 2. Execute Software Interrupt instruction: INT 0x80 or SYSCALL
// 3. Hardware switches CPU privilege ring from Ring 3 (User) to Ring 0 (Kernel)
// 4. Kernel validates address range and executes sys_open()`,
  },
  {
    id: 2,
    title: 'Computer System Architecture',
    category: 'foundations',
    categoryName: 'OS Foundations',
    moduleNumber: '02',
    description: 'Understand CPU registers, bus structures, memory hierarchies, Direct Memory Access (DMA), and multi-core symmetric multiprocessing (SMP).',
    status: 'Interactive 3D Pipeline',
    badgeType: 'architecture',
    duration: '35 min',
    difficulty: 'Intermediate',
    keyConcepts: ['Von Neumann Architecture', 'Bus Interconnects', 'DMA Controller', 'SMP & Cache Coherence'],
    interactiveDemoType: 'dma-transfer',
    demoCode: `// DMA Transfer Sequence Protocol
1. CPU configures DMA Controller (Source addr, Dest addr, Count)
2. CPU continues executing other threads (Non-blocking I/O)
3. DMA Controller transfers block from Disk Interface directly to RAM
4. DMA raises Hardware Interrupt (IRQ 14) to CPU when transfer completes`,
  },
  {
    id: 3,
    title: 'OS Structure',
    category: 'foundations',
    categoryName: 'OS Foundations',
    moduleNumber: '03',
    description: 'Analyze monolithic kernels, microkernels, layered design, dynamic loadable kernel modules (LKMs), and hybrid operating system designs.',
    status: 'Interactive Structural Map',
    badgeType: 'architecture',
    duration: '30 min',
    difficulty: 'Intermediate',
    keyConcepts: ['Monolithic vs Microkernel', 'IPC Overhead', 'Loadable Kernel Modules (LKM)', 'Virtual Machine Monitor'],
    interactiveDemoType: 'kernel-architecture',
    demoCode: `// Microkernel IPC Message Passing Example (Mach/MINIX style)
message_t msg;
msg.type = FILE_READ;
msg.param1 = file_descriptor;
send_ipc(FILE_SYSTEM_SERVER_PID, &msg);
receive_ipc(FILE_SYSTEM_SERVER_PID, &msg);`,
  },
  {
    id: 4,
    title: 'Introduction to Linux OS',
    category: 'linux',
    categoryName: 'Linux & CLI',
    moduleNumber: '04',
    description: 'Discover Linux kernel architecture, POSIX standards, shell execution loop, process trees, and the Linux Filesystem Hierarchy (FHS).',
    status: 'Interactive Terminal Simulator',
    badgeType: 'linux',
    duration: '20 min',
    difficulty: 'Beginner',
    keyConcepts: ['POSIX Standard', 'Linux Kernel Boot Sequence', 'Filesystem Hierarchy Standard (FHS)', 'Init Process (systemd)'],
    interactiveDemoType: 'terminal-demo',
    demoCommands: [
      { cmd: 'uname -a', desc: 'Display Linux kernel version & system architecture' },
      { cmd: 'pstree -p', desc: 'Inspect root PID 1 systemd process hierarchy tree' },
      { cmd: 'ls -la /proc', desc: 'Explore virtual kernel process filesystem' },
    ],
  },
  {
    id: 5,
    title: 'Basic Commands of Linux OS',
    category: 'linux',
    categoryName: 'Linux & CLI',
    moduleNumber: '05',
    description: 'Master core shell commands, I/O redirection, standard streams (stdin, stdout, stderr), piping, file permissions, and environment variables.',
    status: 'Live Terminal Playground',
    badgeType: 'linux',
    duration: '30 min',
    difficulty: 'Beginner',
    keyConcepts: ['Standard I/O Streams', 'Piping (|)', 'Chmod Octal Permissions', 'Environment Variables'],
    interactiveDemoType: 'terminal-playground',
    demoCommands: [
      { cmd: 'cat access.log | grep "404" | wc -l', desc: 'Count 404 errors via pipeline' },
      { cmd: 'chmod 755 script.sh', desc: 'Set Read-Write-Execute permissions' },
      { cmd: 'export PATH=$PATH:/custom/bin', desc: 'Update system environment path variable' },
    ],
  },
  {
    id: 6,
    title: 'Process Management',
    category: 'process',
    categoryName: 'Processes & Concurrency',
    moduleNumber: '06',
    description: 'Examine Process Control Blocks (PCB), state transitions (New, Ready, Running, Waiting, Terminated), process creation via fork(), and exec().',
    status: 'Interactive Lifecycle Visualizer',
    badgeType: 'simulation',
    route: '/learn/process-management',
    duration: '40 min',
    difficulty: 'Intermediate',
    keyConcepts: ['Process Control Block (PCB)', 'fork() & exec() System Calls', 'Context Switching', 'Orphan & Zombie Processes'],
    interactiveDemoType: 'pcb-visualizer',
    demoCode: `// C Process Creation via fork() and execvp()
pid_t pid = fork();
if (pid == 0) {
    // Child Process Context
    char *args[] = {"/bin/ls", "-l", NULL};
    execvp(args[0], args);
} else if (pid > 0) {
    // Parent Process Context
    int status;
    waitpid(pid, &status, 0); // Synchronize with child termination
}`,
  },
  {
    id: 7,
    title: 'Threads',
    category: 'process',
    categoryName: 'Processes & Concurrency',
    moduleNumber: '07',
    description: 'Differentiate processes and lightweight threads. Learn User-level threads vs Kernel-level threads, POSIX Pthreads API, and multi-threading models.',
    status: 'Interactive Thread Lab',
    badgeType: 'simulation',
    duration: '35 min',
    difficulty: 'Intermediate',
    keyConcepts: ['Shared Memory Address Space', 'User vs Kernel Threads', 'Pthreads Library', 'Thread Cancellation & Joining'],
    interactiveDemoType: 'pthreads-lab',
    demoCode: `#include <pthread.h>

void* worker_thread(void* arg) {
    int id = *(int*)arg;
    printf("Executing thread ID: %d\\n", id);
    return NULL;
}

pthread_t tid[4];
for (int i = 0; i < 4; i++) {
    pthread_create(&tid[i], NULL, worker_thread, &i);
}`,
  },
  {
    id: 8,
    title: 'CPU Scheduling',
    category: 'process',
    categoryName: 'Processes & Concurrency',
    moduleNumber: '08',
    description: 'Simulate CPU scheduling algorithms: First-Come First-Served (FCFS), Shortest Job First (SJF), Round Robin (RR), and Multi-Level Feedback Queue (MLFQ).',
    status: 'Interactive Gantt Simulator',
    badgeType: 'simulation',
    duration: '45 min',
    difficulty: 'Advanced',
    keyConcepts: ['Gantt Chart Generation', 'Turnaround & Waiting Time', 'Preemptive vs Non-Preemptive', 'Time Quantum Tuning'],
    interactiveDemoType: 'gantt-chart',
    demoCode: `// Round Robin CPU Scheduling Core Step
if (running_process.burst_remaining > TIME_QUANTUM) {
    running_process.burst_remaining -= TIME_QUANTUM;
    ready_queue.push(running_process); // Preempt and requeue
} else {
    total_time += running_process.burst_remaining;
    mark_completed(running_process);
}`,
  },
  {
    id: 9,
    title: 'Synchronization & Deadlocks',
    category: 'process',
    categoryName: 'Processes & Concurrency',
    moduleNumber: '09',
    description: 'Master critical sections, race conditions, atomic operations, hardware spinlocks, Mutexes, and Counting Semaphores with live interactive simulations.',
    status: 'Live 3D Simulation Suite',
    badgeType: 'featured',
    route: '/os/sync',
    duration: '50 min',
    difficulty: 'Advanced',
    keyConcepts: ['Critical Section Problem', 'Race Conditions', 'Peterson Algorithm', 'Counting & Binary Semaphores'],
    interactiveDemoType: 'sync-suite',
    demoCode: `// Semaphore Wait (P) and Signal (V) Operations
void sem_wait(Semaphore *s) {
    s->value--;
    if (s->value < 0) {
        add_to_queue(s->queue, current_process);
        block();
    }
}
void sem_signal(Semaphore *s) {
    s->value++;
    if (s->value <= 0) {
        Process *p = remove_from_queue(s->queue);
        wakeup(p);
    }
}`,
  },
  {
    id: 10,
    title: 'Classical Synchronization Problems',
    category: 'process',
    categoryName: 'Processes & Concurrency',
    moduleNumber: '10',
    description: 'Solve famous concurrency dilemmas: Producer-Consumer (Bounded Buffer), Readers-Writers Problem, and Dining Philosophers Problem.',
    status: 'Interactive Problem Solver',
    badgeType: 'simulation',
    duration: '45 min',
    difficulty: 'Advanced',
    keyConcepts: ['Bounded Buffer Sync', 'Readers-Writers Lock', 'Asymmetric Resource Allocation', 'Starvation Prevention'],
    interactiveDemoType: 'dining-philosophers',
    demoCode: `// Dining Philosophers Resource Ordering Solution
void take_chopsticks(int i) {
    int left = i;
    int right = (i + 1) % 5;
    // Always acquire lower numbered chopstick first to break circular wait condition
    int first = left < right ? left : right;
    int second = left < right ? right : left;
    sem_wait(&chopstick[first]);
    sem_wait(&chopstick[second]);
}`,
  },
  {
    id: 11,
    title: 'Deadlocks',
    category: 'process',
    categoryName: 'Processes & Concurrency',
    moduleNumber: '11',
    description: 'Understand the 4 Coffman conditions for deadlock, Resource Allocation Graphs (RAG), Banker Algorithm for Deadlock Avoidance, and Detection & Recovery.',
    status: 'Interactive Banker Lab',
    badgeType: 'simulation',
    duration: '40 min',
    difficulty: 'Advanced',
    keyConcepts: ['4 Coffman Conditions', 'Resource Allocation Graph', 'Bankers Algorithm Safety Test', 'Deadlock Recovery'],
    interactiveDemoType: 'banker-algorithm',
    demoCode: `// Banker's Algorithm Safety Vector Check
bool is_safe_state(int Available[], int Max[][R], int Allocation[][R], int Need[][R]) {
    int Work[R];
    bool Finish[P] = {false};
    // Search for process P[i] such that Finish[i] == false and Need[i] <= Work
    // Update Work = Work + Allocation[i] until all processes finish
}`,
  },
  {
    id: 12,
    title: 'Memory Management and Virtualization',
    category: 'memory',
    categoryName: 'Memory & Virtualization',
    moduleNumber: '12',
    description: 'Explore physical memory allocation, contiguous allocation strategies (First-Fit, Best-Fit, Worst-Fit), internal/external fragmentation, and compaction.',
    status: 'Interactive Allocator Visualizer',
    badgeType: 'simulation',
    duration: '35 min',
    difficulty: 'Intermediate',
    keyConcepts: ['Contiguous Memory Allocation', 'Internal vs External Fragmentation', 'Best-Fit / Worst-Fit Algorithms', 'Dynamic Relocation Registers'],
    interactiveDemoType: 'memory-allocation',
    demoCode: `// Memory Best-Fit Block Selection
MemoryBlock* find_best_fit(size_t request_size) {
    MemoryBlock* best = NULL;
    for (MemoryBlock* block = free_list; block != NULL; block = block->next) {
        if (block->size >= request_size) {
            if (!best || block->size < best->size) best = block;
        }
    }
    return best;
}`,
  },
  {
    id: 13,
    title: 'Paging and Segmentation',
    category: 'memory',
    categoryName: 'Memory & Virtualization',
    moduleNumber: '13',
    description: 'Master non-contiguous memory management: Page Tables, Logical to Physical Address Translation, Translation Lookaside Buffer (TLB), and Segmentation.',
    status: 'Interactive MMU Translator',
    badgeType: 'simulation',
    duration: '45 min',
    difficulty: 'Advanced',
    keyConcepts: ['Page Table Entry (PTE)', 'TLB Hit/Miss Ratio', 'Segment Table & Offset', 'Multi-Level Page Tables'],
    interactiveDemoType: 'mmu-translator',
    demoCode: `// MMU Address Translation (32-bit Paging, 4KB Page Size)
uint32_t virtual_address = 0x00401234;
uint32_t page_number = virtual_address >> 12; // 0x00401 (1025)
uint32_t offset = virtual_address & 0xFFF;    // 0x234 (564)

uint32_t frame_number = PageTable[page_number].frame_id; // e.g. 0x0A02
uint32_t physical_address = (frame_number << 12) | offset;`,
  },
  {
    id: 14,
    title: 'Virtual Memory',
    category: 'memory',
    categoryName: 'Memory & Virtualization',
    moduleNumber: '14',
    description: 'Study Demand Paging, Page Fault Handling interrupts, Working Set Model, Thrashing, and Page Replacement Algorithms (FIFO, LRU, Optimal, Clock algorithm).',
    status: 'Interactive Page Fault Lab',
    badgeType: 'simulation',
    duration: '45 min',
    difficulty: 'Advanced',
    keyConcepts: ['Demand Paging', 'Page Fault Trap Handler', 'Least Recently Used (LRU)', 'Thrashing & Working Set'],
    interactiveDemoType: 'lru-simulator',
    demoCode: `// LRU Page Replacement Cache Update
void access_page(int page_id) {
    if (page_in_frames(page_id)) {
        update_lru_timestamp(page_id);
    } else {
        trigger_page_fault();
        int victim_frame = find_oldest_timestamp_frame();
        evict_page(victim_frame);
        load_page_from_swap_disk(page_id, victim_frame);
    }
}`,
  },
  {
    id: 15,
    title: 'Virtualization Basics',
    category: 'memory',
    categoryName: 'Memory & Virtualization',
    moduleNumber: '15',
    description: 'Learn Hypervisor architectures (Type-1 Bare Metal vs Type-2 Hosted), hardware-assisted virtualization (Intel VT-x, AMD-V), and lightweight Docker containers.',
    status: 'Interactive Hypervisor Lab',
    badgeType: 'architecture',
    duration: '35 min',
    difficulty: 'Intermediate',
    keyConcepts: ['Type-1 vs Type-2 Hypervisors', 'Trap-and-Emulate', 'Hardware Assisted Virtualization', 'Containerization vs VM'],
    interactiveDemoType: 'virtualization-lab',
    demoCode: `// Container (Namespace & Cgroups) vs Hypervisor Isolation
// Linux Namespace setup for Container isolation:
clone(child_func, child_stack, CLONE_NEWPID | CLONE_NEWNET | CLONE_NEWNS, NULL);
// Cgroup resource control:
// echo "50000 100000" > /sys/fs/cgroup/cpu/my_container/cpu.cfs_quota_us`,
  },
  {
    id: 16,
    title: 'File Management System',
    category: 'storage',
    categoryName: 'Storage & File Systems',
    moduleNumber: '16',
    description: 'Understand file abstractions, directory structures (Tree-structured, Acyclic Graph), file allocation methods (Contiguous, Linked, Indexed/Inodes), and metadata.',
    status: 'Interactive Inode Explorer',
    badgeType: 'storage',
    duration: '30 min',
    difficulty: 'Intermediate',
    keyConcepts: ['Linux Inode Structure', 'Indexed Block Allocation', 'Directory Table Lookup', 'Hard Links vs Symbolic Links'],
    interactiveDemoType: 'inode-explorer',
    demoCode: `// Linux Ext4 Inode Layout Breakdown
struct ext4_inode {
    uint16_t i_mode;        // File type & access permissions
    uint32_t i_size;        // File size in bytes
    uint32_t i_blocks;      // Number of 512-byte blocks
    uint32_t i_block[15];   // 12 Direct blocks, 1 Single Indirect, 1 Double Indirect, 1 Triple Indirect
};`,
  },
  {
    id: 17,
    title: 'File System System-Calls',
    category: 'storage',
    categoryName: 'Storage & File Systems',
    moduleNumber: '17',
    description: 'Trace low-level POSIX file I/O system calls: open(), read(), write(), lseek(), close(), stat(), and file descriptor table mechanics in the kernel.',
    status: 'Interactive Syscall Debugger',
    badgeType: 'storage',
    duration: '35 min',
    difficulty: 'Intermediate',
    keyConcepts: ['File Descriptor Table', 'System Open File Table', 'In-Memory Inode Table', 'Atomic File Operations'],
    interactiveDemoType: 'syscall-debugger',
    demoCode: `int fd = open("log.txt", O_WRONLY | O_CREAT | O_APPEND, 0644);
if (fd < 0) { perror("open failed"); exit(1); }

char buffer[] = "System Zero Kernel Event\\n";
ssize_t bytes_written = write(fd, buffer, sizeof(buffer) - 1);
close(fd);`,
  },
  {
    id: 18,
    title: 'Secondary Storage & Disk Scheduling',
    category: 'storage',
    categoryName: 'Storage & File Systems',
    moduleNumber: '18',
    description: 'Simulate HDD disk arm movement algorithms: FCFS, SSTF (Shortest Seek Time First), SCAN (Elevator), C-SCAN, and modern NVMe SSD flash storage mechanics.',
    status: 'Interactive Disk Arm Simulator',
    badgeType: 'simulation',
    duration: '40 min',
    difficulty: 'Advanced',
    keyConcepts: ['Seek Time & Rotational Latency', 'SSTF Starvation Risk', 'SCAN / C-SCAN Elevator Algorithm', 'NVMe Flash Wear Leveling'],
    interactiveDemoType: 'disk-scheduling',
    demoCode: `// C-SCAN Disk Head Traversal (Track Requests: 98, 183, 37, 122, 14, 124, 65, 67)
// Head moves towards higher tracks to cylinder maximum (199), then jumps instantly back to track 0 without servicing on return loop`,
  },
  {
    id: 19,
    title: 'Linux File Management Commands',
    category: 'linux',
    categoryName: 'Linux & CLI',
    moduleNumber: '19',
    description: 'Master advance Linux terminal commands for disk management, file searching, compression, and inspection: find, grep, tar, df, du, dd, and rsync.',
    status: 'Live CLI Workbench',
    badgeType: 'linux',
    duration: '25 min',
    difficulty: 'Beginner',
    keyConcepts: ['Regex Search with Grep', 'Disk Space Utilization (df/du)', 'Tarball Archiving', 'Binary Disk Cloning (dd)'],
    interactiveDemoType: 'cli-workbench',
    demoCommands: [
      { cmd: 'find /var/log -type f -name "*.log" -mtime -7', desc: 'Find log files modified in the last 7 days' },
      { cmd: 'grep -E -r "ERROR|CRITICAL" /var/log/syslog', desc: 'Extended regex search for log errors' },
      { cmd: 'du -sh /var/www/*', desc: 'Inspect directory disk usage in human-readable units' },
      { cmd: 'tar -czvf archive.tar.gz /home/user/docs', desc: 'Compress directory into gzipped tarball' },
    ],
  },
];

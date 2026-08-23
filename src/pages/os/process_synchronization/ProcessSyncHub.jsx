import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Footer from '../../../components/shared/Footer';

export default function ProcessSyncHub() {
  const location = useLocation();

  useEffect(() => {
    const rawHash = location.hash || window.location.hash;
    if (rawHash) {
      const targetId = rawHash.replace('#', '');
      const executeScroll = () => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };


      requestAnimationFrame(executeScroll);
      const t1 = setTimeout(executeScroll, 60);
      const t2 = setTimeout(executeScroll, 180);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [location.hash, location.pathname, location.key]);

  return (
    <div className="theory-page-container">
      <article className="theory-article">
        <div></div>
        <header className="theory-article-header">
          <h1>Process Synchronization &amp; Concurrency</h1>
          <p className="theory-subtitle">
            An overview of concurrent execution, race conditions, synchronization primitives, and mutual exclusion mechanisms.
          </p>
        </header>

        {/* 1. Concurrency */}
        <section className="theory-section" aria-labelledby="concurrency">
          <h2 id="concurrency">1. Concurrency</h2>
          <p>
            <strong>Concurrency</strong> is the execution of multiple instruction sequences at the same time.
            In an operating system, this happens whenever several process threads are running in parallel &mdash;
            the CPU (or CPUs) interleaves or truly overlaps their execution instead of finishing one task
            completely before starting the next.
          </p>
          <p>
            It&apos;s easy to confuse concurrency with parallelism, but they answer different questions.
            Concurrency is about <em>structure</em>: can multiple tasks make progress during the same time
            window, even on a single core, by rapidly switching between them? Parallelism is about
            <em> hardware</em>: are tasks literally running at the same instant on different cores. A
            single-core machine can still be concurrent (juggling many threads) without ever being parallel.
          </p>
          <p>
            Concurrency is what makes modern computing feel responsive &mdash; your browser can download a
            file, render a page, and respond to your clicks all &ldquo;at once,&rdquo; because the OS is
            rapidly switching the CPU&apos;s attention between the threads doing each job. But this power
            comes with a cost: whenever multiple threads touch the same shared data, we open the door to
            <strong> race conditions</strong>, which is exactly why process synchronization exists as a field
            of study &mdash; explored in the sections below.
          </p>
          <p className="theory-conclusion">
            <strong>Conclusion:</strong> Concurrency lets an OS make progress on many things at once, but the
            moment those &ldquo;things&rdquo; share data, correctness stops being automatic &mdash; it has to
            be engineered.
          </p>
        </section>

        {/* 2. Threads & Thread Scheduling */}
        <section className="theory-section" aria-labelledby="threads-and-thread-scheduling">
          <h2 id="threads-and-thread-scheduling">2. Threads &amp; Thread Scheduling</h2>
          <p>
            A <strong>thread</strong> is a single sequence stream within a process &mdash; an independent
            path of execution. Threads are often called <em>light-weight processes</em> because, unlike full
            processes, they share the same memory address space and resources of the parent process, which
            makes them much cheaper to create and switch between.
          </p>
          <p>
            Threads are used to achieve parallelism by dividing a process&apos;s work into independent paths
            of execution. A classic example is your web browser: each open tab can be its own thread (or
            group of threads). Another everyday example is a text editor &mdash; while you type, spell-checking,
            text formatting, and auto-saving are all happening concurrently, each handled by a separate thread.
          </p>
          <h3>Thread Scheduling</h3>
          <p>
            Threads are scheduled for execution based on their priority. Even though threads run within the
            same process, the operating system still allocates each of them processor time slices, deciding
            which thread gets the CPU and for how long.
          </p>
          <h3>Context Switching Between Threads</h3>
          <ul>
            <li>The OS saves the current state of a thread and switches to another thread of the same process.</li>
            <li>
              Unlike a full process switch, this does <strong>not</strong> involve switching the memory address
              space &mdash; but it does still save/restore the program counter, registers, and stack.
            </li>
            <li>Because less state needs to change, thread switching is noticeably faster than process switching.</li>
            <li>The CPU&apos;s cache state is preserved across the switch, since the memory space doesn&apos;t change.</li>
          </ul>
          <h3>How Does Each Thread Get Access to the CPU?</h3>
          <p>
            Every thread has its own program counter. Based on the thread scheduling algorithm in use, the OS
            decides which thread runs next, fetches the instructions corresponding to that thread&apos;s
            program counter, and executes them. Context switches here can be triggered either by I/O waits or
            by the expiry of a thread&apos;s time quantum (TQ), just as with processes.
          </p>
          <p>
            To manage all of this bookkeeping, the OS maintains a <strong>Thread Control Block (TCB)</strong>
            for each thread &mdash; the thread-level equivalent of a Process Control Block (PCB) &mdash; which
            stores the state needed to pause and resume that thread correctly.
          </p>
          <h3>Does Multi-threading Help on a Single-CPU System?</h3>
          <p>
            <strong>No &mdash; never.</strong> On a single CPU, only one thread can ever truly execute at a
            time. Since two threads still have to context switch for that one CPU, there is no genuine
            execution gain; multi-threading&apos;s benefits (below) come from responsiveness and structure, not
            from raw single-core speed-up.
          </p>
          <h3>Benefits of Multi-threading</h3>
          <ul>
            <li><strong>Responsiveness:</strong> an application can keep responding to input even while other threads are busy with long-running work.</li>
            <li><strong>Resource sharing:</strong> threads of the same process share memory and resources efficiently, with no need to duplicate them.</li>
            <li>
              <strong>Economy:</strong> creating and context-switching threads is far cheaper than doing the
              same for full processes, since allocating memory and resources for a brand-new process is costly
              &mdash; it is more economical to simply divide a task into threads within the same process.
            </li>
            <li>Threads allow an application to make far greater and more efficient use of multiprocessor architectures.</li>
          </ul>
          <p className="theory-conclusion">
            <strong>Conclusion:</strong> Threads give processes a cheap, fast way to do many things
            &ldquo;at once,&rdquo; but that speed comes precisely from sharing memory &mdash; the same sharing
            that creates the critical section problem discussed next.
          </p>
        </section>

        {/* 3. The Critical Section Problem & Race Conditions */}
        <section className="theory-section" aria-labelledby="the-critical-section-problem-and-race-conditions">
          <h2 id="the-critical-section-problem-and-race-conditions">3. The Critical Section Problem &amp; Race Conditions</h2>
          <p>
            Process synchronization techniques play a key role in maintaining the consistency of shared data.
            Whenever multiple threads or processes are allowed to run concurrently, we need a disciplined way
            to control how they touch data that more than one of them can see.
          </p>
          <h3>What Is a Critical Section?</h3>
          <p>
            The <strong>critical section (C.S.)</strong> is the segment of code where processes or threads
            access shared resources &mdash; such as common variables or files &mdash; and perform write
            operations on them. Because processes and threads execute concurrently, any process can be
            interrupted mid-execution, potentially right in the middle of updating shared data.
          </p>
          <h3>The Race Condition</h3>
          <p>
            The major scheduling issue this creates is the <strong>race condition</strong>: it occurs when two
            or more threads can access shared data and try to change it at the same time. Because the thread
            scheduling algorithm can swap between threads at any moment, you don&apos;t know in advance the
            exact order in which the threads will access the shared data. The final result therefore depends on
            the scheduling order &mdash; the threads are effectively &ldquo;racing&rdquo; each other to
            read/modify the data, and whoever the scheduler favors determines (unpredictably) the outcome.
          </p>
          <p>
            A natural question is: <em>can we just use a simple flag variable to prevent this?</em> The answer
            is <strong>no</strong> &mdash; a plain flag check-then-set is itself two separate operations, so a
            thread can be interrupted between checking the flag and setting it, recreating the very race
            condition it was meant to prevent.
          </p>
          <h3>Solutions to the Race Condition</h3>
          <ul>
            <li>
              <strong>Atomic operations:</strong> make the critical section execute as a single, uninterruptible
              step &mdash; ideally within one CPU cycle &mdash; so no other thread can interleave with it.
            </li>
            <li><strong>Mutual exclusion using locks (mutexes):</strong> allow only one thread into the critical section at a time.</li>
            <li><strong>Semaphores:</strong> a more general signalling mechanism that can also control access to a resource with several available instances.</li>
          </ul>
          <p>
            <strong>Peterson&apos;s solution</strong> is another classic approach that can avoid the race
            condition purely in software, but it only holds good for exactly two processes/threads &mdash; it
            is covered in detail in the next section.
          </p>
          <div className="theory-action-box">
            <Link to="/os/sync/race-condition" className="theory-visualize-btn">
              <span>Visualize Race Condition Concept</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="theory-conclusion">
            <strong>Conclusion:</strong> Any code that reads-then-writes shared data is a critical section in
            disguise, and any interleaving of two such sections is a potential race condition &mdash; the rest
            of this page is about the tools (Peterson&apos;s solution, mutexes, semaphores, and condition
            variables) used to make critical sections safe.
          </p>
        </section>

        {/* 4. Peterson's Solution */}
        <section className="theory-section" aria-labelledby="petersons-solution">
          <h2 id="petersons-solution">4. Peterson&apos;s Solution</h2>
          <p>
            Peterson&apos;s solution is a classic software-only algorithm for achieving mutual exclusion between
            exactly two processes or threads, without needing any special hardware instructions. It works by
            combining two shared variables:
          </p>
          <ul>
            <li><code>flag[2]</code> &mdash; a boolean per process, indicating &ldquo;I want to enter the critical section.&rdquo;</li>
            <li><code>turn</code> &mdash; an integer that records whose turn it is to enter when both processes want in.</li>
          </ul>
          <p>
            Before entering its critical section, a process sets its own <code>flag</code> to true and then
            politely sets <code>turn</code> to the <em>other</em> process, effectively saying &ldquo;I&apos;m
            ready, but you can go first if you also want to.&rdquo; It then waits only while the other process
            both wants in <em>and</em> it is currently the other process&apos;s turn. This clever combination of
            &ldquo;politeness&rdquo; and &ldquo;turn-taking&rdquo; guarantees three properties simultaneously:
          </p>
          <ul>
            <li><strong>Mutual exclusion:</strong> both processes can never be in the critical section at the same time.</li>
            <li><strong>Progress:</strong> if only one process wants to enter, it isn&apos;t blocked by the other.</li>
            <li><strong>Bounded waiting:</strong> a process never waits forever, since <code>turn</code> alternates.</li>
          </ul>
          <p>
            The catch is that Peterson&apos;s solution holds good <strong>only for two processes/threads</strong>.
            Extending it correctly to more participants is possible but far more complex, which is why real
            operating systems and applications typically reach for hardware-assisted primitives like mutex
            locks and semaphores (covered next) instead of scaling this approach up.
          </p>
          <div className="theory-action-box">
            <Link to="/os/sync/peterson" className="theory-visualize-btn">
              <span>Visualize Peterson&apos;s Solution Concept</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="theory-conclusion">
            <strong>Conclusion:</strong> Peterson&apos;s solution proves mutual exclusion is achievable with
            plain shared variables and no special instructions &mdash; but its two-process limit is exactly why
            practical systems generalize the idea into locks and semaphores.
          </p>
        </section>

        {/* 5. Mutex Locks */}
        <section className="theory-section" aria-labelledby="mutex-locks">
          <h2 id="mutex-locks">5. Mutex Locks</h2>
          <p>
            A <strong>mutex</strong> (short for &ldquo;mutual exclusion&rdquo;) is a lock that can be used to
            implement mutual exclusion and avoid race conditions by allowing only one thread or process to
            access the critical section at a time. A thread must <em>acquire</em> the lock before entering the
            critical section, and must <em>release</em> it on the way out, so that exactly one thread holds the
            lock at any moment.
          </p>
          <p>
            Simple and effective as this sounds, mutex locks come with real trade-offs that every systems
            programmer needs to be aware of:
          </p>
          <ul>
            <li>
              <strong>Contention:</strong> while one thread holds the lock, every other thread wanting to enter
              is left <em>busy-waiting</em>. Worse, if the thread that acquired the lock dies (or hangs) before
              releasing it, every other waiting thread can be left in infinite waiting.
            </li>
            <li><strong>Deadlocks:</strong> if two or more threads end up each waiting on a lock the other holds, none of them can ever proceed.</li>
            <li><strong>Debugging difficulty:</strong> bugs caused by locking are timing-dependent, making them notoriously hard to reproduce and fix.</li>
            <li><strong>Starvation:</strong> high-priority threads can end up waiting indefinitely if lower-priority threads keep acquiring the lock first.</li>
          </ul>
          <p>
            These downsides are exactly what motivate the next two primitives &mdash; semaphores generalize
            locking to allow more than one thread in at a time when there are multiple resource instances, and
            condition variables solve the busy-waiting problem directly by letting a thread sleep instead of
            spin.
          </p>
          <div className="theory-action-box">
            <Link to="/os/sync/mutex" className="theory-visualize-btn">
              <span>Visualize Mutex Locks Concept</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="theory-conclusion">
            <strong>Conclusion:</strong> A mutex is the simplest correct tool for &ldquo;only one at a time,&rdquo;
            but its busy-waiting and single-holder design are precisely the limitations semaphores and
            condition variables are built to overcome.
          </p>
        </section>

        {/* 6. Semaphores (Counting & Binary) */}
        <section className="theory-section" aria-labelledby="semaphores">
          <h2 id="semaphores">6. Semaphores (Counting &amp; Binary)</h2>
          <p>
            A <strong>semaphore</strong> is a synchronization method built around an integer that represents
            the number of available resource instances. Unlike a mutex, which allows only one thread to access
            a single shared resource at a time, a semaphore allows multiple program threads to access a
            <em> finite pool</em> of resource instances &mdash; several threads can be executing inside the
            critical section concurrently, as long as the count allows it.
          </p>
          <h3>Binary vs. Counting Semaphores</h3>
          <ul>
            <li>
              <strong>Binary semaphore:</strong> its value can only be 0 or 1, making it functionally
              equivalent to a mutex lock.
            </li>
            <li>
              <strong>Counting semaphore:</strong> its value can range over an unrestricted domain, and it is
              used to control access to a resource that has a finite number of interchangeable instances (for
              example, a pool of database connections or printer ports).
            </li>
          </ul>
          <h3>Avoiding Busy-Waiting: Blocking Instead of Spinning</h3>
          <p>
            A naive semaphore implementation would have a thread spin in a loop checking the value &mdash;
            classic busy-waiting. To overcome this, the <code>wait()</code> and <code>signal()</code>
            operations are redefined so that when a process executes <code>wait()</code> and finds the
            semaphore value is not positive, it doesn&apos;t spin: instead it <strong>blocks</strong> itself.
            The <code>block()</code> operation places the process into a waiting queue associated with that
            semaphore and switches its state to <em>Waiting</em>. Control then transfers to the CPU scheduler,
            which picks another process to run &mdash; so the CPU is never wasted on a thread that has nothing
            useful to do.
          </p>
          <p>
            A process blocked on semaphore <code>S</code> is restarted only when some other process executes a
            <code>signal()</code> operation on that same semaphore. This triggers a <code>wakeup()</code>
            operation, which moves the blocked process from the <em>Waiting</em> state to the <em>Ready</em>
            state and places it back in the ready queue, where it can be scheduled to run again.
          </p>
          <div className="theory-action-box">
            <Link to="/os/sync/semaphore" className="theory-visualize-btn">
              <span>Visualize Semaphores Concept</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <p className="theory-conclusion">
            <strong>Conclusion:</strong> Semaphores generalize the mutex from &ldquo;one thread at a time&rdquo;
            to &ldquo;N threads at a time,&rdquo; and their block/wakeup design solves the wasted-CPU problem of
            busy-waiting &mdash; the same underlying idea that condition variables build on next.
          </p>
        </section>

        {/* 7. Conditional Variables */}
        <section className="theory-section" aria-labelledby="conditional-variables">
          <h2 id="conditional-variables">7. Conditional Variables</h2>
          <p>
            A <strong>condition variable</strong> is a synchronization primitive that lets a thread wait until
            a certain condition occurs, without wasting CPU cycles checking it repeatedly. It is never used on
            its own &mdash; it always works together with a lock.
          </p>
          <p>
            A thread can enter the wait state only after it has already acquired the associated lock. When the
            thread enters the wait state, it <strong>releases the lock</strong> and waits until another thread
            notifies it that the event it&apos;s waiting for has occurred. Once the waiting thread is woken up
            and re-enters the running state, it immediately re-acquires the lock and resumes execution from
            where it left off &mdash; all of this handled safely by the condition variable itself, so the
            programmer never has to manually juggle release/re-acquire timing.
          </p>
          <p>
            Why use a condition variable at all? The core reason is exactly the same motivation behind
            semaphore blocking: <strong>to avoid busy waiting.</strong> Instead of a thread looping and
            constantly re-checking &ldquo;is the condition true yet?&rdquo;, it simply sleeps until it is
            explicitly woken up. A useful side effect of this design is that <strong>contention isn&apos;t an
            issue here</strong> &mdash; because the waiting thread has released the lock while sleeping, it
            isn&apos;t competing for that lock with the very thread that needs to make progress and eventually
            wake it.
          </p>
          <p className="theory-conclusion">
            <strong>Conclusion:</strong> Condition variables complete the toolkit: mutexes give you exclusive
            access, semaphores extend that to a countable pool of resources, and condition variables let
            threads wait efficiently for a specific event instead of spinning &mdash; together, they are how
            real operating systems and multi-threaded applications keep concurrent code both fast and correct.
          </p>
        </section>

        {/* 8. Overall Conclusion */}
        <section className="theory-section" aria-labelledby="conclusion">
          <h2 id="conclusion">8. Putting It All Together</h2>
          <p>
            Concurrency gives an operating system the ability to make progress on many threads at once, and
            threads give processes a cheap, fast way to share that work. But every piece of data those threads
            share is a potential critical section, and every unguarded critical section is a potential race
            condition.
          </p>
          <p>
            The tools on this page form a natural progression for solving that problem:
          </p>
          <ul>
            <li><strong>Peterson&apos;s solution</strong> shows mutual exclusion is achievable in pure software, for two processes.</li>
            <li><strong>Mutex locks</strong> generalize that to any number of threads, at the cost of busy-waiting and single-holder access.</li>
            <li><strong>Semaphores</strong> generalize the mutex further, allowing N threads into a resource pool and replacing busy-waiting with block/wakeup.</li>
            <li><strong>Condition variables</strong> let a thread sleep efficiently until a specific event happens, working hand-in-hand with a lock.</li>
          </ul>
          <p>
            Choosing between them in practice comes down to the problem shape: reach for a mutex when exactly
            one thread may touch a resource at a time, a semaphore when a fixed number of interchangeable
            resource instances exist, and a condition variable whenever a thread needs to wait on a specific
            condition &mdash; such as &ldquo;the queue is no longer empty&rdquo; &mdash; rather than on a raw
            count.
          </p>
          <p className="theory-conclusion">
            <strong>Key takeaway:</strong> Every synchronization primitive on this page exists to answer the
            same question &mdash; how do we let threads share data and resources without letting the
            unpredictability of scheduling corrupt the result? Understanding the critical section problem is
            the foundation; everything else is a technique for solving it safely and efficiently.
          </p>
        </section>
      </article>
      <Footer />
    </div>
  );
}
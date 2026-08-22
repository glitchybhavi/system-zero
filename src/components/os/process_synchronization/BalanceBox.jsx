export default function BalanceBox({ balance }) {
  return (
    <article className="vault-chamber glass-panel" aria-label="Shared Memory Vault">
      <header className="vault-title">Shared Vault</header>
      <output className="vault-balance" aria-live="polite">₹{balance}</output>
    </article>
  );
}

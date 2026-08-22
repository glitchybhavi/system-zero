export default function ExecutionPath({ gate0Open, gate1Open }) {
  return (
    <figure className="execution-pathway track-system" role="presentation" aria-hidden="true">
      <div className="pathway-channel pathway-p0 rail rail-p0" />
      <div className="pathway-channel pathway-p1 rail rail-p1" />
      <div className="pathway-channel pathway-merge rail rail-merge" />
      
      <div className="junction-connector connector-p0 rail-conn-0" />
      <div className="junction-connector connector-p1 rail-conn-1" />
      
      <div className={`entry-gate gate gate-p0 ${gate0Open ? 'open' : ''}`} />
      <div className={`entry-gate gate gate-p1 ${gate1Open ? 'open' : ''}`} />
    </figure>
  );
}

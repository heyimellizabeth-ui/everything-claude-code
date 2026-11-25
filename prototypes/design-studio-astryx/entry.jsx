import { createRoot } from 'react-dom/client';
import { Button } from '@astryxdesign/core/Button';

function Spike() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif', fontSize: 'var(--font-size-base)' }}>
      <h1 style={{ fontSize: 20 }}>Design Studio on Astryx: spike</h1>
      <p>One Astryx Button with the Studio theme, bundled into one file.</p>
      <Button variant="primary" onClick={() => alert('ok')}>Build with Claude</Button>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Spike />);

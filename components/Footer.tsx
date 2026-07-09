export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">Kai<span>Vel</span></div>
          <p className="footer-text">
            © 2025 KaiVel · Data dari Shinigami ID · Unofficial, non-commercial
          </p>
          <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
            <a href="/explore" className="footer-text" style={{ transition: 'color var(--dur)' }}>Explore</a>
            <a href="/auth/register" className="footer-text" style={{ transition: 'color var(--dur)' }}>Daftar</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

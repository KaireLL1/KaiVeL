export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-logo">Kai<span>Vel</span></div>
          <p className="footer-text">
            © 2025 KaiVel · Data dari Shinigami ID · Unofficial, non-commercial
          </p>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-2)' }}>
            <a href="/explore" style={{ transition: 'color var(--dur)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray-2)')}>Explore</a>
            <a href="/auth/register" style={{ transition: 'color var(--dur)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--white)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--gray-2)')}>Daftar</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

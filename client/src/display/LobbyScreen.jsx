export default function LobbyScreen() {
  return (
    <div className="screen screen--blue" style={{ alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🇺🇦</div>
        <h1 style={{ marginBottom: 12 }}>Як я цього не знав?</h1>
        <p style={{ opacity: 0.7, fontWeight: 600, fontSize: '1.1rem' }}>
          Очікуємо на початок гри...
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, opacity: 0.5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: 'white',
            animation: `pulse 1.4s ${i * 0.2}s ease-in-out infinite`
          }} />
        ))}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

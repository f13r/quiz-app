export default function LobbyScreen() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4vh',
      background: '#0F2260',
      color: 'white',
      fontFamily: 'Nunito, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 'clamp(3rem, 10vh, 10rem)', marginBottom: '2vh' }}>🇺🇦</div>
        <h1 style={{ fontSize: 'clamp(2rem, 7vh, 7rem)', fontWeight: 900, marginBottom: '2vh', lineHeight: 1.1 }}>
          Як я цього не знав?
        </h1>
        <p style={{ opacity: 0.7, fontWeight: 600, fontSize: 'clamp(1rem, 2.8vh, 2.5rem)' }}>
          Очікуємо на початок гри...
        </p>
      </div>
      <div style={{ display: 'flex', gap: '2vw', opacity: 0.5 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 'clamp(10px, 1.8vh, 22px)',
            height: 'clamp(10px, 1.8vh, 22px)',
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

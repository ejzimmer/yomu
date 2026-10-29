const SPARK_ANGLES = Array.from({ length: 18 }, (_, i) => i * 20)

const BURSTS = [
  { id: 1, x: 110, y: 100, radius: 74, colour: 'gold', delay: 0 },
  { id: 2, x: 540, y: 90, radius: 84, colour: 'pink', delay: 0.6 },
  { id: 3, x: 420, y: 190, radius: 52, colour: 'white', delay: 1.2 },
  { id: 4, x: 200, y: 210, radius: 60, colour: 'pink', delay: 1.7 },
  { id: 5, x: 590, y: 240, radius: 48, colour: 'gold', delay: 2.3 },
  { id: 6, x: 320, y: 70, radius: 66, colour: 'gold', delay: 2.8 },
  { id: 7, x: 60, y: 250, radius: 44, colour: 'white', delay: 3.1 },
]

export function Fireworks() {
  return (
    <g className="fireworks">
      {BURSTS.map((burst) => (
        <g key={burst.id} transform={`translate(${burst.x} ${burst.y})`}>
          <g className={`burst ${burst.colour}`} style={{ animationDelay: `${burst.delay}s` }}>
            {SPARK_ANGLES.map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                <line className="trail" x1="0" y1={-burst.radius * 0.45} x2="0" y2={-burst.radius * 0.9} />
                <circle className="spark" cx="0" cy={-burst.radius} r="2.6" />
                <circle className="spark" cx="0" cy={-burst.radius * 0.6} r="1.8" transform="rotate(10)" />
              </g>
            ))}
          </g>
        </g>
      ))}
    </g>
  )
}

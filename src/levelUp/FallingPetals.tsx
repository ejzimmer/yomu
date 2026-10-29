const PETALS = [
  { id: 1, x: 60, delay: 0, duration: 9 },
  { id: 2, x: 150, delay: 3.5, duration: 11 },
  { id: 3, x: 250, delay: 1.2, duration: 8 },
  { id: 4, x: 330, delay: 5, duration: 10 },
  { id: 5, x: 420, delay: 2.4, duration: 9.5 },
  { id: 6, x: 500, delay: 6.2, duration: 8.5 },
  { id: 7, x: 580, delay: 0.8, duration: 10.5 },
  { id: 8, x: 290, delay: 7.4, duration: 9 },
]

export function FallingPetals() {
  return (
    <g className="falling-petals">
      {PETALS.map((petal) => (
        <g key={petal.id} transform={`translate(${petal.x} 0)`}>
          <ellipse
            className="falling-petal"
            rx="3"
            ry="4.4"
            style={{ animationDelay: `${petal.delay}s`, animationDuration: `${petal.duration}s` }}
          />
        </g>
      ))}
    </g>
  )
}

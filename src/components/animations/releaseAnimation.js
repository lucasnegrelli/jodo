'use client';
import { useState, useEffect } from 'react';
import { useRive } from '@rive-app/react-canvas';

export default function ReleaseAnimation() {
  const [height, setHeight] = useState(500);
  const { rive, RiveComponent } = useRive({
    src: '/animations/lancamento.riv',
    stateMachines: 'Lançamento',
    autoplay: true,
  });

  useEffect(() => {
    if (rive) {
      setHeight(100); // Ajustando a altura após a animação ser carregada
    }
  }, [rive]);

  return (
    <div>
      <div
        style={{
          width: '350px',
          height: `${height}px`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <RiveComponent style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
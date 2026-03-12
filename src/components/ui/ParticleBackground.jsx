'use client'

import { memo, useCallback, useState, useEffect } from 'react'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

const getParticleConfig = (variant) => {
  const configs = {
    auth: {
      particles: {
        number: { value: 80 },
        color: { value: ['#6B21A8', '#6B21A8', '#6B21A8', '#6B21A8', '#6B21A8', '#6B21A8', '#6B21A8', '#ffffff', '#ffffff', '#ffffff'] },
        shape: { type: 'circle' },
        opacity: { value: { min: 0.2, max: 0.6 } },
        size: { value: { min: 1.5, max: 3.5 } },
        move: {
          enable: true,
          speed: 0.6,
          direction: 'none',
          random: true,
          straight: false,
          outModes: 'out',
        },
        links: {
          enable: true,
          color: '#6B21A8',
          opacity: 0.15,
          distance: 130,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          onClick: { enable: true, mode: 'push' },
        },
        modes: {
          repulse: { distance: 100, duration: 0.4 },
          push: { quantity: 2 },
        },
      },
    },
    hero: {
      particles: {
        number: { value: 50 },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: { min: 0.1, max: 0.3 } },
        size: { value: { min: 1, max: 2.5 } },
        move: {
          enable: true,
          speed: 0.4,
          direction: 'top',
          straight: false,
          outModes: 'out',
        },
        links: { enable: false },
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
        },
      },
    },
    subtle: {
      particles: {
        number: { value: 40 },
        color: { value: '#6B21A8' },
        shape: { type: 'circle' },
        opacity: { value: { min: 0.08, max: 0.2 } },
        size: { value: { min: 2, max: 4 } },
        move: {
          enable: true,
          speed: 0.3,
          direction: 'none',
          random: true,
          straight: false,
          outModes: 'out',
        },
        links: {
          enable: true,
          color: '#6B21A8',
          opacity: 0.08,
          distance: 100,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'bubble' },
          onClick: { enable: false },
        },
        modes: {
          bubble: { distance: 100, size: 6, duration: 0.4, opacity: 0.3 },
        },
      },
    },
  }

  return {
    fullScreen: { enable: false },
    background: { color: 'transparent' },
    fpsLimit: 60,
    detectRetina: true,
    ...configs[variant] || configs.subtle,
  }
}

function ParticleBackground({ variant = 'auth' }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine)
    setIsLoaded(true)
  }, [])

  if (!isClient) return null

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Particles
        id={`particles-${variant}`}
        init={particlesInit}
        options={getParticleConfig(variant)}
        className={`w-full h-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

export default memo(ParticleBackground)


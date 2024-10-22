'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

type FoodType = {
  name: string
  emoji: string
  healthEffect: number
  happinessEffect: number
  experiencePoints: number
}

const foodTypes: FoodType[] = [
  { name: 'バッテリー', emoji: '🔋', healthEffect: 10, happinessEffect: 10, experiencePoints: 50 },
  { name: 'ラベル', emoji: '🧻', healthEffect: 20, happinessEffect: 15, experiencePoints: 10 },
]

const LEVEL_THRESHOLD = 100
const GAME_OVER_DELAY = 5000 // 5 seconds

export function PetAppComponent() {
  const [petImage, setPetImage] = useState<string | null>(null)
  const [petName, setPetName] = useState<string>('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [newPetName, setNewPetName] = useState('')
  const [petPosition, setPetPosition] = useState({ x: 50, y: 50 })
  const [health, setHealth] = useState(100)
  const [happiness, setHappiness] = useState(100)
  const [showFood, setShowFood] = useState(false)
  const [foodPosition, setFoodPosition] = useState({ x: 0, y: 100 })
  const [selectedFood, setSelectedFood] = useState<FoodType>(foodTypes[0])
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [healthZeroTime, setHealthZeroTime] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPetImage(e.target?.result as string)
        const name = prompt('What would you like to name your pet?')
        setPetName(name || 'Unnamed Pet')
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (isGameOver) return

    const moveInterval = setInterval(() => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        setPetPosition({
          x: Math.random() * (clientWidth - 100),
          y: Math.random() * (clientHeight - 100),
        })
      }
    }, health > 50 && happiness > 50 ? 1000 : 2000)

    const statusDecreaseInterval = setInterval(() => {
      setHealth((prev) => Math.max(0, prev - 1))
      setHappiness((prev) => Math.max(0, prev - 1))
    }, 5000)

    return () => {
      clearInterval(moveInterval)
      clearInterval(statusDecreaseInterval)
    }
  }, [health, happiness, isGameOver])

  useEffect(() => {
    if (experience >= LEVEL_THRESHOLD) {
      setLevel((prevLevel) => prevLevel + 1)
      setExperience((prevExp) => prevExp - LEVEL_THRESHOLD)
    }
  }, [experience])

  useEffect(() => {
    if (health === 0) {
      if (healthZeroTime === null) {
        setHealthZeroTime(Date.now())
      } else if (Date.now() - healthZeroTime >= GAME_OVER_DELAY) {
        setIsGameOver(true)
      }
    } else {
      setHealthZeroTime(null)
    }
  }, [health, healthZeroTime])

  const feedPet = () => {
    if (isGameOver) return
    setShowFood(true)
    setFoodPosition({ x: petPosition.x, y: petPosition.y + 50 })
    setTimeout(() => {
      setShowFood(false)
      setHealth((prev) => Math.min(100, prev + selectedFood.healthEffect))
      setHappiness((prev) => Math.min(100, prev + selectedFood.happinessEffect))
      setExperience((prev) => prev + selectedFood.experiencePoints)
    }, 2000)
  }

  const petPet = () => {
    if (isGameOver) return
    setHappiness((prev) => Math.min(100, prev + 5))
    setExperience((prev) => prev + 2)
  }

  const getEmoji = () => {
    if (isGameOver) return '💀'
    if (health < 30 || happiness < 30) return '😢'
    if (health > 70 && happiness > 70) return '😊'
    return '😐'
  }

  const getPetSize = () => {
    const baseSize = 64
    const growthFactor = 1 + (level - 1) * 0.15
    return baseSize * growthFactor
  }

  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPetName.trim()) {
      setPetName(newPetName.trim())
      setNewPetName('')
      setIsEditingName(false)
    }
  }

  const resetGame = () => {
    setPetImage(null)
    setPetName('')
    setHealth(100)
    setHappiness(100)
    setLevel(1)
    setExperience(0)
    setIsGameOver(false)
    setHealthZeroTime(null)
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-green-100" ref={containerRef}>
      {petImage ? (
        <motion.div
          className="absolute cursor-pointer"
          animate={petPosition}
          transition={{ type: 'spring', stiffness: 100 }}
          onClick={petPet}
        >
          <div className="relative p-2">
            <Image
              src={petImage}
              alt="Pet"
              layout="responsive"
              width={500}
              height={300}
              objectFit="cover"
              className="object-cover rounded-full"
              style={{ width: `${getPetSize()}px`, height: `${getPetSize()}px` }}
            />
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
              {getEmoji()}
            </span>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      )}
      {showFood && (
        <motion.div
          className="absolute text-2xl"
          initial={{ x: 0, y: containerRef.current?.clientHeight ?? 0 }}
          animate={foodPosition}
          transition={{ duration: 1 }}
        >
          {selectedFood.emoji}
        </motion.div>
      )}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-md">
        {isEditingName ? (
          <form onSubmit={handleNameChange} className="mb-2">
            <input
              type="text"
              value={newPetName}
              onChange={(e) => setNewPetName(e.target.value)}
              className="border rounded px-2 py-1 mr-2"
              placeholder="Enter new name"
            />
            <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
              Save
            </button>
          </form>
        ) : (
          <div className="mb-2 flex items-center">
            <span className="text-xl font-bold mr-2">{petName}</span>
            <button
              onClick={() => setIsEditingName(true)}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm"
            >
              Edit
            </button>
          </div>
        )}
        <div className="mb-2">Level: {level}</div>
        <div className="mb-2">Experience: {experience}/{LEVEL_THRESHOLD}</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{ width: `${(experience / LEVEL_THRESHOLD) * 100}%` }}
          ></div>
        </div>
        <div className="mb-2">Health: {health}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${health}%` }}></div>
        </div>
        <div className="mb-2">Happiness: {happiness}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${happiness}%` }}></div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col items-end">
        <div className="mb-2">
          {foodTypes.map((food) => (
            <button
              key={food.name}
              className={`mr-2 px-4 py-2 rounded ${
                selectedFood.name === food.name ? 'bg-yellow-500' : 'bg-yellow-300'
              }`}
              onClick={() => setSelectedFood(food)}
              disabled={isGameOver}
            >
              {food.emoji} {food.name}
            </button>
          ))}
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={feedPet}
          disabled={isGameOver}
        >
          Feed {petName}
        </button>
      </div>
      {isGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            <p className="mb-4">{petName} has passed away. They lived for {level} levels.</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={resetGame}
            >
              Start New Game
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

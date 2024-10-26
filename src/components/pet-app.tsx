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
  { name: 'チョコ', emoji: '🍫', healthEffect: 5, happinessEffect: 0, experiencePoints: 20 },
  { name: 'クッキー', emoji: '🍪', healthEffect: 3, happinessEffect: 0, experiencePoints: 10 },
]

const specialCake: FoodType = {
  name: 'ケーキ',
  emoji: '🎂',
  healthEffect: 20,
  happinessEffect: 20,
  experiencePoints: 100
}

const LEVEL_THRESHOLD = 100

export default function PetApp() {
  const [petImage, setPetImage] = useState<string | null>(null)
  const [petName, setPetName] = useState<string>('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [newPetName, setNewPetName] = useState('')
  const [petPosition, setPetPosition] = useState({ x: 50, y: 50 })
  const [health, setHealth] = useState(10)
  const [happiness, setHappiness] = useState(10)
  const [showFood, setShowFood] = useState(false)
  const [foodPosition, setFoodPosition] = useState({ x: 0, y: 100 })
  const [selectedFood, setSelectedFood] = useState<FoodType>(foodTypes[0])
  const [level, setLevel] = useState(1)
  const [experience, setExperience] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [hasCakeBeenUsed, setHasCakeBeenUsed] = useState(false)
  const [showCakeNotification, setShowCakeNotification] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPetImage(e.target?.result as string)
        const name = prompt('ペットの名前を入力してね')
        setPetName(name || '名無しのペット')
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
      setHealth((prev) => {
        const newHealth = Math.max(0, prev - 1)
        if (newHealth === 0) {
          setIsGameOver(true)
        }
        return newHealth
      })
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

  // 幸福度が80を超えた時にケーキの通知を表示
  useEffect(() => {
    if (happiness > 80 && !hasCakeBeenUsed && !showCakeNotification) {
      setShowCakeNotification(true)
    } else if (happiness <= 80 || hasCakeBeenUsed) {
      setShowCakeNotification(false)
    }
  }, [happiness, hasCakeBeenUsed, showCakeNotification])

  const feedPet = () => {
    if (isGameOver) return
    setShowFood(true)
    setFoodPosition({ x: petPosition.x, y: petPosition.y + 50 })
    setTimeout(() => {
      setShowFood(false)
      setHealth((prev) => Math.min(100, prev + selectedFood.healthEffect))
      setHappiness((prev) => Math.min(100, prev + selectedFood.happinessEffect))
      setExperience((prev) => prev + selectedFood.experiencePoints)

      // ケーキを使用した場合、使用済みフラグを立てる
      if (selectedFood.name === specialCake.name) {
        setHasCakeBeenUsed(true)
        setSelectedFood(foodTypes[0]) // 通常の餌に戻す
      }
    }, 2000)
  }

  const petPet = () => {
    if (isGameOver) return
    setHappiness((prev) => Math.min(100, prev + 5))
    setExperience((prev) => prev + 2)
  }

  const getEmoji = () => {
    if (isGameOver) return '💀'
    if (health < 30 ) return '😢'
    if (health > 70 ) return '😊'
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
    setHealth(10)
    setHappiness(10)
    setLevel(1)
    setExperience(0)
    setIsGameOver(false)
    setPetPosition({ x: 50, y: 50 })
    setShowFood(false)
    setSelectedFood(foodTypes[0])
    setIsEditingName(false)
    setNewPetName('')
    setHasCakeBeenUsed(false)
    setShowCakeNotification(false)
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gradient-to-r from-green-400 to-blue-500" ref={containerRef}>
      {petImage ? (
        <>
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
                width={getPetSize()}
                height={getPetSize()}
              />
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl">
                {getEmoji()}
              </span>
            </div>
          </motion.div>

          {isGameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-bold mb-4">ゲームオーバー</h2>
                <p className="mb-4">{petName}は{level}レベルまで成長しました。</p>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  onClick={resetGame}
                >
                  新しいゲームを始める
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      )}

      <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg border-2 border-yellow-300">
        <div className="p-2 bg-yellow-50 rounded-lg">
          {isEditingName ? (
            <form onSubmit={handleNameChange} className="mb-2">
              <input
                type="text"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                className="border rounded px-2 py-1 mr-2"
                placeholder="新しい名前を入力"
              />
              <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
                保存
              </button>
            </form>
          ) : (
            <div className="mb-2 flex items-center">
              <span className="text-xl font-bold mr-2">{petName}</span>
              <button
                onClick={() => setIsEditingName(true)}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm"
              >
                編集
              </button>
            </div>
          )}
          <div className="mb-2">レベル: {level}</div>
          <div className="mb-2">経験値: {experience}/{LEVEL_THRESHOLD}</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-purple-600 h-2.5 rounded-full"
              style={{ width: `${(experience / LEVEL_THRESHOLD) * 100}%` }}
            ></div>
          </div>
          <div className="mb-2">体力: {health}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${health}%` }}></div>
          </div>
          <div className="mb-2">幸福度: {happiness}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${happiness}%` }}></div>
          </div>
        </div>
      </div>

      {!isGameOver && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end">
          <div className="mb-2">
            {foodTypes.map((food) => (
              <button
                key={food.name}
                className={`mr-2 px-4 py-2 rounded ${
                  selectedFood.name === food.name ? 'bg-yellow-500' : 'bg-yellow-300'
                }`}
                onClick={() => setSelectedFood(food)}
              >
                {food.emoji} {food.name}
              </button>
            ))}
            
            {/* 幸福度が80を超えていて、まだケーキを使用していない場合のみ表示 */}
            {happiness > 80 && !hasCakeBeenUsed && (
              <button
                className="mr-2 px-4 py-2 rounded bg-yellow-300 hover:bg-yellow-500 transition-colors animate-bounce"
                onClick={() => setSelectedFood(specialCake)}
              >
                {specialCake.emoji} {specialCake.name}
                <span className="ml-2 text-xs text-green-600">Special!</span>
              </button>
            )}
          </div>
          <button
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
            onClick={feedPet}
          >
            {petName}に餌をやる
          </button>
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

      {/* 幸福度が80を超えていて、まだケーキを使用していない場合のみ通知を表示 */}
      {showCakeNotification && (
        <div className="absolute top-4 right-4 mt-4 p-4 bg-green-100 border border-green-300 rounded-lg animate-pulse">
          <h3 className="text-lg font-semibold">🎉 特別なごほうび解放！</h3>
          <p>{petName}はとても幸せそう！特別なケーキをあげることができます！</p>
          <p className="text-sm text-gray-600 mt-2">※ケーキは1度だけ使えます</p>
        </div>
      )}
    </div>
  )
}
'use client'

import React from 'react'
import { FaWhatsapp } from 'react-icons/fa' // install with: npm install react-icons

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919502554901" // 👈 replace with your WhatsApp number
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50 flex items-center justify-center"
    >
      <FaWhatsapp className="h-6 w-6" />
    </a>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, X, Send, Mic, MicOff, ImagePlus, Check } from 'lucide-react'
import { createTransaction } from '@/lib/supabase/transactions'
import { getCategoryById } from '@/lib/data/categories'
import styles from './AIChatWidget.module.css'

const WELCOME = '¡Hola! Dime qué gastaste o ganaste. Puedes escribirlo, grabarlo con voz, o mandarme foto de una factura 📸\n\nEjemplo: "gasté 5 lukas en café" o "me pagaron 800 mil de freelance"'

export default function AIChatWidget({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [pendingImage, setPendingImage] = useState(null)

  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', type: 'text', content: WELCOME }])
    }
  }, [isOpen, messages.length])

  const addMsg = (msg) =>
    setMessages((prev) => [...prev, { id: Date.now().toString() + Math.random(), ...msg }])

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      addMsg({ role: 'assistant', type: 'text', content: '⚠️ Tu navegador no soporta voz. Usa Chrome.' })
      return
    }
    const r = new SR()
    r.lang = 'es-CO'
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (e) => {
      setInput(e.results[0][0].transcript)
      setIsListening(false)
    }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    recognitionRef.current = r
    r.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setPendingImage({ base64: dataUrl.split(',')[1], mimeType: file.type, preview: dataUrl })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text && !pendingImage) return

    const image = pendingImage
    setInput('')
    setPendingImage(null)
    setIsLoading(true)

    addMsg({
      role: 'user',
      type: image ? 'image' : 'text',
      content: text,
      imagePreview: image?.preview,
    })

    try {
      const res = await fetch('/api/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text || undefined,
          imageBase64: image?.base64 || undefined,
          mimeType: image?.mimeType || undefined,
        }),
      })

      const rawText = await res.text()
      console.log('API response status:', res.status, '| body:', rawText.slice(0, 300))
      let data
      try {
        data = JSON.parse(rawText)
      } catch {
        throw new Error(`Respuesta no válida (${res.status}): ${rawText.slice(0, 100)}`)
      }

      if (data.error) {
        addMsg({ role: 'assistant', type: 'text', content: '😕 Nuestro AI está teniendo problemas... estamos trabajando para corregirlo. ¡Intenta de nuevo en un momento!' })
      } else {
        addMsg({ role: 'assistant', type: 'transaction', content: data.message, parsed: data })
      }
    } catch (err) {
      console.error('AIChatWidget error:', err)
      addMsg({ role: 'assistant', type: 'text', content: '😕 Nuestro AI está teniendo problemas... estamos trabajando para corregirlo. ¡Intenta de nuevo en un momento!' })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmTransaction = async (msgId, parsed) => {
    try {
      await createTransaction({
        amount: parsed.amount,
        type: parsed.type,
        category_id: parsed.category_id,
        description: parsed.description,
        date: parsed.date,
      })
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, confirmed: true } : m))
      )
      addMsg({ role: 'assistant', type: 'text', content: '✅ ¡Listo! Transacción registrada. ¿Hay algo más?' })
      onSuccess?.()
    } catch {
      addMsg({ role: 'assistant', type: 'text', content: '😕 No pudimos guardar la transacción. ¡Intenta de nuevo!' })
    }
  }

  const dismissMsg = (msgId) =>
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, dismissed: true } : m)))

  return (
    <>
      {!isOpen && (
        <button className={styles.fab} onClick={() => setIsOpen(true)} aria-label="Asistente IA">
          <Sparkles size={22} />
        </button>
      )}

      {isOpen && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Sparkles size={17} />
              <span>Asistente Fintia</span>
              <span className={styles.aiTag}>IA</span>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                {msg.role === 'user' ? (
                  <div className={styles.userBubble}>
                    {msg.imagePreview && (
                      <img src={msg.imagePreview} alt="factura" className={styles.previewImg} />
                    )}
                    {msg.content && <p>{msg.content}</p>}
                  </div>
                ) : msg.type === 'transaction' && !msg.confirmed && !msg.dismissed ? (
                  <div className={styles.assistantBubble}>
                    <p className={styles.msgText}>{msg.content}</p>
                    <TxCard
                      parsed={msg.parsed}
                      onConfirm={() => confirmTransaction(msg.id, msg.parsed)}
                      onDismiss={() => dismissMsg(msg.id)}
                    />
                  </div>
                ) : msg.type === 'transaction' && msg.confirmed ? (
                  <div className={styles.assistantBubble}>
                    <p className={styles.msgText}>{msg.content}</p>
                    <p className={styles.confirmedBadge}>✅ Registrada</p>
                  </div>
                ) : (
                  <div className={styles.assistantBubble}>
                    <p className={styles.msgText}>{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.assistantBubble}>
                  <div className={styles.typingDots}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Pending image thumbnail */}
          {pendingImage && (
            <div className={styles.pendingImage}>
              <img src={pendingImage.preview} alt="preview" />
              <button onClick={() => setPendingImage(null)}>
                <X size={13} />
              </button>
            </div>
          )}

          {/* Input area */}
          <div className={styles.inputArea}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button
              className={styles.iconBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Foto de factura"
            >
              <ImagePlus size={18} />
            </button>
            <input
              type="text"
              className={styles.textInput}
              placeholder='Ej: "gasté 5 lukas en café"'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            />
            <button
              className={`${styles.iconBtn} ${isListening ? styles.listening : ''}`}
              onClick={isListening ? stopListening : startListening}
              title={isListening ? 'Detener' : 'Hablar'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              className={styles.sendBtn}
              onClick={sendMessage}
              disabled={isLoading || (!input.trim() && !pendingImage)}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function TxCard({ parsed, onConfirm, onDismiss }) {
  const cat = getCategoryById(parsed.category_id)
  const isIncome = parsed.type === 'income'
  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

  return (
    <div className={styles.txCard}>
      <div className={styles.txRow}>
        <span
          className={styles.txIcon}
          style={{ background: (cat?.color || '#9ca3af') + '20', color: cat?.color || '#9ca3af' }}
        >
          {cat?.icon || '📦'}
        </span>
        <div className={styles.txInfo}>
          <p className={styles.txDesc}>{parsed.description}</p>
          <p className={styles.txMeta}>{cat?.name} · {parsed.date}</p>
        </div>
        <span className={`${styles.txAmount} ${isIncome ? styles.txIncome : styles.txExpense}`}>
          {isIncome ? '+' : '-'}{fmt(parsed.amount)}
        </span>
      </div>
      <div className={styles.txActions}>
        <button className={styles.confirmBtn} onClick={onConfirm}>
          <Check size={13} /> Registrar
        </button>
        <button className={styles.cancelBtn} onClick={onDismiss}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

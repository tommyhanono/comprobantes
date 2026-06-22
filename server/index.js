import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { execFile } from 'child_process'
import { promisify } from 'util'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import sharp from 'sharp'

const execFileAsync = promisify(execFile)

const app  = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { realtime: { transport: ws } },
)

// ── Perceptual hash (8×8 average hash → 64-bit binary string) ──────────────
async function computeAHash(buffer) {
  const { data } = await sharp(buffer)
    .resize(8, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const avg = data.reduce((a, b) => a + b, 0) / 64
  let hash = ''
  for (let i = 0; i < 64; i++) hash += data[i] >= avg ? '1' : '0'
  return hash
}

function hammingDistance(a, b) {
  let d = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) d++
  }
  return d
}

// ── Folio generator ─────────────────────────────────────────────────────────
async function nextFolio() {
  const { count } = await supabase
    .from('comprobantes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'valido')
  return 'FOL-' + String((count || 0) + 1).padStart(4, '0')
}

// ── WhatsApp via wacli ───────────────────────────────────────────────────────
async function sendWhatsApp(message) {
  const wacli  = process.env.WACLI_PATH || '/Users/tommyhanono/bin/wacli'
  const number = process.env.ADMIN_WHATSAPP || '50766818669'
  try {
    await execFileAsync(wacli, ['send', 'text', '--to', number, '--message', message])
    console.log('WhatsApp enviado a', number)
  } catch (err) {
    console.error('Error enviando WhatsApp:', err.message)
  }
}

// ── Main verify endpoint ─────────────────────────────────────────────────────
app.post('/api/verify', async (req, res) => {
  const { imageUrl, nombrePadre, montoDeclarado } = req.body
  if (!imageUrl || !nombrePadre) {
    return res.status(400).json({ error: 'Faltan campos requeridos' })
  }

  try {
    // 1. Download image
    const imageRes = await fetch(imageUrl)
    if (!imageRes.ok) throw new Error('No se pudo descargar la imagen')
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer())

    // 2. Claude vision → extract structured data
    const mediaType = imageRes.headers.get('content-type') || 'image/jpeg'
    const base64    = imageBuffer.toString('base64')

    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Extrae los datos de este comprobante de pago bancario. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con estos campos:
{
  "monto": número o null,
  "fecha": "YYYY-MM-DD" o null,
  "hora": "HH:MM" o null,
  "referencia": string o null,
  "banco": string o null,
  "remitente": string o null,
  "destinatario": string o null
}
Si un campo no es legible, ponlo como null. NUNCA inventes datos.`,
          },
        ],
      }],
    })

    let ocrData = {}
    try {
      const raw = msg.content[0].text.trim()
      const jsonStr = raw.startsWith('{') ? raw : raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)
      ocrData = JSON.parse(jsonStr)
    } catch {
      console.warn('No se pudo parsear JSON de Claude:', msg.content[0].text)
    }

    // 3. Perceptual hash
    const imageHash = await computeAHash(imageBuffer)

    // 4. Duplicate detection
    let status     = 'valido'
    let matchedId  = null

    // 4a. Reference exact match
    if (ocrData.referencia) {
      const { data: refMatches } = await supabase
        .from('comprobantes')
        .select('id, nombre_padre, created_at')
        .eq('referencia', ocrData.referencia)
        .in('status', ['valido', 'pendiente_revision'])
        .limit(1)

      if (refMatches?.length) {
        status    = 'duplicado'
        matchedId = refMatches[0].id
      }
    }

    // 4b. Hash distance match (only if no ref match yet)
    if (status === 'valido') {
      const { data: recentHashes } = await supabase
        .from('comprobantes')
        .select('id, image_hash, nombre_padre, created_at')
        .in('status', ['valido', 'pendiente_revision'])
        .not('image_hash', 'is', null)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

      if (recentHashes) {
        for (const row of recentHashes) {
          if (row.image_hash && hammingDistance(imageHash, row.image_hash) <= 10) {
            status    = 'duplicado'
            matchedId = row.id
            break
          }
        }
      }
    }

    // 4c. Weak match: monto + fecha + remitente (→ pendiente_revision)
    if (status === 'valido' && ocrData.monto && ocrData.fecha && ocrData.remitente) {
      const { data: weakMatches } = await supabase
        .from('comprobantes')
        .select('id')
        .eq('monto', ocrData.monto)
        .eq('fecha_transaccion', ocrData.fecha)
        .eq('remitente', ocrData.remitente)
        .in('status', ['valido', 'pendiente_revision'])
        .limit(1)

      if (weakMatches?.length) {
        status    = 'pendiente_revision'
        matchedId = weakMatches[0].id
      }
    }

    // 5. Generate folio (only for validos)
    const folio = status === 'valido' ? await nextFolio() : 'DUP-' + Date.now().toString(36).toUpperCase()

    // 6. Insert record
    const { data: inserted, error: insertErr } = await supabase
      .from('comprobantes')
      .insert({
        image_url:              imageUrl,
        image_hash:             imageHash,
        monto:                  ocrData.monto ?? null,
        fecha_transaccion:      ocrData.fecha ?? null,
        referencia:             ocrData.referencia ?? null,
        banco:                  ocrData.banco ?? null,
        remitente:              ocrData.remitente ?? null,
        destinatario:           ocrData.destinatario ?? null,
        nombre_padre:           nombrePadre,
        status,
        ocr_raw:                ocrData,
        matched_comprobante_id: matchedId,
      })
      .select('id')
      .single()

    if (insertErr) throw new Error('Error guardando en base de datos: ' + insertErr.message)

    // 7. WhatsApp alert if duplicado
    if (status === 'duplicado' && matchedId) {
      const { data: original } = await supabase
        .from('comprobantes')
        .select('nombre_padre, created_at, monto')
        .eq('id', matchedId)
        .single()

      const originalDate = original
        ? new Date(original.created_at).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'fecha desconocida'

      const msgText = [
        '⚠️ *DUPLICADO DETECTADO — Comprobantes*',
        '',
        `Padre: ${nombrePadre}`,
        `Monto: B/. ${ocrData.monto ?? montoDeclarado}`,
        '',
        `Coincide con el comprobante de *${original?.nombre_padre || 'padre anterior'}* del ${originalDate}.`,
        '',
        'Revisar en el panel admin.',
      ].join('\n')

      await sendWhatsApp(msgText)
    }

    return res.json({ status, folio, id: inserted.id })

  } catch (err) {
    console.error('Error en /api/verify:', err)
    return res.status(500).json({ error: err.message })
  }
})

app.listen(port, () => {
  console.log(`Servidor Comprobantes corriendo en http://localhost:${port}`)
})

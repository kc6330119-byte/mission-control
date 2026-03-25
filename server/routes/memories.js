import { Router } from 'express'
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs'
import { join, basename, extname, dirname } from 'path'
import db from '../db/index.js'

const router = Router()

// All known memory directories with their source labels
const MEMORY_DIRS = [
  {
    path: '/Users/kevincollins/.openclaw/workspace/memory',
    source: 'openclaw',
    label: 'OpenClaw (Zoe)',
  },
  {
    path: '/Users/kevincollins/Library/Application Support/Claude/local-agent-mode-sessions/10c2e425-75c1-4a0f-aeba-00008e6ac2a2/a7b8b30b-d44a-4a91-84f6-c76b112a9fa9/agent/memory',
    source: 'cowork',
    label: 'Cowork (Zoe)',
  },
  {
    path: '/Users/kevincollins/.claude/projects/-Users-kevincollins-GitHub-financial-tools-directory/memory',
    source: 'claude-code-financial-tools',
    label: 'Claude Code — Financial Tools',
  },
  {
    path: '/Users/kevincollins/GitHub/senior-home-care-directory/.claude/projects/-Users-kevincollins-GitHub-senior-home-care-directory/memory',
    source: 'claude-code-senior-home-care',
    label: 'Claude Code — Senior Home Care',
  },
]

// Default directory for new memories created through the UI
const DEFAULT_SOURCE = 'cowork'

function getDefaultDir() {
  return MEMORY_DIRS.find(d => d.source === DEFAULT_SOURCE)
}

// ── Helpers ──────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }
  const meta = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      meta[key] = val
    }
  }
  return { meta, body: match[2].trim() }
}

function buildMarkdownFile(name, description, type, bodyContent) {
  // Extract the body from content — strip existing frontmatter if present
  const { body } = parseFrontmatter(bodyContent || '')
  const actualBody = body || bodyContent || ''
  return `---\nname: ${name}\ndescription: ${description}\ntype: ${type}\n---\n\n${actualBody}\n`
}

function inferType(filename, content) {
  const lower = (filename + ' ' + content).toLowerCase()
  if (lower.includes('feedback') || lower.includes('correction')) return 'feedback'
  if (lower.includes('team') || lower.includes('roster') || lower.includes('user')) return 'user'
  if (lower.includes('reference') || lower.includes('command') || lower.includes('config')) return 'reference'
  return 'project'
}

function nameFromFile(filename) {
  return basename(filename, extname(filename))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function toKebabCase(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Write file content to disk, creating directories if needed
function writeMemoryFile(filePath, content) {
  const dir = dirname(filePath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, content, 'utf-8')
}

// Update the MEMORY.md index in a directory
function addToMemoryIndex(dirPath, filename, name, description) {
  const indexPath = join(dirPath, 'MEMORY.md')
  const entry = `- [${name}](${filename}) — ${description}`
  if (existsSync(indexPath)) {
    const current = readFileSync(indexPath, 'utf-8')
    // Don't duplicate
    if (current.includes(filename)) return
    writeFileSync(indexPath, current.trimEnd() + '\n' + entry + '\n', 'utf-8')
  } else {
    writeFileSync(indexPath, `# Memory Index\n\n${entry}\n`, 'utf-8')
  }
}

function removeFromMemoryIndex(dirPath, filename) {
  const indexPath = join(dirPath, 'MEMORY.md')
  if (!existsSync(indexPath)) return
  const lines = readFileSync(indexPath, 'utf-8').split('\n')
  const filtered = lines.filter(line => !line.includes(`(${filename})`))
  writeFileSync(indexPath, filtered.join('\n'), 'utf-8')
}

// ── Routes ───────────────────────────────────────────────────────────

// List memories with search and filters
router.get('/', (req, res) => {
  const { type, search, sort, source } = req.query
  let sql = 'SELECT * FROM memories WHERE 1=1'
  const params = []

  if (type) { sql += ' AND type = ?'; params.push(type) }
  if (source) { sql += ' AND source = ?'; params.push(source) }
  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ? OR content LIKE ?)'
    const q = `%${search}%`
    params.push(q, q, q)
  }

  switch (sort) {
    case 'name': sql += ' ORDER BY name ASC'; break
    case 'type': sql += ' ORDER BY type ASC, name ASC'; break
    case 'created': sql += ' ORDER BY created_at DESC'; break
    default: sql += ' ORDER BY updated_at DESC'
  }

  res.json(db.prepare(sql).all(...params))
})

// Get distinct sources for filter UI
router.get('/sources', (req, res) => {
  const sources = db.prepare('SELECT DISTINCT source FROM memories WHERE source IS NOT NULL ORDER BY source').all()
  const enriched = sources.map(s => {
    const dir = MEMORY_DIRS.find(d => d.source === s.source)
    return { source: s.source, label: dir?.label || s.source }
  })
  res.json(enriched)
})

// Single memory detail
router.get('/:id', (req, res) => {
  const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id)
  if (!memory) return res.status(404).json({ error: 'Memory not found' })
  res.json(memory)
})

// Create memory — also writes markdown file to the default source directory
router.post('/', (req, res) => {
  const { name, description, type, content, source } = req.body
  const memName = name || 'New Memory'
  const memDesc = description || ''
  const memType = type || 'project'
  const memContent = content || ''
  const memSource = source || DEFAULT_SOURCE

  // Determine target directory
  const targetDir = MEMORY_DIRS.find(d => d.source === memSource) || getDefaultDir()
  let filePath = null
  let fileWritten = false

  if (targetDir && existsSync(targetDir.path)) {
    const filename = `${toKebabCase(memName)}.md`
    filePath = join(targetDir.path, filename)

    // Avoid overwriting existing file
    let finalPath = filePath
    let counter = 1
    while (existsSync(finalPath)) {
      finalPath = join(targetDir.path, `${toKebabCase(memName)}-${counter}.md`)
      counter++
    }
    filePath = finalPath

    const fileContent = buildMarkdownFile(memName, memDesc, memType, memContent)
    try {
      writeMemoryFile(filePath, fileContent)
      addToMemoryIndex(targetDir.path, basename(filePath), memName, memDesc)
      fileWritten = true
    } catch (e) {
      console.error('Failed to write new memory file:', e.message)
      filePath = null
    }
  }

  const now = new Date().toISOString()
  const result = db.prepare(
    'INSERT INTO memories (name, description, type, content, file_path, source, sync_status, last_synced_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(memName, memDesc, memType, memContent, filePath, memSource, fileWritten ? 'synced' : 'pending_write', fileWritten ? now : null, now, now)

  db.prepare('INSERT INTO activity_log (type, message, agent) VALUES (?, ?, ?)').run(
    'memory', `Created memory: "${memName}"${fileWritten ? ` → ${basename(filePath)}` : ''}`, null
  )

  const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(memory)
})

// Update memory — writes changes back to the source markdown file
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Memory not found' })

  const { name, description, type, content } = req.body
  const finalName = name ?? existing.name
  const finalDesc = description ?? existing.description
  const finalType = type ?? existing.type
  const finalContent = content ?? existing.content
  const now = new Date().toISOString()

  // Write back to markdown file
  let writebackOk = false
  if (existing.file_path) {
    const fileContent = buildMarkdownFile(finalName, finalDesc, finalType, finalContent)
    try {
      writeMemoryFile(existing.file_path, fileContent)
      writebackOk = true

      // Update MEMORY.md index if name/description changed
      if (name !== undefined || description !== undefined) {
        const dirPath = dirname(existing.file_path)
        const filename = basename(existing.file_path)
        removeFromMemoryIndex(dirPath, filename)
        addToMemoryIndex(dirPath, filename, finalName, finalDesc)
      }
    } catch (e) {
      console.error('Failed to write back memory file:', e.message)
    }
  }

  db.prepare(
    'UPDATE memories SET name=?, description=?, type=?, content=?, sync_status=?, last_synced_at=?, updated_at=? WHERE id=?'
  ).run(
    finalName, finalDesc, finalType, finalContent,
    writebackOk ? 'synced' : (existing.file_path ? 'pending_write' : 'synced'),
    writebackOk ? now : existing.last_synced_at,
    now,
    req.params.id
  )

  const updated = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id)
  res.json(updated)
})

// Delete memory — also deletes the source markdown file and removes from MEMORY.md
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM memories WHERE id = ?').get(req.params.id)
  if (!existing) return res.status(404).json({ error: 'Memory not found' })

  // Delete the source file
  if (existing.file_path && existsSync(existing.file_path)) {
    try {
      const dirPath = dirname(existing.file_path)
      const filename = basename(existing.file_path)
      unlinkSync(existing.file_path)
      removeFromMemoryIndex(dirPath, filename)
    } catch (e) {
      console.error('Failed to delete memory file:', e.message)
    }
  }

  db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id)

  db.prepare('INSERT INTO activity_log (type, message, agent) VALUES (?, ?, ?)').run(
    'memory', `Deleted memory: "${existing.name}"`, null
  )

  res.json({ ok: true })
})

// Bi-directional sync across ALL memory directories
router.post('/sync', (req, res) => {
  const results = { imported: 0, updated: 0, skipped: 0, written_back: 0, conflicts: 0, directories: [] }
  const now = new Date().toISOString()

  for (const dir of MEMORY_DIRS) {
    if (!existsSync(dir.path)) {
      results.directories.push({ source: dir.source, label: dir.label, status: 'not found' })
      continue
    }

    const dirResult = { source: dir.source, label: dir.label, imported: 0, updated: 0, skipped: 0, written_back: 0, conflicts: 0 }

    // Track which file_paths we see on disk for this source
    const seenFilePaths = new Set()

    function syncDir(dirPath) {
      let entries
      try { entries = readdirSync(dirPath) } catch { return }

      for (const entry of entries) {
        const fullPath = join(dirPath, entry)
        let stat
        try { stat = statSync(fullPath) } catch { continue }

        if (stat.isDirectory()) {
          syncDir(fullPath)
          continue
        }

        if (extname(entry) !== '.md' || entry === 'MEMORY.md') continue

        seenFilePaths.add(fullPath)

        let raw
        try { raw = readFileSync(fullPath, 'utf-8') } catch { continue }

        const { meta, body } = parseFrontmatter(raw)
        const name = meta.name || nameFromFile(entry)
        const description = meta.description || body.split('\n')[0]?.replace(/^#+ /, '').slice(0, 200) || ''
        const type = meta.type || inferType(entry, body)
        const fileModified = stat.mtime.toISOString()

        const existing = db.prepare('SELECT * FROM memories WHERE file_path = ?').get(fullPath)

        if (existing) {
          const fileTime = new Date(fileModified)
          const dbTime = new Date(existing.updated_at)
          const lastSync = existing.last_synced_at ? new Date(existing.last_synced_at) : new Date(0)

          // Both changed since last sync — conflict
          if (fileTime > lastSync && dbTime > lastSync && existing.sync_status === 'pending_write') {
            db.prepare('UPDATE memories SET sync_status=? WHERE id=?').run('conflict', existing.id)
            dirResult.conflicts++
          }
          // File is newer than DB — update DB from file
          else if (fileTime > dbTime) {
            db.prepare(
              'UPDATE memories SET name=?, description=?, type=?, content=?, source=?, sync_status=?, last_synced_at=?, updated_at=? WHERE id=?'
            ).run(name, description, type, raw, dir.source, 'synced', now, fileModified, existing.id)
            dirResult.updated++
          }
          // DB is newer (edited through UI) — write DB content back to file
          else if (dbTime > fileTime && existing.sync_status === 'pending_write') {
            const fileContent = buildMarkdownFile(existing.name, existing.description, existing.type, existing.content)
            try {
              writeMemoryFile(fullPath, fileContent)
              db.prepare('UPDATE memories SET sync_status=?, last_synced_at=? WHERE id=?').run('synced', now, existing.id)
              dirResult.written_back++
            } catch (e) {
              console.error('Failed to write back during sync:', e.message)
            }
          }
          // No changes
          else {
            if (existing.sync_status !== 'synced') {
              db.prepare('UPDATE memories SET sync_status=?, last_synced_at=? WHERE id=?').run('synced', now, existing.id)
            }
            dirResult.skipped++
          }
        } else {
          // New file — import
          db.prepare(
            'INSERT INTO memories (name, description, type, content, file_path, source, sync_status, last_synced_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).run(name, description, type, raw, fullPath, dir.source, 'synced', now, fileModified, fileModified)
          dirResult.imported++
        }
      }
    }

    syncDir(dir.path)
    dirResult.status = 'ok'
    results.directories.push(dirResult)
    results.imported += dirResult.imported
    results.updated += dirResult.updated
    results.skipped += dirResult.skipped
    results.written_back += dirResult.written_back
    results.conflicts += dirResult.conflicts
  }

  // Write back any pending memories that don't have files yet
  const pendingNoFile = db.prepare("SELECT * FROM memories WHERE sync_status = 'pending_write' AND file_path IS NOT NULL").all()
  for (const mem of pendingNoFile) {
    if (!existsSync(mem.file_path)) {
      const fileContent = buildMarkdownFile(mem.name, mem.description, mem.type, mem.content)
      try {
        writeMemoryFile(mem.file_path, fileContent)
        db.prepare('UPDATE memories SET sync_status=?, last_synced_at=? WHERE id=?').run('synced', now, mem.id)
        results.written_back++
      } catch (e) {
        console.error('Failed to create pending memory file:', e.message)
      }
    }
  }

  db.prepare('INSERT INTO activity_log (type, message, agent) VALUES (?, ?, ?)').run(
    'system',
    `Memory sync: ${results.imported} imported, ${results.updated} updated, ${results.written_back} written back, ${results.conflicts} conflicts, ${results.skipped} unchanged`,
    'Zoe'
  )

  res.json(results)
})

export default router

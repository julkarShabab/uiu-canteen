import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')
const files = ['users.json', 'orders.json', 'menu.json']

for (const f of files) {
  const full = path.join(dataDir, f)
  try {
    if (fs.existsSync(full)) {
      fs.unlinkSync(full)
      console.log('Deleted', full)
    }
  } catch (e) {
    console.error('Failed to delete', full, e.message)
  }
}
console.log('Data reset complete')
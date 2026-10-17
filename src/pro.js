import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './pro.css'

gsap.registerPlugin(ScrollTrigger)

function renderIcons() {
  window.lucide?.createIcons({ attrs: { 'stroke-width': 1.75 } })
}
renderIcons()
window.addEventListener('load', renderIcons, { once: true })

function syncScrollbarSpace() {
  const width = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
  document.documentElement.style.setProperty('--scrollbar-space', `${width}px`)
}
syncScrollbarSpace()
window.addEventListener('resize', syncScrollbarSpace, { passive: true })

const menu = document.querySelector('[data-menu]')
const navigation = document.querySelector('#exhibition-nav')
function closeMenu(returnFocus = false) {
  menu.setAttribute('aria-expanded', 'false')
  menu.setAttribute('aria-label', '開啟展覽導覽')
  navigation.classList.remove('is-open')
  if (returnFocus) menu.focus()
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true'
  menu.setAttribute('aria-expanded', String(open))
  menu.setAttribute('aria-label', open ? '關閉展覽導覽' : '開啟展覽導覽')
  navigation.classList.toggle('is-open', open)
  if (open) navigation.querySelector('a').focus()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true)
})
document.addEventListener('click', (event) => {
  if (!event.target.closest('.topbar') && menu.getAttribute('aria-expanded') === 'true') closeMenu()
})
window.matchMedia('(min-width: 821px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu()
})

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    const target = document.getElementById(link.getAttribute('href').slice(1))
    if (!target) return
    event.preventDefault()
    closeMenu()
    if (target instanceof HTMLDetailsElement) target.open = true
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    if (location.hash !== link.hash) history.pushState(null, '', link.hash)
  })
})

const navLinks = [...document.querySelectorAll('[data-nav]')]
const sectionObserver = new IntersectionObserver((entries) => {
  entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
    navLinks.forEach((link) => {
      if (link.dataset.nav === entry.target.id) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  })
}, { rootMargin: '-15% 0px -60% 0px', threshold: 0 })
document.querySelectorAll('[data-section]').forEach((section) => sectionObserver.observe(section))

const progress = document.querySelector('[data-progress]')
const backTop = document.querySelector('[data-back-top]')
let progressFrame = 0
function updateProgress() {
  if (progressFrame) return
  progressFrame = requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`
    backTop.hidden = window.scrollY < window.innerHeight
    if (window.scrollY < 500) navLinks.forEach((link) => link.removeAttribute('aria-current'))
    progressFrame = 0
  })
}
window.addEventListener('scroll', updateProgress, { passive: true })
window.addEventListener('resize', updateProgress, { passive: true })
updateProgress()

const metrics = {
  computer: {
    low: 27.82, all: 66.96,
    takeaway: '收入最低的兩成家庭中，每 100 戶約有 28 戶擁有電腦。',
    note: '電腦包含桌上型、筆記型和平板。這裡算的是家庭，不是孩子人數。',
    name: '家裡有電腦',
  },
  internet: {
    low: 84.82, all: 96.09,
    takeaway: '收入最低的兩成家庭中，每 100 戶約有 85 戶能在家上網。',
    note: '能上網和有適合寫作業的電腦，是兩件不同的事。這裡算的是家庭。',
    name: '家裡能上網',
  },
}
document.querySelectorAll('[data-metric]').forEach((button) => {
  button.addEventListener('click', () => {
    const data = metrics[button.dataset.metric]
    document.querySelectorAll('[data-metric]').forEach((item) => {
      const selected = item === button
      item.classList.toggle('selected', selected)
      item.setAttribute('aria-pressed', String(selected))
    })
    document.querySelector('[data-low-value]').textContent = data.low.toFixed(2)
    document.querySelector('[data-all-value]').textContent = data.all.toFixed(2)
    document.querySelector('[data-low-bar]').style.setProperty('--value', `${data.low}%`)
    document.querySelector('[data-all-bar]').style.setProperty('--value', `${data.all}%`)
    document.querySelector('[data-device-takeaway]').textContent = data.takeaway
    document.querySelector('[data-device-note]').textContent = data.note
    document.querySelector('[data-metric-announcement]').textContent = `${data.name}，收入最低的兩成家庭 ${data.low}%，全體家庭平均 ${data.all}%。`
  })
})

const answers = {
  children: '一戶家庭可能沒有在學的孩子，也可能同時養育好幾個。平均每戶的支出，不能直接換成每位孩子得到多少資源。',
  age: '不同求學階段，面對的開銷不一樣。比較家庭支出以前，還需要了解家裡有誰正在上學、正在念哪個階段。',
  need: '少花錢，不一定代表不夠用。要判斷支持是否足夠，還得知道孩子需要什麼，以及學校或其他地方提供了什麼。',
}
document.querySelectorAll('[data-question]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-question]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)))
    document.querySelector('[data-question-answer]').textContent = answers[button.dataset.question]
  })
})

const schoolGrid = document.querySelector('[data-school-grid]')
const schoolCells = document.createDocumentFragment()
for (let index = 0; index < 100; index += 1) {
  const cell = document.createElement('span')
  if (index < 72) cell.className = 'covered'
  schoolCells.append(cell)
}
schoolGrid.append(schoolCells)

const motion = gsap.matchMedia()
motion.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.hero-copy > *', { y: 20, opacity: 0, duration: .7, stagger: .09, ease: 'power2.out' })
  gsap.from('.desk-scene img', { y: 26, opacity: 0, duration: 1.1, ease: 'power2.out', delay: .2 })
  document.querySelectorAll('[data-reveal]').forEach((item) => {
    gsap.fromTo(item, { y: 24, opacity: .45 }, { y: 0, opacity: 1, duration: .65, ease: 'power2.out', immediateRender: false, scrollTrigger: { trigger: item, start: 'top 90%', once: true } })
  })
  document.querySelectorAll('.comparison-fill, .expense-track > span').forEach((bar) => {
    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: .85, ease: 'power2.out', scrollTrigger: { trigger: bar, start: 'top 93%', once: true } })
  })
})
document.fonts.ready.then(() => ScrollTrigger.refresh())
document.querySelectorAll('details').forEach((details) => details.addEventListener('toggle', () => ScrollTrigger.refresh(true)))

const form = document.querySelector('[data-feedback-form]')
const status = document.querySelector('[data-form-status]')
const submit = document.querySelector('[data-submit]')
const submitLabel = document.querySelector('[data-submit-label]')
const spinner = document.querySelector('[data-spinner]')
const endpoint = import.meta.env.VITE_APPS_SCRIPT_URL?.trim()
let sending = false
let sent = false
let dirty = false

form.addEventListener('input', (event) => {
  dirty = [...form.elements].some((field) => {
    if (field instanceof HTMLInputElement && field.type === 'radio') return field.checked
    if (field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) return field.value.length > 0
    return false
  })
  if (event.target instanceof HTMLTextAreaElement) {
    document.querySelector(`[data-counter="${event.target.name}"]`).textContent = `${event.target.value.length} / 1500 字`
  }
})
window.addEventListener('beforeunload', (event) => {
  if (!dirty || sent) return
  event.preventDefault()
  event.returnValue = ''
})

if (!endpoint) {
  submit.disabled = true
  status.textContent = '回應功能暫時無法使用，請稍後再來看看。'
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (sending || sent || !endpoint || !form.reportValidity()) return
  const fields = new FormData(form)
  const payload = {
    rating: Number(fields.get('rating')),
    chapter: fields.get('chapter'),
    reflection: String(fields.get('reflection') ?? '').trim(),
    suggestion: String(fields.get('suggestion') ?? '').trim(),
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)
  sending = true
  form.querySelectorAll('input, select, textarea').forEach((field) => { field.disabled = true })
  submit.disabled = true
  submitLabel.textContent = '正在送出…'
  spinner.hidden = false
  submit.querySelector('[data-submit-icon]').hidden = true
  form.setAttribute('aria-busy', 'true')
  status.dataset.state = 'sending'
  status.textContent = '請稍等一下，不用重複按送出。'
  try {
    // A simple text POST avoids a preflight. An opaque response confirms dispatch,
    // not persistence, so the visitor-facing receipt says sent rather than saved.
    await fetch(endpoint, { method: 'POST', mode: 'no-cors', credentials: 'omit', body: JSON.stringify(payload), signal: controller.signal })
    sent = true
    dirty = false
    document.querySelector('.feedback-paper').style.minHeight = `${document.querySelector('.feedback-paper').offsetHeight}px`
    form.hidden = true
    const thanks = document.querySelector('[data-feedback-thanks]')
    thanks.hidden = false
    thanks.focus()
    ScrollTrigger.refresh()
  } catch (error) {
    status.dataset.state = 'error'
    status.textContent = error.name === 'AbortError' ? '連線等得有點久，暫時無法確認送出結果。內容已保留，請稍後再試。' : '這次沒能完成送出。請檢查網路連線後再試一次，你寫的內容還在。'
  } finally {
    clearTimeout(timeout)
    sending = false
    form.removeAttribute('aria-busy')
    form.querySelectorAll('input, select, textarea').forEach((field) => { field.disabled = sent })
    submit.disabled = sent
    submitLabel.textContent = sent ? '已送出' : '送出我的想法'
    spinner.hidden = true
    submit.querySelector('[data-submit-icon]').hidden = false
  }
})

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './pro.css'
import tailwindTheme from './pro.theme.css?raw'

// Tailwind's browser CDN compiles this theme. Keep directives out of Vite's CSS minifier.
const themeStyle = document.createElement('style')
themeStyle.type = 'text/tailwindcss'
themeStyle.textContent = tailwindTheme
const stylesReady = new Promise((resolve) => {
  const finish = (ready) => {
    observer.disconnect()
    clearTimeout(timeout)
    resolve(ready)
  }
  const observer = new MutationObserver(() => {
    if (getComputedStyle(document.documentElement).getPropertyValue('--pro-styles-ready').trim() === '1') finish(true)
  })
  const timeout = setTimeout(() => finish(false), 12000)
  observer.observe(document.head, { childList: true, subtree: true, characterData: true })
})
document.head.append(themeStyle)
history.scrollRestoration = 'manual'

const windowReady = document.readyState === 'complete'
  ? Promise.resolve()
  : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))
const pageReady = Promise.all([stylesReady, windowReady]).then(async ([stylesCompiled]) => {
  await document.fonts.ready
  if (!stylesCompiled || !window.lucide || getComputedStyle(document.documentElement).getPropertyValue('--pro-styles-ready').trim() !== '1') {
    document.documentElement.dataset.loadState = 'error'
    return false
  }
  renderIcons()
  return true
})

gsap.registerPlugin(ScrollTrigger)
const scrollport = document.querySelector('#exhibition-scroll')
ScrollTrigger.defaults({ scroller: scrollport })

function renderIcons() {
  window.lucide?.createIcons({ attrs: { 'stroke-width': 1.75 } })
}
renderIcons()
window.addEventListener('load', renderIcons, { once: true })

function syncScrollbarSpace() {
  const width = Math.max(0, scrollport.offsetWidth - scrollport.clientWidth)
  document.documentElement.style.setProperty('--scrollbar-space', `${width}px`)
}
syncScrollbarSpace()
window.addEventListener('resize', syncScrollbarSpace, { passive: true })

const menu = document.querySelector('[data-menu]')
const navigation = document.querySelector('#exhibition-nav')
function closeMenu(returnFocus = false) {
  menu.setAttribute('aria-expanded', 'false')
  menu.setAttribute('aria-label', '開啟主要導覽')
  navigation.classList.remove('is-open')
  if (returnFocus) menu.focus()
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true'
  menu.setAttribute('aria-expanded', String(open))
  menu.setAttribute('aria-label', open ? '關閉主要導覽' : '開啟主要導覽')
  navigation.classList.toggle('is-open', open)
  if (open) navigation.querySelector('a').focus()
})
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true)
})
document.addEventListener('click', (event) => {
  if (!event.target.closest('.topbar') && menu.getAttribute('aria-expanded') === 'true') closeMenu()
})
window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu()
})

function goToSection(id, smooth = true, focus = true) {
  const target = document.getElementById(id)
  if (!target) return
  if (target instanceof HTMLDetailsElement) target.open = true
  if (focus) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }
  const inset = target.hasAttribute('data-fullscreen-scene') ? 0 : 24
  const top = scrollport.scrollTop + target.getBoundingClientRect().top - scrollport.getBoundingClientRect().top - inset
  scrollport.scrollTo({ top: Math.max(0, top), behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' })
}
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    if (link.hasAttribute('data-dialog-view')) return
    const id = link.getAttribute('href').slice(1)
    if (!document.getElementById(id)) return
    event.preventDefault()
    closeMenu()
    goToSection(id)
    if (location.hash !== link.hash) history.pushState(null, '', link.hash)
  })
})
function restoreHash() {
  if (location.hash) goToSection(decodeURIComponent(location.hash.slice(1)), false, false)
  else scrollport.scrollTo({ top: 0, behavior: 'instant' })
}
window.addEventListener('popstate', restoreHash)
window.addEventListener('hashchange', restoreHash)
let visitorInteracted = false
for (const event of ['pointerdown', 'keydown', 'wheel', 'touchstart']) {
  window.addEventListener(event, () => { visitorInteracted = true }, { once: true, passive: true })
}
restoreHash()

const navLinks = [...document.querySelectorAll('[data-nav]')]
const sectionObserver = new IntersectionObserver((entries) => {
  entries.filter((entry) => entry.isIntersecting).forEach((entry) => {
    navLinks.forEach((link) => {
      if (link.dataset.nav === entry.target.id) link.setAttribute('aria-current', 'location')
      else link.removeAttribute('aria-current')
    })
  })
}, { root: scrollport, rootMargin: '-15% 0px -60% 0px', threshold: 0 })
document.querySelectorAll('[data-section], [data-fullscreen-scene]').forEach((section) => sectionObserver.observe(section))

const progress = document.querySelector('[data-progress]')
const backTop = document.querySelector('[data-back-top]')
let progressFrame = 0
function updateProgress() {
  if (progressFrame) return
  progressFrame = requestAnimationFrame(() => {
    const max = scrollport.scrollHeight - scrollport.clientHeight
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollport.scrollTop / max)) : 0})`
    backTop.hidden = scrollport.scrollTop < scrollport.clientHeight
    if (scrollport.scrollTop < 500) navLinks.forEach((link) => link.removeAttribute('aria-current'))
    progressFrame = 0
  })
}
scrollport.addEventListener('scroll', updateProgress, { passive: true })
window.addEventListener('resize', updateProgress, { passive: true })
updateProgress()

const chartAnimations = new Map()
const dataFigures = [...document.querySelectorAll('.data-figure, .expense-figure')]
function renderChart(figure, progress) {
  figure.querySelectorAll('[data-count-to]').forEach((number) => {
    const decimals = Number(number.dataset.countDecimals || 0)
    const value = Number(number.dataset.countTo) * progress
    number.textContent = value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  })
  figure.querySelectorAll('.comparison-fill, .expense-track > span').forEach((bar) => {
    bar.style.transform = `scaleX(${progress})`
  })
}

const metrics = {
  computer: {
    low: 27.82, all: 66.96,
    note: '電腦包括桌上型、筆記型與平板。收入較低的 20% 指按收入由低到高排序後，最前面的 20% 家庭。',
    name: '家裡有電腦',
  },
  internet: {
    low: 84.82, all: 96.09,
    note: '收入較低的 20%：把家庭按收入由低到高排列，排在最前面的 20%。所有家庭平均也包含這些家庭。',
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
    for (const [group, value] of [['low', data.low], ['all', data.all]]) {
      const number = document.querySelector(`[data-${group}-value]`)
      number.dataset.countTo = value
      number.closest('strong').setAttribute('aria-label', `${value.toFixed(2)}%`)
      document.querySelector(`[data-${group}-bar]`).style.setProperty('--value', `${value}%`)
    }
    const figure = document.querySelector('#devices .data-figure')
    const animation = chartAnimations.get(figure)
    if (animation) animation.restart()
    else renderChart(figure, 1)
    document.querySelector('[data-device-note]').textContent = data.note
    document.querySelector('[data-metric-announcement]').textContent = `${data.name}，收入較低的 20% 家庭 ${data.low}%，所有家庭平均 ${data.all}%。`
  })
})

const answers = {
  children: [
    '家裡有幾個孩子，會影響要準備幾份用品，以及共用設備的時間怎麼分。練習簿通常一人一本，電腦則可能由兄弟姊妹輪流使用。',
    '假設兩戶家庭一年花在教育上的錢相同，一戶有一名學生，另一戶有三名學生。三名學生可能各自要買書、繳費，也可能同時需要用電腦，家裡就得決定錢怎麼分、時間怎麼排。',
    '所以，同樣一筆家庭開銷，不代表每個孩子能用到相同的東西。看孩子人數，可以幫我們理解家裡要準備幾份用品、哪些設備需要共用。',
  ],
  age: [
    '孩子正在念什麼，會改變寫作業的方式。練習認字、查找資料、製作報告，要用的東西和需要大人幫忙的地方都不一樣。',
    '剛開始學閱讀的孩子，可能需要大人陪讀、解釋生字。要交報告的孩子，則可能需要用電腦整理資料、排版與修改。',
    '家裡要準備的東西也會跟著改變。有時要買書或設備，有時要留時間陪讀、一起解題。了解孩子正在做什麼，才知道錢和時間要花在哪裡。',
  ],
  need: [
    '花得少，有時是因為學校已提供設備或活動，有時則是家裡付不起。兩種情況的金額可能一樣，孩子能做的事卻不同。',
    '例如，兩戶家庭都沒買電腦。一戶的孩子可以在學校用電腦完成報告，另一戶的孩子只能用手機，整理長篇文字比較吃力。兩戶都沒有買電腦的開銷，寫報告的方便程度卻不同。',
    '因此，可以接著問：要交報告時，有沒有合適的設備可用？遇到不懂的題目時，找不找得到人幫忙？這些具體情況，能幫我們理解孩子為什麼寫得順利或卡住。',
  ],
}
const supportAnswers = {
  time: [
    '學校課後照顧讓孩子放學後留在學校，由服務人員照顧生活、協助寫作業。教育部規定，學校辦理時應告知家長，並盡量配合家長的上班時間。',
    '假設家人六點下班，課後照顧五點就結束，中間仍有一小時需要安排。家人從工作地點趕到學校也要時間，報名前要一起考慮。',
    '可以先確認幾點開始、幾點結束、由誰接送。如果結束時間早於家人能到校的時間，就需要再安排其他照顧方式。',
  ],
  places: [
    '學校有開課後照顧班，也有每班的人數限制。依教育部規定，每班以 15 人為原則，最多 25 人。',
    '公立課後照顧班優先招收的對象，包括低收入戶、身心障礙及原住民兒童。符合這些資格的孩子，報名時可以優先安排。',
    '每班最多能收幾人，和學校現在還有沒有名額，是兩件事。家庭可以向學校確認開幾班、何時報名、額滿後怎麼辦，再安排孩子放學後的去處。',
  ],
  cost: [
    '公立學校課後照顧已有費用減免。依教育部規定，低收入戶、身心障礙及原住民兒童免收課後照顧費。其他特殊情況，也可以經評估核准後減免費用。',
    '一般收費由地方主管機關訂定標準，會考量學校怎麼辦理、服務多久與學生人數。因此，各地、各班的費用可能不同。',
    '減免後，家裡要付的課後照顧費會減少。報名前可向學校確認實際金額、是否符合減免資格，以及需要準備哪些證明。',
  ],
}
// All chapter extensions and source notes share one native modal.
const dialog = document.querySelector('#exhibition-dialog')
const dialogBody = dialog.querySelector('.dialog-body')
const dialogTitle = dialog.querySelector('#dialog-title')
const dialogViews = {
  'spending-questions': { title: '看到這筆帳單，你會先問什麼？', template: 'spending-questions', answers },
  'support-access': { title: '學校課後照顧如何安排？', template: 'support-access', answers: supportAnswers, reference: 'https://edu.law.moe.gov.tw/LawContent.aspx?id=GL000660' },
  'source-households': { title: '家庭的電腦、網路與教育開銷', source: '#source-households .source-body' },
  'source-support': { title: '國小開辦課後照顧的情況', source: '#source-support .source-body' },
}
let dialogOpener = null
let backdropPointerDown = false
function syncDialogScrollbarSpace() {
  if (!dialog.open) return
  const width = Math.max(0, dialogBody.offsetWidth - dialogBody.clientWidth)
  dialog.style.setProperty('--dialog-scrollbar-space', `${width}px`)
}
function openDialog(viewKey, opener) {
  const view = dialogViews[viewKey]
  if (!view || dialog.open) return
  dialogOpener = opener
  dialogTitle.textContent = view.title
  if (view.template) {
    dialogBody.replaceChildren(document.getElementById(view.template).content.cloneNode(true))
  } else {
    dialogBody.replaceChildren(...[...document.querySelector(view.source).childNodes].map((node) => node.cloneNode(true)))
  }
  const question = opener.dataset.dialogQuestion
  if (view.answers && Object.hasOwn(view.answers, question)) {
    dialogTitle.textContent = opener.textContent.trim()
    const answer = view.answers[question]
    const paragraphs = (Array.isArray(answer) ? answer : [answer]).map((text) => {
      const paragraph = document.createElement('p')
      const referencePhrase = '教育部規定'
      const referenceIndex = view.reference ? text.indexOf(referencePhrase) : -1
      if (referenceIndex >= 0) {
        const reference = document.createElement('a')
        reference.className = 'inline-source'
        reference.href = view.reference
        reference.target = '_blank'
        reference.rel = 'noreferrer'
        reference.textContent = referencePhrase
        reference.setAttribute('aria-label', '教育部課後照顧服務規定，在新分頁開啟')
        paragraph.append(text.slice(0, referenceIndex), reference, text.slice(referenceIndex + referencePhrase.length))
      } else {
        paragraph.textContent = text
      }
      return paragraph
    })
    dialogBody.querySelector('[data-question-answer]').replaceChildren(...paragraphs)
  }
  closeMenu()
  scrollport.classList.add('is-modal-open')
  dialog.showModal()
  dialogBody.scrollTop = 0
  renderIcons()
  syncDialogScrollbarSpace()
  dialogTitle.focus({ preventScroll: true })
}
document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-dialog-view]')
  if (!opener || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  openDialog(opener.dataset.dialogView, opener)
})
dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close())
dialog.addEventListener('close', () => {
  scrollport.classList.remove('is-modal-open')
  dialogBody.replaceChildren()
  backdropPointerDown = false
  dialogOpener?.focus({ preventScroll: true })
  dialogOpener = null
})
function outsideDialog(event) {
  const rect = dialog.getBoundingClientRect()
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
}
dialog.addEventListener('pointerdown', (event) => { backdropPointerDown = event.target === dialog && outsideDialog(event) })
dialog.addEventListener('click', (event) => {
  if (backdropPointerDown && event.target === dialog && outsideDialog(event)) dialog.close()
  backdropPointerDown = false
})
new ResizeObserver(syncDialogScrollbarSpace).observe(dialogBody)
window.addEventListener('resize', syncDialogScrollbarSpace, { passive: true })

const schoolGrid = document.querySelector('[data-school-grid]')
const schoolCells = document.createDocumentFragment()
for (let index = 0; index < 100; index += 1) {
  const cell = document.createElement('span')
  if (index < 72) cell.className = 'covered'
  schoolCells.append(cell)
}
schoolGrid.append(schoolCells)

const motion = gsap.matchMedia()
pageReady.then((ready) => ready && motion.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.hero-copy > *', { y: 20, opacity: 0, duration: .7, stagger: .09, ease: 'power2.out' })
  gsap.from('.hero-art', { y: 26, opacity: 0, duration: 1.1, ease: 'power2.out', delay: .2 })
  document.querySelectorAll('[data-reveal]').forEach((item) => {
    gsap.fromTo(item, { y: 24, opacity: .45 }, { y: 0, opacity: 1, duration: .65, ease: 'power2.out', immediateRender: false, scrollTrigger: { trigger: item, start: 'top 90%', once: true } })
  })
  dataFigures.forEach((figure) => {
    const state = { progress: 0 }
    const animation = gsap.to(state, {
      progress: 1, duration: 1.1, ease: 'power2.out', paused: true,
      onUpdate: () => renderChart(figure, state.progress),
    })
    chartAnimations.set(figure, animation)
    renderChart(figure, 0)
    const trigger = ScrollTrigger.create({
      trigger: figure, start: 'top 85%', end: 'bottom top',
      onEnter: () => animation.restart(),
      onEnterBack: () => animation.progress(1).pause(),
      onLeave: () => animation.progress(1).pause(),
      onLeaveBack: () => { animation.pause(0); renderChart(figure, 0) },
    })
    // Direct section links may start below an earlier chart.
    if (scrollport.scrollTop >= trigger.end) animation.progress(1).pause()
  })
  return () => {
    chartAnimations.clear()
    dataFigures.forEach((figure) => renderChart(figure, 1))
  }

}))
// The desk stays assembled. Small differences in scroll distance reveal its layers.
pageReady.then((ready) => ready && motion.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  document.querySelectorAll('.hero-layer').forEach((layer) => {
    gsap.to(layer, {
      y: Number(layer.dataset.depth), ease: 'none',
      scrollTrigger: { trigger: '.desk-scene', start: 'top top', end: 'bottom top', scrub: .6 },
    })
  })
}))
// Intrinsic sizes reserve space. Refresh measurements after deferred images resolve.
document.querySelectorAll('main img').forEach((image) => {
  image.addEventListener('load', () => ScrollTrigger.refresh(true), { once: true })
})
let layoutReady = false
pageReady.then((ready) => {
  if (!ready) return
  layoutReady = true
  syncScrollbarSpace()
  ScrollTrigger.refresh()
  if (!visitorInteracted) restoreHash()
  document.documentElement.dataset.loadState = 'ready'
})
new ResizeObserver(() => {
  syncScrollbarSpace()
  updateProgress()
}).observe(scrollport)
// CDN compilation, font loading and ScrollTrigger refreshes can change geometry
// after native hash restoration. Keep the initial link aligned until interaction.
const alignInitialLink = () => {
  if (layoutReady && !visitorInteracted && location.hash) restoreHash()
}
new ResizeObserver(alignInitialLink).observe(document.querySelector('main'))
ScrollTrigger.addEventListener('refresh', alignInitialLink)
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

form.addEventListener('input', () => {
  dirty = [...form.elements].some((field) => {
    if (field instanceof HTMLInputElement && field.type === 'radio') return field.checked
    if (field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) return field.value.length > 0
    return false
  })
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
    submitLabel.textContent = sent ? '已送出' : '送出'
    spinner.hidden = true
  }
})

// Enable submission only after the handler and endpoint are ready.
if (endpoint) {
  submit.disabled = false
  status.textContent = ''
}

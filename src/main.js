import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './style.css'

gsap.registerPlugin(ScrollTrigger)

const metricData = {
  computer: {
    label: '家用電腦普及率',
    definition: '包含桌上型、筆記型及平板電腦',
    note: '這是家戶是否擁有設備的統計，無法看出孩子是否能使用、是否需要共用，或設備是否符合課業需求。',
    low: 27.82,
    all: 66.96,
  },
  internet: {
    label: '家戶上網率',
    definition: '使用電腦或其他設備連網',
    note: '家戶上網率不代表每位孩子都能穩定、適切地使用網路或設備。',
    low: 84.82,
    all: 96.09,
  },
}

const metricTabs = [...document.querySelectorAll('[data-metric]')]
const metricPanel = document.querySelector('#metric-panel')

function selectMetric(key, focus = false) {
  const data = metricData[key]
  if (!data || !metricPanel) return

  metricTabs.forEach((tab) => {
    const selected = tab.dataset.metric === key
    tab.classList.toggle('is-active', selected)
    tab.setAttribute('aria-selected', String(selected))
    tab.tabIndex = selected ? 0 : -1
    if (selected && focus) tab.focus()
  })

  metricPanel.setAttribute('aria-labelledby', `tab-${key}`)
  document.querySelector('[data-metric-label]').textContent = data.label
  document.querySelector('[data-metric-definition]').textContent = data.definition
  document.querySelector('[data-metric-note]').textContent = data.note
  document.querySelector('[data-low-value]').textContent = `${data.low.toFixed(2)}%`
  document.querySelector('[data-all-value]').textContent = `${data.all.toFixed(2)}%`
  document.querySelector('[data-low-bar]').style.setProperty('--bar-value', `${data.low}%`)
  document.querySelector('[data-all-bar]').style.setProperty('--bar-value', `${data.all}%`)
  document.querySelector('[data-bar-comparison]').setAttribute(
    'aria-label',
    `${data.label}：最低所得五分位 ${data.low.toFixed(2)}%，全體家戶 ${data.all.toFixed(2)}%`,
  )
}

metricTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMetric(tab.dataset.metric))
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % metricTabs.length
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + metricTabs.length) % metricTabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = metricTabs.length - 1
    selectMetric(metricTabs[nextIndex].dataset.metric, true)
  })
})

const schoolMatrix = document.querySelector('[data-school-matrix]')
if (schoolMatrix) {
  const cells = document.createDocumentFragment()
  for (let index = 0; index < 100; index += 1) {
    const cell = document.createElement('span')
    cell.className = `school-cell${index < 72 ? ' is-covered' : ''}`
    cells.append(cell)
  }
  schoolMatrix.append(cells)
}

const sections = [...document.querySelectorAll('[data-story-section]')]
const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')]
const scenePanels = [...document.querySelectorAll('[data-scene-panel]')]
const stageDots = [...document.querySelectorAll('[data-stage-dot]')]
const currentChapter = document.querySelector('[data-current-chapter]')
const stageNumber = document.querySelector('[data-stage-number]')

function setActiveChapter(id) {
  const index = sections.findIndex((section) => section.dataset.storySection === id)
  if (index < 0) return

  chapterLinks.forEach((link) => {
    const active = link.dataset.chapterLink === id
    link.classList.toggle('is-active', active)
    if (active) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  })

  scenePanels.forEach((panel) => {
    const active = panel.dataset.scenePanel === id
    panel.classList.toggle('is-active', active)
    panel.setAttribute('aria-hidden', String(!active))
  })
  stageDots.forEach((dot) => dot.classList.toggle('is-active', dot.dataset.stageDot === id))
  if (currentChapter) currentChapter.textContent = String(index + 1).padStart(2, '0')
  if (stageNumber) stageNumber.textContent = `${String(index + 1).padStart(2, '0')} / 03`
}

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
  if (visible) setActiveChapter(visible.target.dataset.storySection)
}, { rootMargin: '-28% 0px -48% 0px', threshold: [0, 0.1, 0.35, 0.6] })

sections.forEach((section) => sectionObserver.observe(section))

const progressBar = document.querySelector('[data-reading-progress]')
let progressFrame = 0
function updateReadingProgress() {
  if (!progressBar) return
  cancelAnimationFrame(progressFrame)
  progressFrame = requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0
    progressBar.style.transform = `scaleX(${progress})`
  })
}
window.addEventListener('scroll', updateReadingProgress, { passive: true })
window.addEventListener('resize', updateReadingProgress)
updateReadingProgress()

const motionMedia = gsap.matchMedia()
motionMedia.add({
  desktop: '(min-width: 901px)',
  motionOK: '(prefers-reduced-motion: no-preference)',
}, (context) => {
  const { desktop, motionOK } = context.conditions
  if (!motionOK) return

  const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
  heroTimeline
    .from('.hero .eyebrow', { y: 12, opacity: 0, duration: 0.45 })
    .from('.hero h1 > span', { yPercent: 45, opacity: 0, duration: 0.72, stagger: 0.12 }, '-=0.2')
    .from('.hero__question, .hero__intro, .round-link', { y: 14, opacity: 0, duration: 0.48, stagger: 0.08 }, '-=0.38')
    .from('.hero-art > *', { y: 12, opacity: 0, duration: 0.55, stagger: 0.035 }, '-=0.5')

  sections.forEach((section) => {
    const chapterId = section.dataset.storySection
    ScrollTrigger.create({
      trigger: section,
      start: 'top 52%',
      end: 'bottom 52%',
      onEnter: () => setActiveChapter(chapterId),
      onEnterBack: () => setActiveChapter(chapterId),
    })

    const revealItems = section.querySelectorAll('.story-section__meta, .eyebrow, h2, .story-lead, .metric-explorer, .expense-chart, .support-stat, .support-facts, .story-aside')
    gsap.fromTo(revealItems,
      { y: 18, opacity: 0.35 },
      {
        y: 0,
        opacity: 1,
        duration: 0.62,
        stagger: 0.035,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      },
    )
  })

  gsap.utils.toArray('.bar-fill, .expense-fill, .support-meter__fill').forEach((bar) => {
    gsap.fromTo(bar, { scaleX: 0 }, {
      scaleX: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: bar, start: 'top 86%', once: true },
    })
  })

  if (desktop) {
    gsap.to('.object-stage__canvas', {
      y: -8,
      ease: 'none',
      scrollTrigger: { trigger: '.exhibition-shell', start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
  }

  gsap.from('.entry-card', {
    y: 28,
    rotate: (index) => [-5, 5, 3][index],
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.entry-section', start: 'top 72%', once: true },
  })

  gsap.from('.closing-ring', {
    scale: 0.72,
    opacity: 0,
    duration: 0.85,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.closing-section', start: 'top 70%', once: true },
  })

  requestAnimationFrame(() => ScrollTrigger.refresh())
})

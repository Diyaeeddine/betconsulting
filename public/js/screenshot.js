class PersistentScreenshotCapture {
    constructor() {
        this.interval = null
        this.isCapturing = false
        this.intervalTime = 60 * 60 * 1000 // 1 hour
        this.intervalTime = 2 * 60 * 1000 // 2 minutes

        this.csrfToken = this.getCSRFToken()
        this.userRole = this.getUserRole()
        this.userId = this.getUserId()
        this.isVisible = true
        this.captureCount = 0
        this.lastActivity = Date.now()
        this.lastCaptureTime = 0
        this.nextCaptureTime = 0
        this.countdownInterval = null
        this.sessionId = this.generateSessionId()
        this.currentUrl = window.location.href
        this.isInitialized = false

        this.loadPersistentState()

        this.log("Persistent Screenshot system initializing...", {
            userRole: this.userRole,
            userId: this.userId,
            sessionId: this.sessionId,
            captureCount: this.captureCount,
            currentUrl: this.currentUrl
        })

        if (!this.isAuthorizedUser()) {
            this.log("User not authorized for screenshots")
            return
        }

        this.initializeSystem()
    }

    initializeSystem() {
        if (this.isInitialized) {
            this.log("System already initialized, skipping...")
            return
        }

        this.log("Initializing persistent screenshot system...")
        this.isInitialized = true

        this.startPersistentCapture()
        this.setupPersistentEventHandlers()
        this.startPersistentCountdown()
        this.startPeriodicSave()
        this.startURLMonitoring()

        this.log("Persistent system fully initialized")
    }

    getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ||
               document.querySelector('input[name="_token"]')?.value ||
               window.Laravel?.csrfToken
    }

    getUserRole() {
        return document.querySelector('meta[name="user-role"]')?.getAttribute("content") ||
               document.body.getAttribute("data-user-role") ||
               window.userRole || "user"
    }

    getUserId() {
        return document.querySelector('meta[name="user-id"]')?.getAttribute("content") ||
               window.userId
    }

    isAuthorizedUser() {
        const authorizedServices = [
            "marches-marketing", "etudes-techniques", "suivi-controle", 
            "qualite-audit", "innovation-transition", "financier-comptabilite",
            "logistique-generaux", "communication-digitale", "juridique", 
            "fournisseurs-traitants"
        ]
        return authorizedServices.includes(this.userRole) && !["admin", "ressources-humaines"].includes(this.userRole)
    }

    startURLMonitoring() {
        let currentUrl = window.location.href

        const checkUrlChange = () => {
            if (window.location.href !== currentUrl) {
                const oldUrl = currentUrl
                currentUrl = window.location.href
                this.currentUrl = currentUrl

                this.log("URL changed:", { from: oldUrl, to: currentUrl })
                this.updateMetadata()
                this.savePersistentState()
                this.updateCounterDisplay()
            }
        }

        setInterval(checkUrlChange, 2000)
        window.addEventListener('popstate', checkUrlChange)
        window.addEventListener('pushstate', checkUrlChange)
        window.addEventListener('replacestate', checkUrlChange)

        const originalPushState = history.pushState
        const originalReplaceState = history.replaceState

        history.pushState = function(...args) {
            originalPushState.apply(history, args)
            setTimeout(checkUrlChange, 100)
        }

        history.replaceState = function(...args) {
            originalReplaceState.apply(history, args)
            setTimeout(checkUrlChange, 100)
        }
    }

    updateMetadata() {
        const newToken = this.getCSRFToken()
        if (newToken && newToken !== this.csrfToken) {
            this.csrfToken = newToken
            this.log("CSRF token updated")
        }

        const newRole = this.getUserRole()
        const newUserId = this.getUserId()

        if (newRole !== this.userRole || newUserId !== this.userId) {
            this.userRole = newRole
            this.userId = newUserId
            this.log("User metadata updated:", { role: newRole, id: newUserId })
        }
    }

    startPersistentCapture() {
        if (this.interval) {
            this.log("Capture already running, skipping start")
            return
        }

        this.log("Starting persistent capture system")
        this.updateStatus('Actif', 'bg-green-500')

        if (this.nextCaptureTime === 0) {
            this.nextCaptureTime = Date.now() + this.intervalTime
            this.log("Next capture scheduled in 1 hour")
        }

        this.interval = setInterval(() => {
            if (this.isAuthorizedUser() && this.isVisible && Date.now() >= this.nextCaptureTime) {
                const randomOffset = Math.random() * 3000
                setTimeout(() => {
                    this.performCapture("periodic")
                }, randomOffset)
            }
        }, 30000)

        this.log("Persistent capture system started")
    }

    setupPersistentEventHandlers() {
        this.log("Setting up persistent event handlers")

        const handleVisibilityChange = () => {
            this.isVisible = !document.hidden
            this.log("Visibility changed:", this.isVisible ? "visible" : "hidden")

            if (!document.hidden) {
                this.lastActivity = Date.now()
                if (!this.interval && this.isAuthorizedUser()) {
                    this.startPersistentCapture()
                }
                this.updateCounterDisplay()
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true })

        const updateActivity = () => {
            this.lastActivity = Date.now()
        }

        const events = ["click", "keydown", "scroll", "mousemove", "touchstart", "focus"]
        events.forEach((event) => {
            document.addEventListener(event, updateActivity, { passive: true, capture: false })
        })

        const handleBeforeUnload = () => {
            this.savePersistentState()
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('pagehide', handleBeforeUnload)

        window.addEventListener('focus', () => {
            this.isVisible = true
            this.lastActivity = Date.now()
            this.updateCounterDisplay()
        })

        window.addEventListener('blur', () => {
            this.savePersistentState()
        })

        window.addEventListener('DOMContentLoaded', () => {
            this.updateCounterDisplay()
        })
    }

    async performCapture(trigger = "manual") {
        if (this.isCapturing) {
            this.log("Capture already in progress, skipping")
            return false
        }

        if (!this.isAuthorizedUser()) {
            this.log("User not authorized, skipping capture")
            return false
        }

        if (typeof window.html2canvas === "undefined") {
            this.log("html2canvas not available, skipping capture")
            return false
        }

        this.log(`Starting capture #${this.captureCount + 1} (trigger: ${trigger})`)
        this.isCapturing = true
        this.updateStatus('Capture...', 'bg-blue-500 animate-pulse')

        try {
            const canvas = await this.captureFullPage()
            if (!canvas) {
                throw new Error("Failed to create canvas")
            }

            this.log("Canvas created:", `${canvas.width}x${canvas.height}`)

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (result) => {
                        if (result && result.size > 1000) {
                            resolve(result)
                        } else {
                            reject(new Error("Blob too small or invalid"))
                        }
                    },
                    "image/jpeg",
                    0.85
                )
            })

            this.log("Blob created, size:", this.formatBytes(blob.size))

            const success = await this.sendScreenshot(blob, trigger)
            if (success) {
                this.captureCount++
                this.lastCaptureTime = Date.now()
                this.nextCaptureTime = Date.now() + this.intervalTime
                this.log(`Screenshot sent successfully (#${this.captureCount})`)
                this.updateCounterDisplay()
                this.updateStatus('Actif', 'bg-green-500')
                this.savePersistentState()
                return true
            } else {
                this.error("Failed to send screenshot")
                this.updateStatus('Erreur', 'bg-red-500')
                return false
            }

        } catch (error) {
            this.error("Capture error:", error.message)
            this.updateStatus('Erreur', 'bg-red-500')
            return false
        } finally {
            this.isCapturing = false
            setTimeout(() => {
                this.updateStatus('Actif', 'bg-green-500')
            }, 3000)
        }
    }

    startPersistentCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
        }

        this.countdownInterval = setInterval(() => {
            if (this.nextCaptureTime > 0) {
                const timeLeft = Math.max(0, this.nextCaptureTime - Date.now())

                if (timeLeft <= 0) {
                    this.updateCountdown("Prêt")
                } else {
                    if (timeLeft > 3600000) {
                        const hours = Math.floor(timeLeft / 3600000)
                        const mins = Math.floor((timeLeft % 3600000) / 60000)
                        this.updateCountdown(`${hours}h${mins.toString().padStart(2, '0')}m`)
                    } else if (timeLeft > 60000) {
                        const minutes = Math.floor(timeLeft / 60000)
                        const seconds = Math.floor((timeLeft % 60000) / 1000)
                        this.updateCountdown(`${minutes}m${seconds.toString().padStart(2, '0')}s`)
                    } else {
                        const seconds = Math.floor(timeLeft / 1000)
                        this.updateCountdown(`${seconds}s`)
                    }
                }
            } else {
                this.updateCountdown("Initialisation...")
            }
        }, 1000)
    }

    startPeriodicSave() {
        setInterval(() => {
            this.savePersistentState()
        }, 30000)
    }

    generateSessionId() {
        return 'persistent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    loadPersistentState() {
        const storageKey = `persistent_screenshot_${this.userRole}_${this.userId}`
        try {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const state = JSON.parse(saved)
                this.captureCount = state.captureCount || 0
                this.lastCaptureTime = state.lastCaptureTime || 0
                this.lastActivity = state.lastActivity || Date.now()
                this.nextCaptureTime = state.nextCaptureTime || 0

                if (this.nextCaptureTime <= Date.now()) {
                    this.nextCaptureTime = Date.now() + this.intervalTime
                }

                const sessionAge = Date.now() - (state.sessionStart || 0)
                if (sessionAge > 8 * 60 * 60 * 1000) {
                    this.resetPersistentState()
                } else {
                    this.log("Loaded persistent state:", state)
                }
            } else {
                this.resetPersistentState()
            }
        } catch (error) {
            this.error("Error loading persistent state:", error)
            this.resetPersistentState()
        }
    }

    resetPersistentState() {
        this.captureCount = 0
        this.lastCaptureTime = 0
        this.lastActivity = Date.now()
        this.nextCaptureTime = Date.now() + this.intervalTime
        this.savePersistentState()
        this.log("Persistent state reset - next capture in 1 hour")
    }

    savePersistentState() {
        const storageKey = `persistent_screenshot_${this.userRole}_${this.userId}`
        try {
            const state = {
                captureCount: this.captureCount,
                lastCaptureTime: this.lastCaptureTime,
                lastActivity: this.lastActivity,
                nextCaptureTime: this.nextCaptureTime,
                sessionId: this.sessionId,
                sessionStart: this.sessionStart || Date.now(),
                userRole: this.userRole,
                userId: this.userId,
                lastUrl: window.location.href,
                lastSave: Date.now()
            }
            localStorage.setItem(storageKey, JSON.stringify(state))
        } catch (error) {
            this.error("Error saving persistent state:", error)
        }
    }

    updateCounterDisplay() {
        const captureCountElement = document.getElementById("capture-count")
        if (captureCountElement) {
            captureCountElement.textContent = this.captureCount.toString()
        }

        this.updateStatus('Actif', 'bg-green-500')
        this.log(`Counter display updated: ${this.captureCount} captures`)
    }

    updateStatus(text, colorClass) {
        const statusText = document.getElementById("status-text")
        const statusDot = document.getElementById("status-dot")
        if (statusText) statusText.textContent = text
        if (statusDot) statusDot.className = `w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorClass}`
    }

    updateCountdown(text) {
        const countdownElement = document.getElementById("countdown-text")
        if (countdownElement) countdownElement.textContent = text
    }

    formatBytes(bytes) {
        if (bytes === 0) return "0 B"
        const k = 1024
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    log(message, data = null) {
        if (window.location.hostname === "localhost" || window.location.hostname.includes("dev")) {
            console.log(`[PersistentCapture] ${message}`, data || "")
        }
    }

    error(message, data = null) {
        console.error(`[PersistentCapture] ${message}`, data || "")
    }

    testCapture() {
        this.log("Manual test capture triggered")
        this.performCapture("manual_test")
    }

    getStats() {
        const nextCaptureIn = this.nextCaptureTime ? Math.max(0, this.nextCaptureTime - Date.now()) : 0
        return {
            captureCount: this.captureCount,
            userRole: this.userRole,
            isCapturing: this.isCapturing,
            isVisible: this.isVisible,
            isInitialized: this.isInitialized,
            intervalActive: !!this.interval,
            sessionId: this.sessionId,
            currentUrl: this.currentUrl,
            lastCaptureTime: this.lastCaptureTime ? new Date(this.lastCaptureTime).toLocaleTimeString() : "Never",
            nextCaptureIn: nextCaptureIn > 0 ? Math.round(nextCaptureIn / 1000) + "s" : "Ready",
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        }
    }

    destroy() {
        this.log("Destroying persistent screenshot system...")
        if (this.interval) {
            clearInterval(this.interval)
            this.interval = null
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
            this.countdownInterval = null
        }
        this.savePersistentState()
        this.isCapturing = false
        this.isInitialized = false
    }

    async captureFullPage() {
        try {
            this.log("Starting full page capture...")

            const elementsToHide = document.querySelectorAll(`
                #screenshot-status,
                #admin-control-panel,
                .modal,
                .dropdown,
                .tooltip,
                .popover,
                .notification,
                .alert,
                [data-screenshot-ignore]
            `)

            const originalStyles = []
            elementsToHide.forEach((el, index) => {
                if (el) {
                    originalStyles[index] = {
                        visibility: el.style.visibility,
                        display: el.style.display,
                        opacity: el.style.opacity,
                    }
                    el.style.visibility = "hidden"
                    el.style.opacity = "0"
                }
            })

            await new Promise((resolve) => setTimeout(resolve, 200))

            const originalScrollX = window.scrollX
            const originalScrollY = window.scrollY

            const body = document.body
            const html = document.documentElement

            const pageWidth = Math.max(
                body.scrollWidth, body.offsetWidth,
                html.clientWidth, html.scrollWidth, html.offsetWidth,
                window.innerWidth
            )

            const pageHeight = Math.max(
                body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight,
                window.innerHeight
            )

            this.log("Page dimensions:", `${pageWidth}x${pageHeight}`)

            const options = {
                useCORS: true,
                allowTaint: false,
                scale: this.getOptimalScale(pageWidth, pageHeight),
                width: pageWidth,
                height: pageHeight,
                scrollX: 0,
                scrollY: 0,
                backgroundColor: "#ffffff",
                logging: false,
                timeout: 25000,
                foreignObjectRendering: false,
                imageTimeout: 4000,
                onclone: (clonedDoc) => {
                    this.optimizeClonedDocument(clonedDoc)
                },
                ignoreElements: (element) => {
                    return this.shouldIgnoreElement(element)
                },
            }

            let canvas
            try {
                canvas = await window.html2canvas(document.documentElement, options)
                this.log("html2canvas completed successfully")
            } catch (error) {
                this.error("html2canvas failed, trying fallback:", error)

                const fallbackOptions = {
                    useCORS: false,
                    allowTaint: true,
                    scale: 0.6,
                    width: Math.min(pageWidth, 2000),
                    height: Math.min(pageHeight, 3000),
                    backgroundColor: "#ffffff",
                    logging: false,
                    timeout: 15000,
                }

                canvas = await window.html2canvas(document.body, fallbackOptions)
                this.log("Fallback capture completed")
            }

            window.scrollTo(originalScrollX, originalScrollY)

            elementsToHide.forEach((el, index) => {
                if (el && originalStyles[index]) {
                    el.style.visibility = originalStyles[index].visibility
                    el.style.display = originalStyles[index].display
                    el.style.opacity = originalStyles[index].opacity
                }
            })

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error("Canvas is empty or invalid")
            }

            return this.optimizeCanvasSize(canvas)

        } catch (error) {
            this.error("Complete capture failure:", error)
            return this.createEmergencyCanvas()
        }
    }

    getOptimalScale(width, height) {
        const maxWidth = 3500
        const maxHeight = 5000

        const scaleX = width > maxWidth ? maxWidth / width : 1
        const scaleY = height > maxHeight ? maxHeight / height : 1
        const scale = Math.min(scaleX, scaleY, 1)

        const screenWidth = window.screen.width
        if (screenWidth <= 768) {
            return Math.min(scale, 0.7)
        } else if (screenWidth <= 1024) {
            return Math.min(scale, 0.8)
        } else {
            return Math.min(scale, 0.9)
        }
    }

    optimizeCanvasSize(originalCanvas) {
        const maxDimension = 3500

        if (originalCanvas.width <= maxDimension && originalCanvas.height <= maxDimension) {
            return originalCanvas
        }

        const aspectRatio = originalCanvas.width / originalCanvas.height
        let newWidth, newHeight

        if (originalCanvas.width > originalCanvas.height) {
            newWidth = Math.min(originalCanvas.width, maxDimension)
            newHeight = newWidth / aspectRatio
        } else {
            newHeight = Math.min(originalCanvas.height, maxDimension)
            newWidth = newHeight * aspectRatio
        }

        const resizedCanvas = document.createElement('canvas')
        resizedCanvas.width = Math.round(newWidth)
        resizedCanvas.height = Math.round(newHeight)

        const ctx = resizedCanvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(originalCanvas, 0, 0, newWidth, newHeight)

        this.log("Canvas optimized:", `${originalCanvas.width}x${originalCanvas.height} → ${newWidth}x${newHeight}`)
        return resizedCanvas
    }

    optimizeClonedDocument(clonedDoc) {
        const scripts = clonedDoc.querySelectorAll("script, noscript")
        scripts.forEach((script) => script.remove())

        const problematicElements = clonedDoc.querySelectorAll("iframe, embed, object, video, audio")
        problematicElements.forEach((el) => el.remove())

        const inputs = clonedDoc.querySelectorAll("input, textarea, select")
        inputs.forEach((input) => {
            if (input.type !== 'hidden') {
                input.removeAttribute('value')
                input.value = ''
            }
        })
    }

    shouldIgnoreElement(element) {
        if (!element || !element.tagName) return true

        const tagName = element.tagName.toLowerCase()
        const className = element.className || ""
        const id = element.id || ""

        return (
            id === "screenshot-status" ||
            id === "admin-control-panel" ||
            element.hasAttribute('data-screenshot-ignore') ||
            tagName === "script" ||
            tagName === "noscript" ||
            tagName === "iframe" ||
            tagName === "embed" ||
            tagName === "object" ||
            tagName === "video" ||
            tagName === "audio" ||
            className.includes("modal") ||
            className.includes("dropdown") ||
            className.includes("tooltip") ||
            className.includes("popover") ||
            className.includes("notification") ||
            className.includes("alert") ||
            (element.style.position === "fixed" && !element.closest(".main-content"))
        )
    }

    createEmergencyCanvas() {
        try {
            const canvas = document.createElement("canvas")
            canvas.width = 1200
            canvas.height = 800
            const ctx = canvas.getContext("2d")

            ctx.fillStyle = "#ffffff"
            ctx.fillRect(0, 0, 1200, 800)

            ctx.fillStyle = "#1f2937"
            ctx.fillRect(0, 0, 1200, 80)

            ctx.fillStyle = "#ffffff"
            ctx.font = "bold 24px Arial"
            ctx.textAlign = "center"
            ctx.fillText("Capture d'urgence - " + new Date().toLocaleString(), 600, 35)
            ctx.fillText("Service: " + this.userRole.toUpperCase(), 600, 65)

            ctx.fillStyle = "#374151"
            ctx.font = "16px Arial"
            ctx.textAlign = "left"

            const info = [
                "URL: " + window.location.href,
                "Titre: " + document.title,
                "Navigateur: " + navigator.userAgent.substring(0, 80) + "...",
                "Résolution: " + window.innerWidth + "x" + window.innerHeight,
                "Timestamp: " + new Date().toISOString(),
                "Utilisateur: " + this.userRole + " (ID: " + this.userId + ")",
                "Capture #: " + (this.captureCount + 1),
            ]

            info.forEach((line, index) => {
                ctx.fillText(line, 50, 120 + index * 25)
            })

            return canvas
        } catch (error) {
            this.error("Emergency capture failed:", error)
            return null
        }
    }

    async sendScreenshot(blob, trigger = "manual") {
        try {
            const formData = new FormData()
            formData.append("screenshot", blob, `screenshot_${this.userRole}_${Date.now()}.jpg`)
            formData.append("timestamp", new Date().toISOString())
            formData.append("url", window.location.href)
            formData.append("user_agent", navigator.userAgent)
            formData.append("viewport_size", `${window.innerWidth}x${window.innerHeight}`)
            formData.append("page_title", document.title)
            formData.append("capture_type", "persistent_fullpage")
            formData.append("session_id", this.sessionId)
            formData.append("capture_count", this.captureCount.toString())
            formData.append("trigger", trigger)

            this.log("Sending screenshot to API...")

            const response = await fetch("/api/screenshots", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-TOKEN": this.csrfToken,
                    Accept: "application/json",
                },
                credentials: "same-origin",
            })

            if (response.ok) {
                const result = await response.json()
                this.log("API Response:", result)
                return result.success
            } else {
                const errorText = await response.text()
                this.error("API Error:", `${response.status} - ${errorText}`)
            }

            return false
        } catch (error) {
            this.error("Send error:", error)
            return false
        }
    }
}

(function() {
    let screenshotSystem = null

    function initializeScreenshotSystem() {
        if (screenshotSystem && screenshotSystem.isInitialized) {
            console.log('[PersistentCapture] System already running, skipping initialization')
            return
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
        const userRole = document.querySelector('meta[name="user-role"]')?.getAttribute("content")
        const authorizedServices = [
            "marches-marketing", "etudes-techniques", "suivi-controle", 
            "qualite-audit", "innovation-transition", "financier-comptabilite",
            "logistique-generaux", "communication-digitale", "juridique", 
            "fournisseurs-traitants"
        ]

        console.log('🚀 Persistent Screenshot.js loaded')
        console.log('User check:', {
            hasToken: !!csrfToken,
            userRole: userRole,
            isAuthorized: authorizedServices.includes(userRole),
            isNotViewer: !["admin", "ressources-humaines"].includes(userRole)
        })

        if (csrfToken && authorizedServices.includes(userRole) && !["admin", "ressources-humaines"].includes(userRole)) {
            console.log('✅ Initializing persistent screenshot system for:', userRole)
            const waitForHtml2Canvas = () => {
                if (typeof window.html2canvas !== "undefined") {
                    screenshotSystem = new PersistentScreenshotCapture()
                    window.persistentScreenshot = screenshotSystem
                    if (window.location.hostname === "localhost" || window.location.hostname.includes("dev")) {
                        window.testScreenshot = () => screenshotSystem?.testCapture()
                        window.screenshotStats = () => screenshotSystem && console.table(screenshotSystem.getStats())
                        window.clearScreenshotData = () => {
                            const storageKey = `persistent_screenshot_${userRole}_${document.querySelector('meta[name="user-id"]')?.getAttribute("content")}`
                            localStorage.removeItem(storageKey)
                            console.log("Persistent screenshot data cleared")
                        }
                    }
                } else {
                    console.log('Waiting for html2canvas...')
                    setTimeout(waitForHtml2Canvas, 500)
                }
            }

            waitForHtml2Canvas()
        } else {
            console.log('❌ Persistent screenshot system not initialized - user not authorized')
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScreenshotSystem)
    } else {
        initializeScreenshotSystem()
    }

    window.addEventListener("beforeunload", () => {
        if (screenshotSystem) {
            screenshotSystem.savePersistentState()
        }
    })
})()
import { GestureRecognizer, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision"

export class Rocon {
  flip: HTMLButtonElement
  video: HTMLVideoElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  drawing: DrawingUtils
  facingMode: 'user' | 'environment'
  running: boolean
  private gestureRecognizer!: GestureRecognizer
  onResult?: (gesture: string) => void
  lastResult?: string

  constructor(app: Element) {
    this.flip = app.querySelector('#flip')!
    this.video = app.querySelector('#video')!
    this.canvas = app.querySelector('#canvas')!
    this.ctx = this.canvas.getContext('2d')!
    this.drawing = new DrawingUtils(this.ctx)
    this.running = false
    this.facingMode = 'user'
    this.flip.onclick = () =>
      this.switch(this.facingMode === 'user' ? 'environment' : 'user')
  }

  private onFrame() {
    if (!this.running) return
    const result = this.gestureRecognizer.recognizeForVideo(this.video, Date.now())
    if (result.gestures.length > 0 &&
      this.lastResult !== result.gestures[0][0].categoryName) {
      this.lastResult = result.gestures[0][0].categoryName
      if (this.onResult) this.onResult(this.lastResult)
    }
    this.ctx.save()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    if (result.landmarks)
      for (const landmarks of result.landmarks) {
        this.drawing.drawConnectors(landmarks,
          GestureRecognizer.HAND_CONNECTIONS, { color: '#31748f', lineWidth: 5 })
        this.drawing.drawLandmarks(landmarks, { color: '#eb6f92', lineWidth: 2 })
      }
    this.ctx.restore()
    requestAnimationFrame(() => this.onFrame())
  }

  clearCanvas() {
    this.ctx.save()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.restore()
  }

  async switch(facingMode: 'user' | 'environment') {
    this.running = false
    this.clearCanvas()
    if (this.video.srcObject)
      (this.video.srcObject as MediaStream).getTracks()
        .forEach(track => track.stop());
    this.video.srcObject = await navigator.mediaDevices
      // @ts-expect-error
      .getUserMedia({ video: { facingMode: facingMode, torch: true } })
    this.facingMode = facingMode
    this.running = true
  }

  async start() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm")
    this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/gesture_recognizer.task",
        delegate: "GPU"
      }, runningMode: "VIDEO",
    })
    this.video.onloadeddata = () => {
      this.canvas.width = this.video.videoWidth
      this.canvas.height = this.video.videoHeight
      requestAnimationFrame(() => this.onFrame())
    }
    this.switch(this.facingMode)
  }
}

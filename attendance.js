// ===== SMART ATTENDANCE — LIVE BROWSER DEMO =====
// Runs entirely client-side using face-api.js (TensorFlow.js under the hood).
// Mirrors the original Python project: register a face, then get auto-detected
// and "marked present" on every subsequent frame, just like the OpenCV script.

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
const MATCH_THRESHOLD = 0.55;

let modelsLoaded = false;
let attendanceStream = null;
let attendanceLoopId = null;
let registeredFaces = [];   // [{ name, descriptor }]
let markedNames = new Set();

const attendanceOverlay = document.getElementById('attendanceOverlay');
const attendanceVideo   = document.getElementById('attendanceVideo');
const attendanceCanvas  = document.getElementById('attendanceCanvas');
const attendanceStatus  = document.getElementById('attendanceStatus');
const attendanceLogList = document.getElementById('attendanceLogList');

async function loadFaceModels() {
  if (modelsLoaded) return;
  attendanceStatus.textContent = 'Loading face recognition models…';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

async function openAttendance() {
  attendanceOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  attendanceStatus.textContent = 'Requesting camera access…';

  try {
    attendanceStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    attendanceVideo.srcObject = attendanceStream;
    await attendanceVideo.play();
  } catch (err) {
    attendanceStatus.textContent = '⚠️ Camera access denied or unavailable.';
    return;
  }

  try {
    await loadFaceModels();
  } catch (err) {
    attendanceStatus.textContent = '⚠️ Failed to load face models. Check your connection.';
    return;
  }

  attendanceStatus.textContent = registeredFaces.length
    ? 'Looking for registered faces…'
    : 'Enter your name and click "Register Face" to begin.';

  runAttendanceLoop();
}

function closeAttendance(e) {
  if (e && e.target !== attendanceOverlay) return;
  attendanceOverlay.classList.remove('open');
  document.body.style.overflow = '';
  if (attendanceLoopId) { cancelAnimationFrame(attendanceLoopId); attendanceLoopId = null; }
  if (attendanceStream) {
    attendanceStream.getTracks().forEach(track => track.stop());
    attendanceStream = null;
  }
}

async function runAttendanceLoop() {
  if (!attendanceOverlay.classList.contains('open')) return;

  const displaySize = { width: attendanceVideo.clientWidth, height: attendanceVideo.clientHeight };
  attendanceCanvas.width = displaySize.width;
  attendanceCanvas.height = displaySize.height;
  const ctx = attendanceCanvas.getContext('2d');

  if (attendanceVideo.readyState === 4 && modelsLoaded) {
    const detections = await faceapi
      .detectAllFaces(attendanceVideo, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
      .withFaceDescriptors();

    const resized = faceapi.resizeResults(detections, displaySize);
    ctx.clearRect(0, 0, displaySize.width, displaySize.height);

    resized.forEach(det => {
      const { x, y, width, height } = det.detection.box;
      let bestMatch = null;
      let bestDist = Infinity;

      registeredFaces.forEach(face => {
        const dist = faceapi.euclideanDistance(det.descriptor, face.descriptor);
        if (dist < bestDist) { bestDist = dist; bestMatch = face; }
      });

      const isMatch = bestMatch && bestDist < MATCH_THRESHOLD;
      const color = isMatch ? '#10b981' : '#f59e0b';
      const label = isMatch ? bestMatch.name.toUpperCase() : 'UNKNOWN';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = color;
      ctx.fillRect(x, y + height, width, 24);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 6, y + height + 17);

      if (isMatch) markAttendance(bestMatch.name);
    });

    if (registeredFaces.length) {
      attendanceStatus.textContent = resized.length
        ? `${resized.length} face(s) detected — matching in progress…`
        : 'Looking for a face…';
    }
  }

  attendanceLoopId = requestAnimationFrame(runAttendanceLoop);
}

async function registerFace() {
  const nameInput = document.getElementById('attendanceNameInput');
  const name = nameInput.value.trim().slice(0, 40);
  if (!name) {
    attendanceStatus.textContent = '⚠️ Type your name first.';
    return;
  }
  if (!modelsLoaded) {
    attendanceStatus.textContent = 'Models still loading, please wait…';
    return;
  }

  attendanceStatus.textContent = 'Capturing your face… look at the camera.';

  const detection = await faceapi
    .detectSingleFace(attendanceVideo, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection) {
    attendanceStatus.textContent = '⚠️ No face detected. Move closer and try again.';
    return;
  }

  registeredFaces.push({ name, descriptor: detection.descriptor });
  nameInput.value = '';
  attendanceStatus.textContent = `✅ Registered "${name}". Now stay in frame to get marked present.`;
}

function markAttendance(name) {
  if (markedNames.has(name)) return;
  markedNames.add(name);

  const emptyMsg = attendanceLogList.querySelector('.attendance-empty');
  if (emptyMsg) emptyMsg.remove();

  const entry = document.createElement('div');
  entry.className = 'attendance-entry';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'name';
  nameSpan.textContent = `✅ ${name.toUpperCase()}`;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'time';
  timeSpan.textContent = new Date().toLocaleTimeString();

  entry.append(nameSpan, timeSpan);
  attendanceLogList.prepend(entry);
}

function resetAttendance() {
  registeredFaces = [];
  markedNames = new Set();
  attendanceLogList.innerHTML = '<p class="attendance-empty">No one\'s checked in yet — register your face above.</p>';
  attendanceStatus.textContent = 'Enter your name and click "Register Face" to begin.';
}
